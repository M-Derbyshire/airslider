import Kernel from '../../../Kernel/Kernel';
import IModel from '../../../Kernel/entities/Model/IModel';
import Obstacle from '../../models/Obstacle/Obstacle';
import ASLevel from './ASLevel';

/**
 * Manages the level's "obstacle" models, setting their x positions and sending them down the road
 */
export default class ObstacleManager
{
	// The model of the player character
	protected playerModel:IModel;
	
	// The edges of the area (in units) that the obstacles can move within
	private _leftEdge:number;
	private _rightEdge:number;
	
	// The level's obstacles.
	private _obstacles:Obstacle[];
	
	//The ObstacleManager will only use this amount of the available obstacles
	private _obstacleCount:number;
	
	
	/**
	 * The left edge (in units) of the area that the obstacles can move within
	 */
    get leftEdge() { return this._leftEdge; }
	
	/**
	 * The right edge (in units) of the area that the obstacles can move within
	 */
    get rightEdge() { return this._rightEdge; }
	
	/**
	 * The amound of obstacles that the manager will currently make use of
	 */
	get currentObstacleCount() { return this._obstacleCount }
	
	
	
    constructor()
    {
        this._leftEdge = 0;
        this._rightEdge = 0;
        
		this._obstacles = [];
        
        this._obstacleCount = 0;
    }
    
	/**
	 * Sets the horizontal area that we want the obstacles to be able to move in
	 * @param left the left edge (in units)
	 * @param right the right edge (in units)
	 */
    setAreaEdges(left:number, right:number):void
    {
        this._leftEdge = left;
        this._rightEdge = right;
    }
    
	/**
	 * Give the manager the obstacles for the level
	 * @param obstacles the obstacles
	 */
    setObstacleModels(obstacles:Obstacle[]):void
    {
        this._obstacles = obstacles;
    }
    
	/**
	 * How many obstacles should be in play at this time?
	 * (This will affect the difficulty)
	 * @param num the amount of obstacles
	 */
    setCurrentObstacleCount(num:number):void
    {
        this._obstacleCount = num;
    }
    
	/**
	 * Store a reference to the player model
	 * @param model the player model
	 */
	setPlayerModel(model:IModel):void
	{
		this.playerModel = model;
	}
    
    /**
	 * Sends another obstacle (if one is needed) at a random(ish) position
	 */
    sendObstacle():void
    {
		if(this._obstacleCount === 0) return;
		
		const lastAvailableObstacleIndex = (this._obstacles.length <= this._obstacleCount) 
			? this._obstacles.length - 1
			: this._obstacleCount - 1;
		
        for(let i = 0; i <= lastAvailableObstacleIndex; i++)
        {
			const obstacle = (this._obstacles[i]);
			
            if(this._isTimeToSendNextObstacle(obstacle, i))
				obstacle.resetToStart(this._getObstacleXPosition(obstacle, i));
        }
    }
	
	/**
	 * Should a given obstacle be sent down the road?
	 * @param obstacle the obstacle
	 * @param obstacleIndex the index of the obstacle in the _obstacles array
	 * @returns true if we should send this obstacle, or false if not
	 */
	private _isTimeToSendNextObstacle(obstacle:Obstacle, obstacleIndex:number):boolean
	{
		if(!obstacle.active)
		{
			const kernel = Kernel.getInstance();
			
			if (obstacleIndex === 0) 
				return true;
			
			const previousObstacle = this._obstacles[obstacleIndex - 1];
			const vanishingPointDepth = (kernel.level as ASLevel).vanishingPointDepth;
			
			const previousObstacleHasMovedFarEnough = 
				(previousObstacle.z + (vanishingPointDepth / this._obstacleCount) < vanishingPointDepth);
			
			return (previousObstacle.active && previousObstacleHasMovedFarEnough);
		}
		
		return false;
	}
	
	/**
	 * Get a random(ish) x position for an obstacle
	 * @param obstacle the obstacle
	 * @param obstacleIndex the index of the obstacle in the _obstacles array
	 * @returns the x position (in units) that this obstacle should be placed at
	 */
	private _getObstacleXPosition(obstacle:Obstacle, obstacleIndex:number):number
	{
		if((obstacleIndex + 1) % 3 == 0) //the third of every 3 obstacles
		{
			// put somewhere on left side of level
			return this._getRandomXPosInFirstHalfOfArea(obstacle.width);
		
		} else if((obstacleIndex + 2) % 3 == 0) //the second of every 3 obstacles
		{
			// now on the right side
			const halfOfAreaWidth = ((this._rightEdge - this._leftEdge) / 2);
			return this._getRandomXPosInFirstHalfOfArea(obstacle.width) + halfOfAreaWidth;
		
		} else //the first of every 3 obstacles
		{
			// put where player is
			return this._getObstacleXPositionCenteredOnPlayer(obstacle.width, this.playerModel);
		}
	}
	
	/**
	 * Generates a random position within the first half of the set obstacle area
	 * @param currentObstacleWidth the width of the obstacle in question
	 * @returns an x position in the first half of the set area
	 */
	private _getRandomXPosInFirstHalfOfArea(currentObstacleWidth:number):number
	{
		return (Math.random() * (((this._rightEdge - currentObstacleWidth) - this._leftEdge) / 2));
	}
	
	/**
	 * Gets the x position for a obstacle, centered on the player
	 * @param currentObstacleWidth the width of the obstacle in question
	 * @param player the model of the player
	 * @returns the correct x position for an obstacle, centered on the player's x position
	 */
	private _getObstacleXPositionCenteredOnPlayer(currentObstacleWidth:number, player:IModel)
	{
		const playerCenter = (player.x + (player.width / 2));
		const obstacleCenter = (currentObstacleWidth / 2)
		
		let obstacleXPos = playerCenter - obstacleCenter;
		
		if(obstacleXPos < this._leftEdge)
		{
			return this._leftEdge;
		} 
		else if (obstacleXPos + currentObstacleWidth > this._rightEdge)
		{
			return this._rightEdge - currentObstacleWidth;
		}
		
		return obstacleXPos;
	}
}