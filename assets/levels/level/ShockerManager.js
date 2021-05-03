import Kernel from '/kernel/kernel';

export default class ShockerManager
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        //The horizontal span of the area you want the shockers
        //to be able to move in.
        this._leftEdge = 0;
        this._rightEdge = 0;
        
        //The span of indexes in the loadedModels array that contain
        //the level's shockers.
        this._fromIndex = 0;
        this._toIndex = 0;
        
        //The ShockerManager will only use this amount of the available shockers
        this._shockerCount = 0;
    }
    
    
    setAreaEdges(left, right)
    {
        this._leftEdge = left;
        this._rightEdge = right;
    }
    
    get leftEdge() { return this._leftEdge; }
    get rightEdge() { return this._rightEdge; }
    
    setShockerModelRange(from, to)
    {
        //The loadedModels array should only contain shockers
        //between these 2 index numbers
        this._fromIndex = from;
        this._toIndex = to;
    }
    
    get shockerModelRange() { return { from: this._fromIndex, to: this._toIndex }; }
    
    setCurrentShockerCount(num)
    {
        //How many shockers should be in play at this time?
        //This will affect the difficulty.
        this._shockerCount = num;
    }
    
    get currentShockerCount() { return this._shockerCount }
    
    
    
    sendShockers()
    {
        for(let i = this._fromIndex; i <= this._toIndex; i++)
        {
            //If this is the first shocker and it's not active,
            //or this isn't active but the one before it is (And the one before 
            //has moved far enough to warrant this one now being sent.
            // How far these need to go before the next is sent depends on
            // _shockerCount. It will try to ensure a consistent amount of shockers
            // being sent, so the lower/higher the shockerCount, the longer/shorter
            // the distance between them, making the game easier/harder.)
            if((!this.kernel.loadedModels[i].active && i == this._fromIndex) || 
                (!this.kernel.loadedModels[i].active && this.kernel.loadedModels[i - 1].active && 
                    (this.kernel.loadedModels[i - 1].z + 
                        (this.helpers.zCalc.vPointDepth / this._shockerCount) < this.helpers.zCalc.vPointDepth)))
            {
                // need to set some to be where the Tarian is, so player can't just stay in one place
                let shockerXPos;
                
                //player character
                let playerX = this.kernel.loadedModels[0].x;
                let playerWidth = this.kernel.loadedModels[0].width;
                
                if((i + 1) % 3 == 0) //if this is every third in every 3 shockers
                {
                    // put somewhere on left side of level
                    shockerXPos = (Math.random() * (((this._rightEdge - this.kernel.loadedModels[i].width) - this._leftEdge) / 2)) + this._leftEdge;
                
                } else if((i + 2) % 3 == 0) //if this is every second in every 3 shockers
                {
                    // now on the right side
                    shockerXPos = (Math.random() * (((this._rightEdge - this.kernel.loadedModels[i].width) - this._leftEdge) / 2)) + ((this._rightEdge - this._leftEdge) / 2);
                
                } else //If this is first in every 3 shockers
                {
                    // put where player is (x coordinate)
                    
                    
                    let shockerWidth = this.kernel.loadedModels[i].width;
                    
                    // want their center points to line up
                    shockerXPos = (playerX + (playerWidth / 2)) - (shockerWidth / 2);
                    
                    //now make sure they are within the bounds of the level
                    if(shockerXPos < this._leftEdge)
                    {
                        shockerXPos = this._leftEdge;
                    } else if (shockerXPos + shockerWidth > this._rightEdge)
                    {
                        shockerXPos = this._rightEdge - shockerWidth;
                    }
                }
                
                this.kernel.loadedModels[i].z = this.helpers.zCalc.vPointDepth;
                this.kernel.loadedModels[i].x = shockerXPos;
                
                this.kernel.loadedModels[i].active = true;
            }
        }
    }
}