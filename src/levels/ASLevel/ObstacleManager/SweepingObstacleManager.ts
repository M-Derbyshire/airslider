import Obstacle from "../../../models/Obstacle/Obstacle";
import ObstacleManager from "./ObstacleManager";

/**
 * Manages the level's "obstacle" models, setting their x positions and sending them down the road.
 * This manager is designed to handle "sweeping" obstacles (obstacles that sweep back and forth on
 * the X-axis)
 */
export default class SweepingObstacleManager<T extends Obstacle> extends ObstacleManager<T>
{
    // Should the obstacle start on the right edge, instead of the left?
    private _placeObstacleOnRight!:boolean;
    
    /**
     * Resets the manager
     */
    reset():void
    {
        super.reset();
        
        this._placeObstacleOnRight = false;
        
        this.minObstacleCount = 1;
        
        // If this is set too low, the player could just stay in one place, and barely get hit
        this.zModifierAbsMax = 100;
    }
    
    /**
     * Get the X positions for a line of obstacles
     * @returns the X positions (in units) that the obstacles should be placed at
     */
    protected getObstacleXPositionsForLine():number[]
    {
        // We only want to use a single obstacle for each "line"
        
        this._placeObstacleOnRight = !this._placeObstacleOnRight;
        
        if(this._placeObstacleOnRight)
            return [this.areaRightEdge - this.obstacleWidth];
        
        return [this.areaLeftEdge];
    }
};