class ZCalc 
{
    //I'm going to say this right now:
    //I don't know how I did it, but I did it.
    // -- Darbs
    
    constructor()
    {
        //vanishing point is set with vPointX and vPointY
        this.vPointX;
        this.vPointY;
        
        this.vPointDepth; //the max z position
        this.calcDepth; //used when calculating the depth
    }
    
    setVanishPoint(x, y, depth)
    {
        this.vPointX = x;
        this.vPointY = y;
        this.vPointDepth = depth;
        this.calcDepth = (depth / 16);
    }
    
    x(xPos, zPos)
    {
        if(zPos > this.vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = (zPos - 1) / 4;
            for(let i = 0; i <= zPos; i++)
            {
                xPos += ((this.vPointX - xPos) / this.calcDepth);
            }
            return xPos;
        }
    }
    
    y(yPos, zPos)
    {
        if(zPos > this.vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = (zPos - 1) / 4;
            for(let i = 0; i <= zPos; i++)
            {
                yPos += ((this.vPointY - yPos) / this.calcDepth);
            }
            return yPos;
        }
    }
    
    width(width, zPos)
    {
        if(zPos > this.vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = (zPos - 1) / 4;
            for(let i = 0; i <= zPos; i++)
            {
                width -= (width / this.calcDepth);
            }
            return width;
        }
    }
    
    height(height, zPos)
    {
        if(zPos > this.vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            zPos = (zPos - 1) / 4;
            for(let i = 0; i <= zPos; i++)
            {
                height -= (height / this.calcDepth);
            }
            return height;
        }
    }
    
    speed(speed)
    {
        return ((this.vPointDepth / 1000) * speed) / kernel.fps;
    }
}

var zCalc = new ZCalc();