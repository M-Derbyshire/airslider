class ShockerManager
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
            if((!this.kernel.loadedModels[i].active && i == this._fromIndex) || (!this.kernel.loadedModels[i].active && this.kernel.loadedModels[i - 1].active && (this.kernel.loadedModels[i - 1].z + (this.helpers.zCalc.vPointDepth / this._shockerCount) < this.helpers.zCalc.vPointDepth)))
            {
                // need to set some to be where the Tarian is, so player can't just stay in one place
                let xPos;
                
                //player character
                let px = this.kernel.loadedModels[0].x;
                let pw = this.kernel.loadedModels[0].width;
                
                if((i + 1) % 3 == 0) //if this is every third in every 3 shockers
                {
                    // put somewhere on left side of level
                    xPos = (Math.random() * (((this._rightEdge - this.kernel.loadedModels[i].width) - this._leftEdge) / 2)) + this._leftEdge;
                
                } else if((i + 2) % 3 == 0) //if this is every second in every 3 shockers
                {
                    // now on the right side
                    xPos = (Math.random() * (((this._rightEdge - this.kernel.loadedModels[i].width) - this._leftEdge) / 2)) + ((this._rightEdge - this._leftEdge) / 2);
                
                } else //If this is first in every 3 shockers
                {
                    // put where player is (x coordinate)
                    
                    //shocker
                    let sw = this.kernel.loadedModels[i].width;
                    
                    // want their center points to line up
                    xPos = (px + (pw / 2)) - (sw / 2);
                    
                    //now make sure they are within the bounds of the level
                    if(xPos < this._leftEdge)
                    {
                        xPos = this._leftEdge;
                    } else if (xPos + sw > this._rightEdge)
                    {
                        xPos = this._rightEdge - sw;
                    }
                }
                
                this.kernel.loadedModels[i].z = this.helpers.zCalc.vPointDepth;
                this.kernel.loadedModels[i].x = xPos;
                
                this.kernel.loadedModels[i].active = true;
            }
        }
    }
}