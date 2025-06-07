import Kernel from "../../../../../Kernel/Kernel";
import UnitHelper from "../../../../../Kernel/utils/UnitHelper";
import ASLevel from "../../../../levels/ASLevel/ASLevel";
import Snake from "../../Snake/Snake";
import { IIntroObstacle } from "../types";

/**
 * A version of the snake obstacle that is used to introduce the snake 
 * to the player (entering the level in a slow way that allows the player to 
 * see what it is)
 */
export default class IntroSnake extends Snake implements IIntroObstacle
{
    private _startZPosition:number;
    
    /**
     * "entrance" is where the snake enters the level
     * "steady" is where the snake keeps its z-position steady, so the player can see it
     * "leave" is where the snake leaves the level
     */
    private _currentMove:"entrance"|"steady"|"leave";
    
    // These define the speeds used during the different movements
    private _entranceXSpeed:number;
    private _entranceZSpeed:number;
    private _steadyXSpeed:number;
    private _steadyZSpeed:number;
    private _leaveXSpeed:number;
    private _leaveZSpeed:number;
    
    // These define the boundaries for the X movement
    private _minX:number;
    private _maxX:number;
    
    // The snake's "steady" movement will start close to this Z-position
    private _steadyStartZPosition:number;
    
    // In the "steady" sequence, the snake will move back and forth (each being a 
    // "drift"). For each drift, the current count will be increased. Once it 
    // hits the max, we can switch to the "leave" sequence
    private _maxDriftCount:number;
    private _currentDriftCount:number;
    
    constructor()
    {
        super();
        
        this._entranceXSpeed = 750;
        this._entranceXSpeed = 250;
        this._entranceZSpeed = 200;
        
        this._maxDriftCount = 2;
        this._steadyStartZPosition = 130;
        this._steadyXSpeed = this._entranceXSpeed;
        this._steadyZSpeed = this._entranceZSpeed / 40;
        
        this._leaveXSpeed = 0;
        this._leaveZSpeed = 100;
    }
    
    prepare(): void
    {
        super.prepare();
        
        const level = Kernel.getInstance().level as ASLevel;
        
        this._startZPosition = level.vanishingPointDepth;
        
        this.active = false;
        this.hasCollidedWithPlayer = false;
        this._currentMove = "entrance";
        
        const levelXCenter = (level.rightEdge - level.leftEdge) / 2;
        this.x = levelXCenter;
        this.z = this._startZPosition;
        this._currentDriftCount = 0;
        
        const halfWidth = this.width / 2;
        this._minX = level.leftEdge - halfWidth;
        this._maxX = level.rightEdge - 25 + halfWidth;
        
        this.zSpeed = this._entranceZSpeed;
        this.xSpeed = this._entranceXSpeed;
    }
    
    act():void
    {
        this._setCorrectState();
        
        if(this._currentMove === "entrance")
            this._handleEntranceMovement();
        
        if(this._currentMove === "steady")
            this._handleSteadyMovement();
        
        if(this._currentMove === "leave")
            this._handleLeaveMovement();
    }
    
    /**
     * Starts the intro sequence
     */
    start():void {
        this.active = true;
    }
    
    // Overriding this, as we don't want to react to the snake leaving the game area
    extraEvents():void {}
    
    /**
     * Handles the "entrance" movement actions
     */
    private _handleEntranceMovement():void
    {
        this._setSlowingEntranceZSpeed();
        
        this._handleMovement();
            
        if(this.z <= this._steadyStartZPosition) {
            this._currentMove = "steady";
            this._setXSpeedWithCurrentDirection(this._steadyXSpeed);
            this.zSpeed = this._steadyZSpeed;
        }
    }
    
    /**
     * Handles the "steady" movement actions
     */
    private _handleSteadyMovement():void
    {
        this._handleMovement();
            
        if(this._currentDriftCount === this._maxDriftCount) {
            this._currentMove = "leave";
            this._setXSpeedWithCurrentDirection(this._leaveXSpeed);
            this.zSpeed = this._leaveZSpeed;
        }
    }
    
    /**
     * Handles the "leave" movement actions
     */
    private _handleLeaveMovement():void
    {
        this._handleMovement();
            
        if(this.z < 0)
            this.active = false;
    }
    
    /**
     * Moves the Snake in the desired way
     */
    private _handleMovement():void
    {
        this.moveOut();
        this._driftOnXAxis();
    }
    
    /**
     * Ensures the state property of the Snake is correct
     */
    private _setCorrectState():void
    {
        if(this.hasCollidedWithPlayer)
                this.state = "dead";
            else
                this.state = "slither";   
    }
    
    /**
     * Sets the Z speed to slow down, as it moves 
     * down the Z-axis
     */
    private _setSlowingEntranceZSpeed():void
    {
        const speedChangeForZSlowdown = UnitHelper.speed(23);
        
        const newSpeed = this.zSpeed - speedChangeForZSlowdown;
        
        if(newSpeed > this._steadyZSpeed)
            this.zSpeed = newSpeed;
        else
            this.zSpeed = this._steadyZSpeed;
    }
    
    /**
     * Sets the X-axis speed to the given speed, while maintaining
     * the direction (so if the current speed is negative, the new 
     * speed will also be negative)
     * @param speed the new X-axis speed to use
     */
    private _setXSpeedWithCurrentDirection(speed:number):void
    {
        this.xSpeed = (this.xSpeed < 0) ? -speed : speed;
    }
    
    /**
     * Makes the Snake move back and forth on the X-axis
     */
    private _driftOnXAxis():void
    {
        const tooFarLeft = (this.x < this._minX) && this.xSpeed <= 0;
        const tooFarRight = (this.x > this._maxX) && this.xSpeed >= 0;
        
        if(tooFarLeft || tooFarRight) {
            this.xSpeed = -this.xSpeed;
            
            if(this._currentMove === "steady")
                this._currentDriftCount++;
        }
        
        // If the X speed is negative, moveRight will move the snake left
        this.moveRight();
    }
}