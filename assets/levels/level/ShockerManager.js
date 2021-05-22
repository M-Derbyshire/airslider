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
                // need to set some to be where the Tarian is, so player can't just stay in one place
                let shockerXPos;
                
                //player character
                let playerX = this.kernel.loadedModels[0].x;
                let playerWidth = this.kernel.loadedModels[0].width;
                
                if((i + 1) % 3 == 0) //if this is every third in every 3 shockers
                {
                    // put somewhere on left side of level
                    shockerXPos = (Math.random() * (((this._rightEdge - currentShocker.width) - this._leftEdge) / 2)) + this._leftEdge;
                
                } else if((i + 2) % 3 == 0) //if this is every second in every 3 shockers
                {
                    // now on the right side
                    shockerXPos = (Math.random() * (((this._rightEdge - currentShocker.width) - this._leftEdge) / 2)) + ((this._rightEdge - this._leftEdge) / 2);
                
                } else //If this is first in every 3 shockers
                {
                    // put where player is (x coordinate)
                    
                    // want their center points to line up
                    shockerXPos = (playerX + (playerWidth / 2)) - (currentShocker.width / 2);
                    
                    //now make sure they are within the bounds of the level
                    if(shockerXPos < this._leftEdge)
                    {
                        shockerXPos = this._leftEdge;
                    } else if (shockerXPos + currentShocker.width > this._rightEdge)
                    {
                        shockerXPos = this._rightEdge - currentShocker.width;
                    }
                }
                
                currentShocker.z = this.helpers.zCalc.vPointDepth;
                currentShocker.x = shockerXPos;
                
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
}