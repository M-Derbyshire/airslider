import Kernel from "../../../Kernel/Kernel";
import ASLevel from "../../levels/ASLevel/ASLevel";
import ASModel from "../ASModel/ASModel";
import IModel from "../../../Kernel/entities/Model/IModel";
import Tarian from "../Tarian/Tarian";
import UnitHelper from "../../../Kernel/utils/UnitHelper";
import IHitBox from "../../../Kernel/entities/Model/IHitBox";

/**
 * Base class for obstacles, that move down the track to hit the player
 */
export default class Obstacle extends ASModel
{
    /**
     * The damage flash image for this obstacle's damage (for the HUD damage flash component)
     */
    damageFlashImage:HTMLImageElement;
    
    /**
     * The position on the Z axis that the obstacle will start its movement from
     */
    startZPosition:number;
    
    /**
     * The mode of the obstacle
     * "static" means it will move straight; 
     * "sweep" means it will move back and forth on the x axis, while moving towards the player; 
     * "home" means it will try and home in on the player
     */
    private _mode:obstacleModes;
    
    /**
     * The player model, used when in "home" mode
     */
    private _homingTarget:Tarian|null;
    
    /**
     * At what z position should the homing movement begin (in "home" mode)?
     */
    private _homingZStart:number;
    
    /**
     * Has this obstacle had a collision with the player (on this run down the track)?
     */
    protected hasCollidedWithPlayer:boolean;
    
    /**
     * This number controls the speed on the Z-axis (the speed is based on the level
     * speed, but this value modifies that). The lower this number, the faster the
     * speed.
     */
    protected speedModifier:number;
    
    /**
     * Constructor
     * @param mode The obstacle's mode
     * @param homingZStart At what z position should the homing movement begin (in "home" mode)?
     * @param speedX The x speed of the obstacle. This needs to be quite high (1000-2000+) for sweeping, but 
     * much less for the homing
     * @param playerModel The player model. This can be null, as it is only needed for "home" mode
     */
    constructor(mode:obstacleModes, homingZStart:number, speedX:number = 0, playerModel:Tarian|null = null)
    {
        super();
        
        this._mode = mode;
        this._homingZStart = homingZStart;
        this.xSpeed = speedX;
        this._homingTarget = playerModel;
        this.hasCollidedWithPlayer = false;
        this.speedModifier = 2;
    }
    
    prepare():void
    {
        super.prepare();
        
        this.startZPosition = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
        
        this.setYPositionFromBottom(this.height);
        this.resetToStart(this.x);
        this.active = false;
    }
    
    act():void
    {
        this._setZSpeedBasedOnLevelSpeed();
		
		// Not using this.moveOut(), as the levelspeed is being reset based on fps -- thus this 
        // is as well (after the above method call)
        this.z -= this.zSpeed;
		
        if(this.z < 0)
            this.active = false;
		
        if(this._mode !== "static") {
            const currentXSpeed = (this._mode == "home")
                ? this._getHomingMovementXSpeed()
                : this.xSpeed;
            
            this.moveRight(currentXSpeed); // This may be negative (which would be left movement)
        }
    }
    
    /**
     * Resets the Obstacle back to its starting Z position, and makes any other required
     * changes to reset
     * @param xPosition The new X position for the model
     */
    resetToStart(xPosition:number):void
    {
        this.z = this.startZPosition;
        this.x = xPosition;
        
        this.active = true;
        this.hasCollidedWithPlayer = false;
    }
    
    /**
     * Creates and returns the current array of hit boxes for the model.
     * @returns An array of box's that can be used for events (e.g. boxes covering a character, for use by collision events)
     */
    getHitBoxes():IHitBox[]
    {
        if(this.hasCollidedWithPlayer)
            return [];
        
        return super.getHitBoxes();
    }
    
    /**
     * Corrects the z speed of the obstacle (based on the speed of the level). 
     * We want the obstacles to fly off into the distance if the level stops moving.
     */
	private _setZSpeedBasedOnLevelSpeed():void
	{
        const level = Kernel.getInstance().level as ASLevel;
        
		if(!level.levelMoving)
            this.zSpeed = -(UnitHelper.speed(level.maxLevelSpeedRaw) / this.speedModifier);
        else
            this.zSpeed = level.levelSpeed / this.speedModifier;
	}
	
    /**
     * Calculates the correct x speed for homing in on the player
     * @returns The correct x speed
     */
	private _getHomingMovementXSpeed():number
	{
        const player = this._homingTarget;
        
		if(!player || this.z > this._homingZStart) // If no player, or too far away from the player
			return 0;
		
		const homingSpeed = 100 / this.xSpeed;
		
        const playerCenter = (player.x + (player.width / 2));
        const obstacleCenter = (this.x + (this.width / 2));
        
		return (playerCenter - obstacleCenter) / homingSpeed;
	}
    
    // Events -------------------------------------------------------------------
    
    hitEventAction():void
    {
        this.hasCollidedWithPlayer = true;
    }
    
    extraEvents():void
    {
        const level = (Kernel.getInstance().level as ASLevel);
        
        // Check for leaving the game area
        const leavingLeftEdge = (this.x < level.leftEdge);
        const leavingRightEdge = (this.x + this.width > level.rightEdge);
        
        if(leavingLeftEdge || leavingRightEdge)
        {
            this.xSpeed = -this.xSpeed;
            this.moveRight(); // If X speed is negative, this will move left
        }
    }
}

/**
 * The possible modes for an obstacle
 */
export type obstacleModes = "static"|"sweep"|"home";