import Obstacle from "../../../models/Obstacle/Obstacle";
import { generateRandomPositionModifier } from "../utils";
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
    
    constructor()
    {
        super();
        
        this._placeLineOnRight = false;
        this.minObstacleCount = 2;
    }
    
    /**
	 * Sends another line of obstacles, if needed
	 */
    sendObstaclesIfReady():void
    {
		if(this.isTimeToSendNextLine())
		{
			const lineMinSize = 2; // The least amount of obstacles per line
			const lineMaxSize = this.minObstacleCount; // The max amount of obstacles per line
			const obstacleCount = Math.floor(Math.random() * lineMaxSize) + lineMinSize;
			
			// This value affects the maximum change that will get made to an obstacle's Z-axis 
			// position, before it's sent
			const zModifierAbsMax = 20;
			
			const xPositions = this._getObstacleXPositions(obstacleCount);
			
			const obstacles = [];
			for(let i = 0; i < obstacleCount; i++)
			{
				const obstacle = this.obstacles[this.getIndexForNextObstacle()];
				
				obstacle.resetToStart(xPositions[i]);
				obstacle.z += generateRandomPositionModifier(zModifierAbsMax);
				obstacles.push(obstacle);
			}
		}
    }
    
    /**
	 * Get the X positions for a line of obstacles
	 * @param count the amount of positions to return
	 * @returns the X positions (in units) that the obstacles should be placed at
	 */
	private _getObstacleXPositions(count:number):number[]
	{
		this._placeLineOnRight = !this._placeLineOnRight;
		
		let leftEdgeOfLine;
		
		if(this._placeLineOnRight)
		{
			const lineWidth = this.obstacleWidth * count;
			leftEdgeOfLine = this.areaRightEdge - lineWidth;
		}
		else
		{
			leftEdgeOfLine = this.areaLeftEdge;
		}
		
		return this._generateObstaclePositionsFromLineX(leftEdgeOfLine, count)
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