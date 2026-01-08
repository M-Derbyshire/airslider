import Kernel from "../../../../../Kernel/Kernel";
import ASLevel from "../../../../levels/ASLevel/ASLevel";
import Skeleton from "../../Skeleton/Skeleton";
import { IIntroObstacle } from "../types";

/**
 * A version of the skeleton obstacle that is used to introduce the skeleton 
 * to the player (entering the level in a slow way that allows the player to 
 * see what it is)
 */
export default class IntroSkeleton extends Skeleton implements IIntroObstacle
{
    /**
     * "entrance" is where the skeleton enters the level
     * "sweeping" is where the skeleton is moving back and forth
     * "leave" is where the skeleton leaves the level
     */
    private _currentMove:"entrance"|"sweeping"|"leave";
    
    // These define the speeds used during the different movements
    private _entranceZSpeed:number;
    private _sweepingXSpeed:number;
    private _leaveZSpeed:number;
    
    // These define the boundaries for the X movement
    private _minX:number;
    private _maxX:number;
    
    // The skeleton's "sweeping" movement will start close to this Z-axis position
    private _sweepingStartZPosition:number;
    
    // In the "sweeping" sequence, the skeleton will move back and forth.
    // For each sweep, the current count will be increased. Once it 
    // hits the max, we can switch to the "leave" sequence
    private _maxSweepCount:number;
    private _currentSweepCount:number;
    
    // Which edge of the level should this skeleton start on?
    private _startPosition:skeletonStartPosition;
    
    constructor(startPosition:skeletonStartPosition)
    {
        super("static", 0, 0);
        
        this._maxSweepCount = 3;
        this._sweepingStartZPosition = 70;
        
        this._entranceZSpeed = 10;
        this._sweepingXSpeed = 250;
        this._leaveZSpeed = 15;
        
        this._startPosition = startPosition;
        
        if(this._startPosition === "right") {
            this._sweepingStartZPosition -= 10;
            this._sweepingXSpeed = -this._sweepingXSpeed;
        }
    }
    
    prepare(): void
    {
        super.prepare();
        
        const level = Kernel.getInstance().level as ASLevel;
        
        this.active = false;
        this.hasCollidedWithPlayer = false;
        this._currentMove = "entrance";
        
        this._minX = level.leftEdge - this.width;
        this._maxX = level.rightEdge;
        
        this.x = (this._startPosition === "left") ? this._minX : this._maxX;
        this.z = (this._startPosition === "left") ? -1 : -11;
        
        this._currentSweepCount = 0;
        
        this.zSpeed = this._entranceZSpeed;
        this.xSpeed = 0;
    }
    
    act():void
    {
        this.bounceObstacle();
        
        if(this._currentMove === "entrance")
            this._handleEntranceMovement();
        
        if(this._currentMove === "sweeping")
            this._handleSweepingMovement();
        
        if(this._currentMove === "leave")
            this._handleLeaveMovement();
    }
    
    /**
     * Starts the intro sequence
     */
    start():void {
        this.active = true;
    }
    
    // Overriding this, as we don't want to react to the skeleton leaving the game area
    checkForExtraEvents():void {}
    
    /**
     * Handles the "entrance" movement actions
     */
    private _handleEntranceMovement():void
    {
        this.moveIn();
            
        if(this.z >= this._sweepingStartZPosition) {
            this._currentMove = "sweeping";
            this.xSpeed = this._sweepingXSpeed;
            this.zSpeed = 0;
        }
    }
    
    /**
     * Handles the "sweeping" movement actions
     */
    private _handleSweepingMovement():void
    {
        this._driftOnXAxis();
            
        if(this._currentSweepCount === this._maxSweepCount) {
            this._currentMove = "leave";
            this.xSpeed = 0;
            this.zSpeed = this._leaveZSpeed;
        }
    }
    
    /**
     * Handles the "leave" movement actions
     */
    private _handleLeaveMovement():void
    {
        this.moveOut();
            
        if(this.z < 0)
            this.active = false;
    }
    
    /**
     * Makes the skeleton move back and forth on the X-axis
     */
    private _driftOnXAxis():void
    {
        const tooFarLeft = (this.x < this._minX) && this.xSpeed <= 0;
        const tooFarRight = (this.x > this._maxX) && this.xSpeed >= 0;
        
        if(tooFarLeft || tooFarRight) {
            this.xSpeed = -this.xSpeed;
            
            if(this._currentMove === "sweeping")
                this._currentSweepCount++;
        }
        
        // If the X speed is negative, moveRight will move the skeleton left
        this.moveRight();
    }
}

type skeletonStartPosition = "left"|"right";