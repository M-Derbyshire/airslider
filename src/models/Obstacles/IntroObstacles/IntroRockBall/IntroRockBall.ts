import Kernel from "../../../../../Kernel/Kernel";
import ASLevel from "../../../../levels/ASLevel/ASLevel";
import RockBall from "../../RockBall/RockBall";
import { IIntroObstacle } from "../types";

/**
 * A version of the RockBall obstacle that is used to introduce the balls 
 * to the player (entering the level in a way that allows the player to 
 * see what they are)
 */
export default class IntroRockBall extends RockBall implements IIntroObstacle
{
    private _side:rockBallEntranceSide; // The side of the level that the ball will enter from
    
    // These control the height/speed of the standard bounce (activated after the initial intro bounce)
    private _maxStandardBounceSpeed:number;
    private _standardBounceDeceleration:number;
    
    private _exitZSpeed:number;
    
    private _currentMove:"rise"|"fall";
    private _bounceCount:number; // How many times has the ball bounced (not including initial rise)?
    
    /**
     * Constructor
     * @param side which side of the level should this ball come from?
     */
    constructor(side:rockBallEntranceSide)
    {
        super();
        
        this._side = side;
        this._exitZSpeed = 20;
    }
    
    prepare():void {
        super.prepare();
        
        this._currentMove = "rise";
        this._bounceCount = 0;
        
        this.z = 55;
        if(this._side === "right")
            this.z += 10;
        
        this._standardBounceDeceleration = this.bounceDeceleration;
        this._maxStandardBounceSpeed = this.maxBounceSpeed;
        
        this._switchToInitialBounce();
    }
    
    act():void {
        super.act();
        
        if(this.state === "spin") {
            this._overrideObstacleZMovement();
        
            if(this._bounceCount > 4)
                this.moveOut(this._exitZSpeed);
        }
        
        this.moveRight(); // Negative speed value will cause a left movement
        
        this._setCurrentBounceValues();
    }
    
    /**
     * Starts the intro sequence
     */
    start():void {
        this.active = true;
    }
    
    // Overriding this, as we don't want to react to the obstacle being outside the game area
    extraEvents():void {}
    
    /**
     * Undoes the changes to the Z-axis position that were made by the base obstacle class
     */
    private _overrideObstacleZMovement():void {
        // Not using this.moveOut(), as the levelspeed is being reset based on fps -- and this 
        // speed is being reset based on that
        this.z += this.zSpeed;
    }
    
    /**
     * Reconfigures the ball, based on the current state of the bouncing movement
     */
    private _setCurrentBounceValues():void {
        if(this._currentMove === "rise" && this.ySpeed < 0)
            this._currentMove = "fall";
        
        if(this._currentMove === "fall" && this.ySpeed > 0) {
            this._currentMove = "rise";
            this._bounceCount++;
            
            if(this._bounceCount === 1)
                this._switchToStandardBounce();
        }
    }
    
    /**
     * Reconfigures the ball, in preperation for the initial bounce
     */
    private _switchToInitialBounce():void {
        this.xSpeed = 200;
        
        this.maxBounceSpeed = 1140;
        this.bounceDeceleration = 1000;
        
        if(this._side === "right") {
            this.xSpeed = -this.xSpeed;
            
            this.maxBounceSpeed += 100;
        }
        
        this.ySpeed = this.maxBounceSpeed;
        
        const { leftEdge, rightEdge } = (Kernel.getInstance().level as ASLevel);
        const initialDistanceFromSide = -200;
        
        this.x = (this._side === "left")
            ? leftEdge + initialDistanceFromSide
            : rightEdge - initialDistanceFromSide - this.width;
    }
    
    /**
     * Reconfigures the ball in preperation for the standard bounce
     */
    private _switchToStandardBounce():void {
        this.maxBounceSpeed = this._maxStandardBounceSpeed;
        this.bounceDeceleration = this._standardBounceDeceleration;
        
        this.ySpeed = this.maxBounceSpeed;
        this.xSpeed = (this._side === "left") ? 25 : -25;
        this.zSpeed = 0;
    }
};

/**
 * The directions that a RockBall can enter the level from
 */
type rockBallEntranceSide = "left"|"right";