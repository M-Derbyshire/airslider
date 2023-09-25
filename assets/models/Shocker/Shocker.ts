import ASLevel from '../../levels/ASLevel/ASLevel';
import ASModel from '../ASModel/ASModel';
import IModel from '../Model/IModel';
import IModelAnimationsManager from '../Model/ModelAnimationsManager/IModelAnimationsManager';
import Tarian from '../Tarian/Tarian';

/**
 * A shocker, that moves on the track to shock the player
 */
export default class Shocker extends ASModel
{
    /**
     * The damage flash image for this shocker's damage
     */
    damageFlashImage:HTMLImageElement;
    
    /**
     * The color of the shocker (also determines its width)
     */
    color:string;
    
    /**
     * The mode of the shocker
     * "static" means it will move straight; "sweep" means it will move back and forth
     * on the x axis while moving towards you; "home" means it will try and home on the player
     */
    mode:shockerModes;
    
    /**
     * The player model, used when in "home" mode
     */
    homingTarget:Tarian|null;
    
    private _homingZStart:number;
    private _origXSpeed:number;
    
    /**
     * Constructor
     * @param color the color of the shocker (also determines its width)
     * @param mode The shocker's mode. "static" means it will move straight; "sweep" means it will move back and forth
     * on the x axis while moving towards you; "home" means it will try and home on the player
     * @param playerModel The player model. This can be null, as it is only needed for "home" mode
     * @param speedX The x speed of the shocker (only used in "sweep" mode)
     */
    constructor(color:string, mode:shockerModes, playerModel:Tarian|null = null, speedX:number = 0)
    {
        super();
        
        this.color = color;
        this.mode = mode;
        this.homingTarget = playerModel;
		this.damageDealt = 2;
        
        this.state = "shock";
        this.xSpeed = speedX; //this will be fed through xSpeed()
        this._origXSpeed = speedX;
        
		this._homingZStart = 200; //If in "home" mode, at what Z position do we start homing?
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const damageFlashSpritesheet = "/assets/HUDs/components/DamageFlash/images/yellow.png";
        this.damageFlashImage = this.kernel.loadImage(damageFlashSpritesheet);
		
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
                sheetPath: "/assets/models/Shocker/anim/shocker-" + this.color + "-spritesheet.png",
                frameCoordinates,
                fps: 24,
                drawWidth: width,
                drawHeight: 340,
            })
        });
    }
    
    prepare():void
    {
        super.prepare();
        
        this.setYPositionFromBottom(this.height);
        this.z = this.helpers.zCalc.vPointDepth;
        
        this.active = false;
        
        if(this.mode == "sweep")
        {
            //make shocker sweep either left or right
            this.xSpeed = (((Math.floor(Math.random() * 2)) * 2) - 1) * this.xSpeed;
        } else {
            this.xSpeed = this._origXSpeed;
        }
    }
    
    
    act():void
    {
        this._setZSpeedBasedOnLevelSpeed();
		
		//not using this.moveOut(), as the levelspeed is being reset based on fps -- thus this is as well
        this.z -= this.zSpeed;
        
        const currentXSpeed = (this.mode == "home") ? this._getHomingMovementXSpeed() : this.xSpeed;
		
        if(this.z < 0)
        {
            this.active = false;
        }
		
		//This may be negative (which would be left movement)
		this.moveRight(currentXSpeed);
    }
	
    /**
     * Corrects the z speed of the shocker (based on the speed of the level)
     */
	private _setZSpeedBasedOnLevelSpeed():void
	{
		if(!(this.kernel.level as ASLevel).levelMoving)
        {
            this.zSpeed = -(this.helpers.zCalc.speed((this.kernel.level as ASLevel).maxLevelSpeedRaw, this.kernel.fps) / 1.5);
        } else {
            this.zSpeed = (this.kernel.level as ASLevel).levelSpeed / 1.5;
        }
	}
	
    /**
     * Calculates the correct x speed for homing in on the plyer
     * @returns The correct x speed
     */
	private _getHomingMovementXSpeed():number
	{
        const player = this.homingTarget;
        
		if(!player || this.z > this._homingZStart)
		{
			return 0;
		}
		
		const homingSpeed = 100 / this.xSpeed;
		
		return ((player.x + (player.width / 2)) - (this.x + (this.width / 2))) / homingSpeed;
	}
	
	
    
    zCollisionEventAction(otherModel:IModel):void
    {
        //This method doesn't need to do anything.
        //However, in order to register the event, this needs to exist
    }
    
    extraEvents():void
    {
        //check for leaving the game area
        if((this.x < this.levelLeftEdge) || (this.x + this.width > this.levelRightEdge))
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