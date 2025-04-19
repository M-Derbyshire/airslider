import Kernel from '../../../Kernel/Kernel';
import MainHUD from '../../HUDs/MainHUD/MainHUD';
import ASLevel from '../../levels/ASLevel/ASLevel';
import ASModel from '../ASModel/ASModel';
import IHitBox from '../../../Kernel/entities/Model/IHitBox';
import IModel from '../../../Kernel/entities/Model/IModel';
import IModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';

/**
 * The main character of the game, controlled by the player
 */
export default class Tarian extends ASModel {    
    /**
     * The maximum x speed of the model
     */
    topSpeed:number;
    
    /**
     * The current health of the player
     */
    health:number;
    
    /**
     * Is the player's hoverboard currently breaking?
     */
    get breaking():boolean
    {
        return this.state === "breaking";
    }
    
    /**
     * Is the player in the lost state?
     */
    get lost():boolean
    {
        return this.state === "lost";
    }
    
    private _lastSpeedChange:number; // How many milliseconds since the x speed last changed
    
    private _lostAtTimeMS:number|null; // The time (in milliseconds) when the model entered the "lost" state
    private _lostZSpeed:number; // The exiting z speed, when the player has lost the level
    
    private _accl:number; // The x speed accelaration
    private _deaccl:number; // The x speed de-accelaration
    
    constructor()
    {
        super();
        
        this._lostZSpeed = 35; 
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        // Not adding this to assetsToUnload, as this is used on every level
        const spritesheetPath = "/models/Tarian/anim/tarian-spritesheet.png";
        
        this.animationManager.registerAnimations({
            forward: this.animationManager.createAnimation({
                sheetPath: spritesheetPath, 
                fps: 24,
                drawWidth: 120,
                drawHeight: 170,
				frameCoordinates: [
					{ x: 0, y: 2760, width: 92, height: 119 },
					{ x: 0, y: 2880, width: 92, height: 119 },
					{ x: 0, y: 3000, width: 92, height: 119 },
					{ x: 0, y: 3120, width: 92, height: 119 },
				]
            }),
            left: this.animationManager.createAnimation({
                sheetPath: spritesheetPath, 
                fps: 24, 
                drawWidth: 170, 
                drawHeight: 170, 
                xOffset: -40,
				frameCoordinates: [
					{ x: 0, y: 3600, width: 126, height: 97 },
					{ x: 0, y: 3698, width: 126, height: 97 },
					{ x: 0, y: 3796, width: 126, height: 97 },
					{ x: 0, y: 3894, width: 126, height: 97 },
				]
            }),
            right: this.animationManager.createAnimation({
                sheetPath: spritesheetPath, 
                fps: 24,
                drawWidth: 170,
                drawHeight: 170,
                xOffset: 40,
				frameCoordinates: [
					{ x: 0, y: 3992, width: 118, height: 97 },
					{ x: 0, y: 4090, width: 118, height: 97 },
					{ x: 0, y: 4188, width: 118, height: 97 },
					{ x: 0, y: 4286, width: 118, height: 97 },
				]
            }),
            breaking: this.animationManager.createAnimation({
                sheetPath: spritesheetPath, 
                fps: 24,
                drawWidth: 120,
                drawHeight: 170,
                nextAnimation: "lost",
				frameCoordinates: [
					{ x: 0, y: 0, width: 92, height: 119 },
					{ x: 0, y: 120, width: 92, height: 119 },
					{ x: 0, y: 240, width: 92, height: 119 },
					{ x: 0, y: 360, width: 92, height: 119 },
					{ x: 0, y: 480, width: 92, height: 119 },
					{ x: 0, y: 600, width: 92, height: 119 },
					{ x: 0, y: 720, width: 92, height: 119 },
					{ x: 0, y: 840, width: 92, height: 119 },
					{ x: 0, y: 960, width: 92, height: 119 },
					{ x: 0, y: 1080, width: 92, height: 119 },
					{ x: 0, y: 1200, width: 92, height: 119 },
					{ x: 0, y: 1320, width: 92, height: 119 },
					{ x: 0, y: 1440, width: 92, height: 119 },
					{ x: 0, y: 1560, width: 92, height: 119 },
					{ x: 0, y: 1680, width: 92, height: 119 },
					{ x: 0, y: 1800, width: 92, height: 119 },
					{ x: 0, y: 1920, width: 92, height: 119 },
					{ x: 0, y: 2040, width: 92, height: 119 },
					{ x: 0, y: 2160, width: 92, height: 119 },
					{ x: 0, y: 2280, width: 92, height: 119 },
					{ x: 0, y: 2400, width: 92, height: 119 },
					{ x: 0, y: 2520, width: 92, height: 119 },
					{ x: 0, y: 2640, width: 92, height: 119 },
				]
            }),
            lost: this.animationManager.createAnimation({
                sheetPath: spritesheetPath, 
                fps: 24,
                drawWidth: 120,
                drawHeight: 170,
				frameCoordinates: [
					{ x: 0, y: 3240, width: 92, height: 119 },
					{ x: 0, y: 3360, width: 92, height: 119 },
					{ x: 0, y: 3480, width: 92, height: 119 },
				]
            })
        });
    }
    
