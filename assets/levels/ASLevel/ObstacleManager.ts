import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import IModel from '../../models/Model/IModel';

/**
 * Manages the level's "obstacle" models, setting their x positions and sending them down the road
 */
export default class ObstacleManager
{
	protected kernel:IKernel;
	protected helpers:IHelpers;
	
	// The model of the player character
	protected playerModel:IModel;
	
	// The edges of the area (in units) that the obstacles can move within
	private _leftEdge:number;
	private _rightEdge:number;
	
	// The span of indexes in the loadedModels array that contains the level's obstacles.
	private _fromIndex:number;
	private _toIndex:number;
	
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
	
	/**
	 * The range of indexes (in the loadedModels array) for the obstacles
	 */
	get obstacleModelRange():{from:number, to:number} { return { from: this._fromIndex, to: this._toIndex }; }
	
	
	
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
		
        this._leftEdge = 0;
        this._rightEdge = 0;
        
        this._fromIndex = 0;
        this._toIndex = 0;
        
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
	 * Set the range of indexes in the kernel's loadedModels array that contains the level's obstacles
	 * @param fromModelIndex the first model index
	 * @param toModelIndex the last model index
	 */
    setObstacleModelRange(fromModelIndex:number, toModelIndex:number):void
    {
        this._fromIndex = fromModelIndex;
        this._toIndex = toModelIndex;
    }
    
	/**
	 * How many obstacles should be in play at this time?
	 * (This will affect the difficulty.)
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
		
		const totalObstacleCount = (this._toIndex - this._fromIndex);
		
		const lastAvailableObstacleIndex = (totalObstacleCount <= this._obstacleCount) 
			? this._toIndex 
			: (this._fromIndex + this._obstacleCount) - 1;
		
		
        for(let i = this._fromIndex; i <= lastAvailableObstacleIndex; i++)
        {
			const currentObstacle = this.kernel.loadedModels[i];
			
            if(this._isTimeToSendNextObstacle(i))
            {
				currentObstacle.x = this._getObstacleXPosition(i);
                currentObstacle.z = this.helpers.zCalc.vanishingPointDepth;
                currentObstacle.active = true;
            }
        }
    }
	
	/**
	 * Should a given obstacle be sent down the road?
	 * @param currentModelIndex the model index of the obstacle
	 * @returns true if we should send this obstacle, or false if not
	 */
	private _isTimeToSendNextObstacle(currentModelIndex:number):boolean
	{
		const currentObstacle = this.kernel.loadedModels[currentModelIndex];
		
		if(!currentObstacle.active)
		{
			if (currentModelIndex === this._fromIndex) 
				return true;
			
			const previousObstacle = this.kernel.loadedModels[currentModelIndex - 1];
			const vanishingPointDepth = this.helpers.zCalc.vanishingPointDepth;
			
			const previousObstacleHasMovedFarEnough = 
				(previousObstacle.z + (vanishingPointDepth / this._obstacleCount) < vanishingPointDepth);
			
			return (previousObstacle.active && previousObstacleHasMovedFarEnough);
		}
		
		return false;
	}
	
	/**
	 * Get a random(ish) x position for an obstacle
	 * @param currentObstacleIndex the index of the obstacle in question
	 * @returns the x position (in units) that this obstacle should be placed at
	 */
	private _getObstacleXPosition(currentObstacleIndex:number):number
	{
		const currentObstacle = this.kernel.loadedModels[currentObstacleIndex];
		
		if((currentObstacleIndex + 1) % 3 == 0) //the third of every 3 obstacles
		{
			// put somewhere on left side of level
			return this._getRandomXPosInFirstHalfOfArea(currentObstacle.width);
		
		} else if((currentObstacleIndex + 2) % 3 == 0) //the second of every 3 obstacles
		{
			// now on the right side
			const halfOfAreaWidth = ((this._rightEdge - this._leftEdge) / 2);
			return this._getRandomXPosInFirstHalfOfArea(currentObstacle.width) + halfOfAreaWidth;
		
		} else //the first of every 3 obstacles
		{
			// put where player is
			return this._getObstacleXPositionCenteredOnPlayer(currentObstacle.width, this.playerModel);
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