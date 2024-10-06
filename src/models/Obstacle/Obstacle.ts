import Kernel from "../../../Kernel/Kernel";
import ASLevel from "../../levels/ASLevel/ASLevel";
import ASModel from "../ASModel/ASModel";
import IModel from "../../../Kernel/entities/Model/IModel";
import Tarian from "../Tarian/Tarian";

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
    }
    
    prepare():void
    {
        super.prepare();
        
        this.setYPositionFromBottom(this.height);
        this.z = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
        
        this.active = false;
        
        if(this._mode == "sweep")
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
		
        const currentXSpeed = (this._mode == "home") ? this._getHomingMovementXSpeed() : this.xSpeed;
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
     * Corrects the z speed of the obstacle (based on the speed of the level). 
     * We want the obstacles to fly off into the distance if the level stops moving.
     */
	private _setZSpeedBasedOnLevelSpeed():void
	{
        const kernel = Kernel.getInstance();
        const level = kernel.level as ASLevel;
        
		if(!level.levelMoving)
            this.zSpeed = -(kernel.helpers.zCalc.speed(level.maxLevelSpeedRaw, kernel.fps) / 1.5);
        else
            this.zSpeed = level.levelSpeed / 1.5;
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
 * The possible modes for an obstacle
 */
export type obstacleModes = "static"|"sweep"|"home";