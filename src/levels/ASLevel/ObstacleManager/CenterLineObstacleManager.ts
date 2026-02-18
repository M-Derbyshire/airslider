import Obstacle from "../../../models/Obstacle/Obstacle";
import ObstacleManager from "./ObstacleManager";

/**
 * Manages the level's "obstacle" models, setting their X positions and sending them down the road.
 * This manager repeatably positions the obstacles in the center of the level
 */
export default class CenterLineObstacleManager<T extends Obstacle> extends ObstacleManager<T>
{
    /**
     * We only need to calculate the actual positions for the lines once
     */
    private _calculatedPositions?:number[];
    
    /**
     * Resets the manager
     */
    reset():void
    {
        super.reset();
        
        this._calculatedPositions = undefined;
    }
    
    /**
	 * Get the X positions for a line of obstacles
	 * @returns the X positions (in units) that the obstacles should be placed at
	 */
	protected getObstacleXPositionsForLine():number[]
	{
        if(this._calculatedPositions)
            return this._calculatedPositions;
        
		const modelHalfWidth = this.obstacleWidth / 2;
        const levelHalfWidth = (this.areaRightEdge - this.areaLeftEdge) / 2;
        
        this._calculatedPositions = [
            this.areaLeftEdge + (levelHalfWidth - modelHalfWidth)
        ];
		return this._calculatedPositions;
	}
}