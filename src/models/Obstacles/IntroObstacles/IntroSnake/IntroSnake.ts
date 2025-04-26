import IHitBox from "../../../../../Kernel/entities/Model/IHitBox";
import Kernel from "../../../../../Kernel/Kernel";
import Snake from "../../Snake/Snake";
import { IIntroObstacle } from "../types";

/**
 * A version of the snake obstacle that is used to introduce the snake 
 * to the player (entering the level in a slow way that allows the player to 
 * see what it is)
 */
export default class IntroSnake extends Snake implements IIntroObstacle
{
    /**
     * "entrance" is where the snake enters the level
     * "steady" is where the snake keeps its z-position steady, so the player can see it
     * "leave" is where the snake leaves the level
     */
    private _currentMove:"entrance"|"steady"|"leave";
    
    // These define the boundaries for the X movement during the "steady" movement
    private _steadyMinX:number;
    private _steadyMaxX:number;
    
    // The snake will stay close to this z-position for the "steady" movement
    private _steadyZPosition:number;
    
    // In the "steady" sequence, the snake will move back and forth (each being a 
    // "drift"). For each drift, the current count will be increased. Once it 
    // hits the max, we can switch to the "leave" sequence
    private _maxDriftCount:number;
    private _currentDriftCount:number;
    
    constructor()
    {
        super();
        
        this._steadyZPosition = 65;
        this._maxDriftCount = 3;
        
        this.zSpeed = 15;
        this.xSpeed = 250;
    }
    
    prepare(): void
    {
        super.prepare();
        
        this.active = false;
        this.hasCollidedWithPlayer = false;
        this.x = -(this.width * 2);
        this.z = -1;
        this._currentMove = "entrance";
        this._currentDriftCount = 0;
        
        this._steadyMinX = 25;
        this._steadyMaxX = 975 - this.width;
    }
    
    act():void
    {
        // Recreating this here, as the parent Snake class calls the Obstacle.act method,
        // which does things we don't want
        if(this.hasCollidedWithPlayer)
            this.state = "dead";
        else
            this.state = "slither";
        
        // Entrance sequence
        if(this._currentMove === "entrance")
            this._entranceMovement();
        
        if(this._currentMove === "entrance" && this.z >= this._steadyZPosition)
            this._currentMove = "steady";
        
        // Steady sequence
        if(this._currentMove === "steady")
            this._steadyMovement();
        
        if(this._currentMove === "steady" && this._currentDriftCount === this._maxDriftCount)
            this._currentMove = "leave";
        
        // Leave sequence
        if(this._currentMove === "leave")
            this._leaveMovement();
        
        if(this._currentMove === "leave" && this.z < 0)
            this.active = false;
    }
    
    /**
     * Starts the intro sequence
     */
    start():void {
        this.active = true;
    }
    
    getHitBoxes(): IHitBox[] {
        return this._currentMove === "leave"
            ? super.getHitBoxes()
            : [];
    }
    
    // Overriding this, as we don't want to react to the snake leaving the game area
    extraEvents():void {}
    
    /**
     * Handles the movement during the "entrance" sequence
     */
    private _entranceMovement():void
    {
        this.moveIn();
    }
    
    /**
     * Handles the movement during the "steady" sequence
     */
    private _steadyMovement():void
    {
        // If the X speed is negative, moveRight will move left
        
        const tooFarLeft = this.x <= this._steadyMinX && this.xSpeed < 0;
        const tooFarRight = this.x >= this._steadyMaxX;
        
        if(tooFarLeft || tooFarRight) {
            this.xSpeed = -this.xSpeed;
            this.moveRight(this.xSpeed / 2); // This is to ensure we won't retrigger this block next frame
            this._currentDriftCount++;
        }
        
        this.moveRight();
    }
    
    /**
     * Handles the movement during the "leave" sequence
     */
    private _leaveMovement():void
    {
        this.moveOut(this.zSpeed * 1.5);
    }
}