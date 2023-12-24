import ASLevel from '../../levels/ASLevel/ASLevel';
import ASModel from '../ASModel/ASModel';
import IModel from '../Model/IModel';
import IModelAnimationsManager from '../Model/ModelAnimationsManager/IModelAnimationsManager';
import Tarian from '../Tarian/Tarian';

/**
 * A shocker, that moves down the track to shock the player
 */
export default class Shocker extends ASModel
{
    /**
     * The damage flash image for this shocker's damage (for the HUD damage flash)
     */
    damageFlashImage:HTMLImageElement;
    
    /**
     * The color of the shocker (also determines its width, as the purple shocker is wider)
     */
    color:string;
    
    /**
     * The mode of the shocker
     * "static" means it will move straight; 
     * "sweep" means it will move back and forth on the x axis while moving towards the player; 
     * "home" means it will try and home in on the player
     */
    mode:shockerModes;
    
    /**
     * The player model, used when in "home" mode
     */
    homingTarget:Tarian|null;
    
    private _homingZStart:number; // At what z position should the homing movement begin (in "home" mode)
    
    /**
     * Constructor
     * @param color the color of the shocker (also determines its width, as the purple is wider)
     * @param mode The shocker's mode. "static" means it will move straight; "sweep" means it will move back and forth
     * on the x axis while moving towards you; "home" means it will try and home in on the player
     * @param playerModel The player model. This can be null, as it is only needed for "home" mode
     * @param speedX The x speed of the shocker. This needs to be quite high (1000-2000+) for sweeping, but 
     * much less for the homing
     */
    constructor(color:string, mode:shockerModes, playerModel:Tarian|null = null, speedX:number = 0)
    {
        super();
        
        this.color = color;
        this.mode = mode;
        this.homingTarget = playerModel;
		this.damageDealt = 2;
        
        this.state = "shock";
        this.xSpeed = speedX;
        
		this._homingZStart = 200; //If in "home" mode, at what Z position do we start homing?
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
		
        const spritesheetPath = "/assets/models/Shocker/anim/shocker-" + this.color + "-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
		let width;
		let frameCoordinates;
		
		if(this.color === "purple")
		{
			width = 300;
			frameCoordinates = [
				{ x: 0, y: 0, width: 783, height: 476 },
				{ x: 0, y: 475, width: 783, height: 476 },
				{ x: 0, y: 953, width: 783, height: 476 },
			];
		}
		else
		{
			width = 100;
			frameCoordinates = [
				{ x: 0, y: 0, width: 131, height: 238 },
				{ x: 0, y: 239, width: 131, height: 238 },
				{ x: 0, y: 478, width: 131, height: 238 },
			];
		}
        
        this.animationManager.registerAnimations({
            shock: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                frameCoordinates,
                fps: 24,
                drawWidth: width,
                drawHeight: 340,
            })
        });
        
        const damageFlashSpritesheet = "/assets/HUDs/components/DamageFlash/images/yellow.png";
        this.damageFlashImage = this.kernel.loadImage(damageFlashSpritesheet);
        this.assetsToUnload.push(damageFlashSpritesheet);
    }
    
    prepare():void
    {
        super.prepare();
        
        this.setYPositionFromBottom(this.height);
        this.z = this.helpers.zCalc.vPointDepth;
        
        this.active = false;
        
        if(this.mode == "sweep")
            this._setRandomXDirection();
    }
    
    act():void
    {
        this._setZSpeedBasedOnLevelSpeed();
		
		// Not using this.moveOut(), as the levelspeed is being reset based on fps -- thus this 
        // is as well (after the above method call)
        this.z -= this.zSpeed;
		
        if(this.z < 0)
            this.active = false;
		
        const currentXSpeed = (this.mode == "home") ? this._getHomingMovementXSpeed() : this.xSpeed;
		this.moveRight(currentXSpeed); // This may be negative (which would be left movement)
    }
	
    /**
     * Sets the xSpeed to a random direction
     */
    private _setRandomXDirection():void
    {
        let directionMultiplier = ((Math.round(Math.random())) * 2) - 1; // 1 or -1
        
        this.xSpeed = directionMultiplier * this.xSpeed;
    }
    
    /**
     * Corrects the z speed of the shocker (based on the speed of the level). 
     * We want the shockers to fly off into the distance if the level stops moving.
     */
	private _setZSpeedBasedOnLevelSpeed():void
	{
        const level = this.kernel.level as ASLevel;
        
		if(!level.levelMoving)
            this.zSpeed = -(this.helpers.zCalc.speed(level.maxLevelSpeedRaw, this.kernel.fps) / 1.5);
        else
            this.zSpeed = level.levelSpeed / 1.5;
	}
	
    /**
     * Calculates the correct x speed for homing in on the player
     * @returns The correct x speed
     */
	private _getHomingMovementXSpeed():number
	{
        const player = this.homingTarget;
        
		if(!player || this.z > this._homingZStart) // If no player, or too far away from the player
			return 0;
		
		const homingSpeed = 100 / this.xSpeed;
		
        const playerCenter = (player.x + (player.width / 2));
        const shockerCenter = (this.x + (this.width / 2));
        
		return (playerCenter - shockerCenter) / homingSpeed;
	}
	
	
    // Events -------------------------------------------------------------------
    
    zCollisionEventAction(otherModel:IModel):void
    {
        //This method doesn't need to do anything.
        //However, in order to register the event, this needs to exist
    }
    
    extraEvents():void
    {
        // Check for leaving the game area
        const leavingLeftEdge = (this.x < this.levelLeftEdge);
        const leavingRightEdge = (this.x + this.width > this.levelRightEdge);
        
        if(leavingLeftEdge || leavingRightEdge)
        {
            this.xSpeed = -this.xSpeed;
            this.moveRight(this.xSpeed);
        }
    }
}

/**
 * The possible modes for a shocker
 */
export type shockerModes = "static"|"sweep"|"home";