    prepare():void
    {
        super.prepare();
        
        this.z = 20;
        
        this._lastSpeedChange = 0;
        this._accl = 800;
        this._deaccl = 100;
        this.topSpeed = 1000;
        this.xSpeed = 0;
        this.zSpeed = 0;
        
        this.health = 100;
        
        this.canBeControlled = false; // Should the directional controls be operational?
        this.state = "forward";
        this.active = true;
        this._lostAtTimeMS = null;
        
        this.centerXPosition();
        this.setYPositionFromBottom(this.height);
    }
    
    getHitBoxes():IHitBox[]
    {
        if(this.state === "forward")
        {
            return [
                {
                    x: this.x + (this.width / 10),
                    y: this.y + (this.height / 5),
                    z: this.z,
                    width: this.width * 0.75,
                    height: this.height * 0.75
                },
                {
                    x: this.x + (this.width / 3.3),
                    y: this.y,
                    z: this.z,
                    width: this.width * 0.35,
                    height: this.height * 0.5
                }
            ];
        }
        
        if(this.state === "left")
        {
            return [
                {
                    x: this.x + (this.width * 0.05),
                    y: this.y,
                    z: this.z,
                    width: this.width / 4.25,
                    height: this.height * 0.85
                },
                {
                    x: this.x + (this.width / 4),
                    y: this.y + (this.height / 7),
                    z: this.z,
                    width: this.width / 3,
                    height: this.height * 0.75
                },
                {
                    x: this.x + (this.width * 0.55),
                    y: this.y + (this.height * 0.4),
                    z: this.z,
                    width: this.width / 2.5,
                    height: this.height * 0.5
                }
            ];
        }
        
        if(this.state === "right")
        {
            return [
                {
                    x: this.x + (this.width * 0.75),
                    y: this.y,
                    z: this.z,
                    width: this.width / 4.25,
                    height: this.height * 0.85
                },
                {
                    x: this.x + (this.width * 0.4),
                    y: this.y + (this.height * 0.07),
                    z: this.z,
                    width: this.width / 3,
                    height: this.height * 0.75
                },
                {
                    x: this.x,
                    y: this.y + (this.height * 0.4),
                    z: this.z,
                    width: this.width / 2.5,
                    height: this.height * 0.5
                }
            ];
        }
        
        return super.getHitBoxes();
    }
	
	
    
    act():void
    {
        this._movePlayer();
        
        this._handleLowHealthFlash();
        
		this._handleLostState();
    }
    
    /**
     * Triggers the HUD's low-health flash, if health is low
     */
    private _handleLowHealthFlash():void
    {
        const hud = Kernel.getInstance().level.HUD as MainHUD;
        
        if(this.health <= 10 && this.health > 0 && !hud.isLowHealthFlashActive())
            hud.startLowHealthFlash();
        
        if(this.health <= 0 && hud.isLowHealthFlashActive())
            hud.stopLowHealthFlash();
    }
	
    /**
     * Handles the "lost" state of the model
     */
	private _handleLostState():void
	{
        if(this.lost)
        {
            if(!this._lostAtTimeMS)
                this._lostAtTimeMS = Kernel.getInstance().totalLevelActiveMilliseconds;
            
            this._handleOnScreenAfterLoss();
            this._handleLeavingScreenAfterLoss();
        }
	}
	
    /**
     * Handles the sequence where the player is in the "lost" state, but is still on screen
     */
	private _handleOnScreenAfterLoss():void
	{
        const totalActiveMS = Kernel.getInstance().totalLevelActiveMilliseconds;
        
        if(
            this.z >= -5 && 
            (this._lostAtTimeMS + 3000) < totalActiveMS
        )
        {
            this.zSpeed = -this._lostZSpeed;
        }
	}
	
