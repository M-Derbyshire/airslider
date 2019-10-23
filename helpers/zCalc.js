class ZCalc 
{
    //I'm going to say this right now:
    //I don't know how I did it, but I did it.
    // -- Darbs
    
    constructor()
    {
        //vanishing point is set with vPointX and vPointY
        this._vPointX;
        this._vPointY;
        
        this._vPointDepth; //the max z position
        this._calcDepth; //used when calculating the depth
    }
    
    //getters and setters -----------------------------------------
    
    get vPointX(){return this._vPointX;}
    get vPointY(){return this._vPointY;}
    get vPointDepth(){return this._vPointDepth;}
    
    setVanishPoint(x, y, depth)
    {
        this._vPointX = x;
        this._vPointY = y;
        this._vPointDepth = depth;
        this._calcDepth = (depth / 32);
    }
    
    //-----------------------------------------------------------------
    
    speed(speed)
    {
        return ((this._vPointDepth / 1000) * speed) / kernel.fps;
    }
    
    x(xPos, zPos)
    {
        return this.position(zPos, xPos, this._vPointX);
    }
    
    y(yPos, zPos)
    {
        return this.position(zPos, yPos, this._vPointY);
    }
    
    width(width, zPos)
    {
        return this.dimension(zPos, width);
    }
    
    height(height, zPos)
    {
        return this.dimension(zPos, height);
    }
    
    //Takes the model's z position, then the model's x or y position for the axis,
    //and then the vanishing point value for that axis.
    //Returns the scaled value for the position on that axis.
    position(zPos, axisPos, axisVPoint)
    {
        if(zPos > this._vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = this.calculateLoopZPos(zPos)
            for(let i = 0; i <= zPos; i++)
            {
                axisPos += ((axisVPoint - axisPos) / this._calcDepth);
            }
            return axisPos;
        }
    }
    
    //Same concept as above, except does this with the dimensions instead of the positions
    dimension(zPos, dimension)
    {
        if(zPos > this._vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = this.calculateLoopZPos(zPos)
            for(let i = 0; i <= zPos; i++)
            {
                dimension -= (dimension / this._calcDepth);
            }
            return dimension;
        }
    }
    
    //Makes changes to the zPos that are needed before being used in the for loop.
    //I apologise for not being able to go into more detail, but as I said at the top,
    //the explanation for this has been lost to the depths of my subconcious.
    calculateLoopZPos(zPos)
    {
        return (zPos - 1) / 4;
    }
}

var zCalc = new ZCalc();