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
    
    x(xPos, zPos)
    {
        if(zPos > this._vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = (zPos - 1) / 4;
            for(let i = 0; i <= zPos; i++)
            {
                xPos += ((this._vPointX - xPos) / this._calcDepth);
            }
            return xPos;
        }
    }
    
    y(yPos, zPos)
    {
        if(zPos > this._vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = (zPos - 1) / 4;
            for(let i = 0; i <= zPos; i++)
            {
                yPos += ((this._vPointY - yPos) / this._calcDepth);
            }
            return yPos;
        }
    }
    
    width(width, zPos)
    {
        if(zPos > this._vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = (zPos - 1) / 4;
            for(let i = 0; i <= zPos; i++)
            {
                width -= (width / this._calcDepth);
            }
            return width;
        }
    }
    
    height(height, zPos)
    {
        if(zPos > this._vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = (zPos - 1) / 4;
            for(let i = 0; i <= zPos; i++)
            {
                height -= (height / this._calcDepth);
            }
            return height;
        }
    }
    
    speed(speed)
    {
        return ((this._vPointDepth / 1000) * speed) / kernel.fps;
    }
}

var zCalc = new ZCalc();