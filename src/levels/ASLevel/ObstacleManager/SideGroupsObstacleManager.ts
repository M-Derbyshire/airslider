import Obstacle from "../../../models/Obstacle/Obstacle";
import ObstacleManager from "./ObstacleManager";

/**
 * Manages the level's "obstacle" models, setting their x positions and sending them down the road.
 * This manager repeatably positions the obstacles in groups -- first a group on the left, then a 
 * group on the right.
 */
export default class SideGroupsObstacleManager<T extends Obstacle> extends ObstacleManager<T>
{
    // Should the next line of obstacles be placed on the right side of the track?
	private _placeLineOnRight:boolean;
	
	/**
	 * Resets the manager
	 */
	reset():void
	{
		super.reset();
		
		this._placeLineOnRight = false;
        this.minObstacleCount = 2;
		this.zModifierAbsMax = 20;
	}
    
    /**
	 * Get the X positions for a line of obstacles
	 * @returns the X positions (in units) that the obstacles should be placed at
	 */
	protected getObstacleXPositionsForLine():number[]
	{
		const lineMinSize = 2; // The least amount of obstacles per line
		const lineMaxSize = this.minObstacleCount; // The max amount of obstacles per line
		const obstacleCount = Math.floor(Math.random() * lineMaxSize) + lineMinSize;
		
		this._placeLineOnRight = !this._placeLineOnRight;
		
		let leftEdgeOfLine;
		
		if(this._placeLineOnRight)
		{
			const lineWidth = this.obstacleWidth * obstacleCount;
			leftEdgeOfLine = this.areaRightEdge - lineWidth;
		}
		else
		{
			leftEdgeOfLine = this.areaLeftEdge;
		}
		
		return this._generateObstaclePositionsFromLineX(leftEdgeOfLine, obstacleCount)
	}
    
    /**
	 * Generates a line of X positions, from the given X position (which acts as the left 
	 * edge of the line)
	 * @param lineX the left edge of the line
	 * @param count the amount of positions to return
	 * @returns the X positions for the obstacles, starting at the given line X
	 */
	private _generateObstaclePositionsFromLineX(lineX:number, count:number):number[]
	{
		const positions = [];
		for(let i = 0; i < count; i++) 
			positions.push(lineX + (this.obstacleWidth * i));
		
		return positions;
	}
};