    /**
     * Handles the player leaving the screen after a loss, and trigger the level's levelStop method
     */
	private _handleLeavingScreenAfterLoss()
	{
		if(this.lost && this.z < 0)
        {
            this.active = false;
            (Kernel.getInstance().level as ASLevel).handlePlayerLoss();
        }
	}
	
	/**
     * Handles the x and z movement of the player
     */
    private _movePlayer():void
    {
        this._setXSpeedBasedOnAcceleration();
        
        this.moveRight();
        this.moveIn();
    }
	
    /**
     * Determines and sets the player's speed, based on the acceleration/de-acceleration
     */
	private _setXSpeedBasedOnAcceleration():void
	{
        const totalActiveMS = Kernel.getInstance().totalLevelActiveMilliseconds;
        
		if(totalActiveMS - this._lastSpeedChange >= 100) //1 tenth of a second
        {
            this._lastSpeedChange = totalActiveMS;
			this._changeSpeed();
        }
	}
	
    /**
     * Sets the player's speed, based on the acceleration/de-acceleration
     */
	private _changeSpeed():void
	{
		let speedChange = this._accl; // The value to add to the xSpeed
        let directionMultiplier = 0; // Positive/negative value determines left/right speed change (0 is no change)
		
		if(this.state === "right")
		{
			directionMultiplier = 1;
		} 
		else if (this.state === "left")
		{
			directionMultiplier = -1;
		} 
		else // if stopping
		{
            speedChange = this._deaccl;
            
			if(this.xSpeed > 0)
				directionMultiplier = -1;
			else if (this.xSpeed < 0)
				directionMultiplier = 1;
            // Else, value remains 0 (for no change)
		}
		
		speedChange *= directionMultiplier;
		this.xSpeed += speedChange;
		
		this._handleTooFastOrNegativeSpeed(speedChange, directionMultiplier);
	}
	
    /**
     * Handles the player's movement being above the top speed, or being ready to stop
     * @param speedChange how much is the player's speed changing by?
     * @param directionMultiplier speed can be multiplied by this, to set the correct direction
     */
	private _handleTooFastOrNegativeSpeed(speedChange:number, directionMultiplier:number):void
	{
		if(this._isAboveTopSpeedEitherDirection())
		{
			this.xSpeed = this.topSpeed * directionMultiplier;
		} 
		else if (this._isReadyToStopMovement(speedChange))
		{
			this.xSpeed = 0;
		}
	}
	
    /**
     * Is the player's x speed too fast?
     * @returns true if above top speed, false if not
     */
	private _isAboveTopSpeedEitherDirection():boolean
	{
		return (Math.abs(this.xSpeed) > this.topSpeed);
	}
	
    /**
     * Is the player about to stop moving (on the x axis, based on de-acceleration)?
     * @param speedChange The current amount the x speed is changing by
     * @returns true if the x movement should now stop, false if not
     */
	private _isReadyToStopMovement(speedChange:number):boolean
	{
		return (
            (this.state !== "left" && this.state !== "right") && 
			(this.xSpeed > -speedChange && this.xSpeed < speedChange)
        );
	}
	
    
    // Events -----------------------------------------------------------------
	
    extraEvents():void
    {
        // Check for leaving the game area
        if(this.x < this.levelLeftEdge)
        {
            if(this.state == "left")
                this.state = "forward";
            
            this.x = this.levelLeftEdge;
            this.xSpeed = 0;
        }
        if(this.x + this.width > this.levelRightEdge)
        {
            if(this.state == "right")
                this.state = "forward";
            
            this.x = this.levelRightEdge - this.width;
            this.xSpeed = 0;
        }
    }
    
    /**
     * Event handler for collisions
     * @param otherModel The other model involved in the collision
     */
    zCollisionEventAction(otherModel:IModel):void
    {
        const other = otherModel as ASModel & { damageFlashImage:HTMLImageElement };
        
        if(other.damageDealt > 0 && this.state !== "breaking" && this.state !== "lost")
        {
            this.health -= other.damageDealt;
            if(this.health <= 0)
            {
                this.health = 0;
                this.state = "breaking";
                this.canBeControlled = false;
            }
            
            if(other.damageFlashImage)
                (Kernel.getInstance().level.HUD as MainHUD).startDamageFlash(other.damageFlashImage);
        }
    }
}
