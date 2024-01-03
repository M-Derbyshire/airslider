import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import IModel from '../../models/Model/IModel';

/**
 * Manages the shocker models, setting their x positions and sending them down the road
 */
export default class ShockerManager
{
	protected kernel:IKernel;
	protected helpers:IHelpers;
	
	// The model of the player character
	protected playerModel:IModel;
	
	// The edges of the area (in units) that the shockers can move within
	private _leftEdge:number;
	private _rightEdge:number;
	
	// The span of indexes in the loadedModels array that contain the level's shockers.
	private _fromIndex:number;
	private _toIndex:number;
	
	//The ShockerManager will only use this amount of the available shockers
	private _shockerCount:number;
	
	
	/**
	 * The left edge (in units) of the area that the shockers can move within
	 */
    get leftEdge() { return this._leftEdge; }
	
	/**
	 * The right edge (in units) of the area that the shockers can move within
	 */
    get rightEdge() { return this._rightEdge; }
	
	/**
	 * The amound of shockers that the manager will currently make use of
	 */
	get currentShockerCount() { return this._shockerCount }
	
	/**
	 * The range of indexes (in the loadedModels array) for the shockers
	 */
	get shockerModelRange():{from:number, to:number} { return { from: this._fromIndex, to: this._toIndex }; }
	
	
	
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
		
        this._leftEdge = 0;
        this._rightEdge = 0;
        
        this._fromIndex = 0;
        this._toIndex = 0;
        
        this._shockerCount = 0;
    }
    
	/**
	 * Sets the horizontal area that we want the shockers to be able to move in
	 * @param left the left edge (in units)
	 * @param right the right edge (in units)
	 */
    setAreaEdges(left:number, right:number):void
    {
        this._leftEdge = left;
        this._rightEdge = right;
    }
    
	/**
	 * Set the range of indexes in the kernel's loadedModels array that contains the level's shockers
	 * @param fromModelIndex the first model index
	 * @param toModelIndex the last model index
	 */
    setShockerModelRange(fromModelIndex:number, toModelIndex:number):void
    {
        this._fromIndex = fromModelIndex;
        this._toIndex = toModelIndex;
    }
    
	/**
	 * How many shockers should be in play at this time?
	 * (This will affect the difficulty.)
	 * @param num the amount of shockers
	 */
    setCurrentShockerCount(num:number):void
    {
        this._shockerCount = num;
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
	 * Sends another shocker (if one is needed) at a random(ish) position
	 */
    sendShockers():void
    {
		if(this._shockerCount === 0) return;
		
		const totalShockerCount = (this._toIndex - this._fromIndex);
		
		const lastAvailableShockerIndex = (totalShockerCount <= this._shockerCount) 
			? this._toIndex 
			: (this._fromIndex + this._shockerCount) - 1;
		
		
        for(let i = this._fromIndex; i <= lastAvailableShockerIndex; i++)
        {
			const currentShocker = this.kernel.loadedModels[i];
			
            if(this._isTimeToSendNextShocker(i))
            {
				currentShocker.x = this._getShockerXPosition(i);
                currentShocker.z = this.helpers.zCalc.vanishingPointDepth;
                currentShocker.active = true;
            }
        }
    }
	
	/**
	 * Should a given shocker be sent down the road?
	 * @param currentModelIndex the model index of the shocker
	 * @returns true if we should send this shocker, or false if not
	 */
	private _isTimeToSendNextShocker(currentModelIndex:number):boolean
	{
		const currentShocker = this.kernel.loadedModels[currentModelIndex];
		
		if(!currentShocker.active)
		{
			if (currentModelIndex === this._fromIndex) 
				return true;
			
			const previousShocker = this.kernel.loadedModels[currentModelIndex - 1];
			const vanishingPointDepth = this.helpers.zCalc.vanishingPointDepth;
			
			const previousShockerHasMovedFarEnough = 
				(previousShocker.z + (vanishingPointDepth / this._shockerCount) < vanishingPointDepth);
			
			return (previousShocker.active && previousShockerHasMovedFarEnough);
		}
		
		return false;
	}
	
	/**
	 * Get a random(ish) x position for a shocker
	 * @param currentShockerIndex the index of the shocker in question
	 * @returns the x position (in units) that this shocker should be placed at
	 */
	private _getShockerXPosition(currentShockerIndex:number):number
	{
		const currentShocker = this.kernel.loadedModels[currentShockerIndex];
		
		if((currentShockerIndex + 1) % 3 == 0) //the third of every 3 shockers
		{
			// put somewhere on left side of level
			return this._getRandomXPosInFirstHalfOfArea(currentShocker.width);
		
		} else if((currentShockerIndex + 2) % 3 == 0) //the second of every 3 shockers
		{
			// now on the right side
			const halfOfAreaWidth = ((this._rightEdge - this._leftEdge) / 2);
			return this._getRandomXPosInFirstHalfOfArea(currentShocker.width) + halfOfAreaWidth;
		
		} else //the first of every 3 shockers
		{
			// put where player is
			return this._getShockerXPositionCenteredOnPlayer(currentShocker.width, this.playerModel);
		}
	}
	
	/**
	 * Generates a random position within the first half of the set shocker area
	 * @param currentShockerWidth the width of the shocker in question
	 * @returns an x position in the first half of the set area
	 */
	private _getRandomXPosInFirstHalfOfArea(currentShockerWidth:number):number
	{
		return (Math.random() * (((this._rightEdge - currentShockerWidth) - this._leftEdge) / 2));
	}
	
	/**
	 * Gets the x position for a shocker, centered on the player
	 * @param currentShockerWidth the width of the shocker in question
	 * @param player the model of the player
	 * @returns the correct x position for a shocker, centered on the player's x position
	 */
	private _getShockerXPositionCenteredOnPlayer(currentShockerWidth:number, player:IModel)
	{
		const playerCenter = (player.x + (player.width / 2));
		const shockerCenter = (currentShockerWidth / 2)
		
		let shockerXPos = playerCenter - shockerCenter;
		
		if(shockerXPos < this._leftEdge)
		{
			return this._leftEdge;
		} 
		else if (shockerXPos + currentShockerWidth > this._rightEdge)
		{
			return this._rightEdge - currentShockerWidth;
		}
		
		return shockerXPos;
	}
}