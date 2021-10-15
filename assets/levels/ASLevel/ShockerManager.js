import Kernel from '/kernel/kernel';

export default class ShockerManager
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
		this.playerModelIndex;
		
        this._leftEdge = 0;
        this._rightEdge = 0;
        
        //The span of indexes in the loadedModels array that contain
        //the level's shockers.
        this._fromIndex = 0;
        this._toIndex = 0;
        
        //The ShockerManager will only use this amount of the available shockers
        this._shockerCount = 0;
    }
    
    
	//Set the horizontal span of the area you want the shockers
	//to be able to move in.
    setAreaEdges(left, right)
    {
        this._leftEdge = left;
        this._rightEdge = right;
    }
    
    get leftEdge() { return this._leftEdge; }
    get rightEdge() { return this._rightEdge; }
    
	
    setShockerModelRange(fromModelIndex, toModelIndex)
    {
        this._fromIndex = fromModelIndex;
        this._toIndex = toModelIndex;
    }
    
    get shockerModelRange() { return { from: this._fromIndex, to: this._toIndex }; }
    
	//How many shockers should be in play at this time?
    //(This will affect the difficulty.)
    setCurrentShockerCount(num)
    {
        this._shockerCount = num;
    }
    
    get currentShockerCount() { return this._shockerCount }
    
	setPlayerModelIndex(index)
	{
		this._playerModelIndex = index;
	}
    
    
	
    sendShockers()
    {
        for(let i = this._fromIndex; i <= this._toIndex; i++)
        {
			const currentShocker = this.kernel.loadedModels[i];
			
            if(this._isTimeToSendNextShocker(i))
            {
				currentShocker.x = this._getShockerXPosition(i);
				
                currentShocker.z = this.helpers.zCalc.vPointDepth;
                currentShocker.active = true;
            }
        }
    }
	
	_isTimeToSendNextShocker(currentModelIndex)
	{
		const currentShocker = this.kernel.loadedModels[currentModelIndex];
		
		if(!currentShocker.active)
		{
			if (currentModelIndex === this._fromIndex) 
			{
				return true;
			}
			else
			{
				const previousShocker = this.kernel.loadedModels[currentModelIndex - 1];
				const vanishingPointDepth = this.helpers.zCalc.vPointDepth;
				
				const previousShockerHasMovedFarEnough = 
					(previousShocker.z + (vanishingPointDepth / this._shockerCount) < vanishingPointDepth);
				
				return (previousShocker.active && previousShockerHasMovedFarEnough);
			}
		}
		
		return false;
	}
	
	_getShockerXPosition(currentShockerIndex)
	{
		const currentShocker = this.kernel.loadedModels[currentShockerIndex];
		
		if((currentShockerIndex + 1) % 3 == 0) //the third of every 3 shockers
		{
			// put somewhere on left side of level
			return this._getRandomXPosInFirstHalfOfArea(currentShocker.width) + this._leftEdge;
		
		} else if((currentShockerIndex + 2) % 3 == 0) //the second of every 3 shockers
		{
			// now on the right side
			const halfOfAreaWidth = ((this._rightEdge - this._leftEdge) / 2);
			
			return this._getRandomXPosInFirstHalfOfArea(currentShocker.width) + halfOfAreaWidth;
		
		} else //the first of every 3 shockers
		{
			// put where player is (on the x-coordinate)
			const player = this.kernel.loadedModels[this._playerModelIndex];
			
			return this._getShockerXPositionCenteredOnPlayer(currentShocker, player);
		}
	}
	
	_getRandomXPosInFirstHalfOfArea(currentShockerWidth)
	{
		return (Math.random() * (((this._rightEdge - currentShockerWidth) - this._leftEdge) / 2));
	}
	
	_getShockerXPositionCenteredOnPlayer(currentShocker, player)
	{
		const playerCenter = (player.x + (player.width / 2));
		const shockerCenter = (currentShocker.width / 2)
		
		let shockerXPos = playerCenter - shockerCenter;
		
		if(shockerXPos < this._leftEdge)
		{
			shockerXPos = this._leftEdge;
		} 
		else if (shockerXPos + currentShocker.width > this._rightEdge)
		{
			shockerXPos = this._rightEdge - currentShocker.width;
		}
		
		return shockerXPos
	}
}