class ZCalc 
{
    constructor()
    {
        //vanishing point is set with vPointX and vPointY
        this.vPointX;
        this.vPointY;
        
        this.vPointDepth; //the max z position
        
        //used when calculating the position to draw the model
        this.depthUnitX;
        this.depthUnitY;
    }
    
    setVanishPoint(x, y, depth)
    {
        this.vPointX = x;
        this.vPointY = y;
        this.vPointDepth = depth;
    }
    
    x(xPos, zPos)
    {
        if(zPos > this.vPointDepth)
        {
            return 0;
        } else {
            let du = (this.vPointX - xPos) / this.vPointDepth; //the depth units to use
            let drawX = xPos + (zPos * du);
            return drawX;
        }
    }
    
    y(yPos, zPos)
    {
        if(zPos > this.vPointDepth)
        {
            return 0;
        } else {
            let du = (this.vPointY - yPos) / this.vPointDepth; //the depth units to use
            let drawY = yPos + (zPos * du);
            return drawY;
        }
    }
    
    width(width, zPos)
    {
        if(zPos > this.vPointDepth)
        {
            return 0;
        } else {
            let du = width / this.vPointDepth; //the depth units to use
            return width - (zPos * du);
        }
    }
    
    height(height, zPos)
    {
        if(zPos > this.vPointDepth)
        {
            return 0;
        } else {
            let du = height / this.vPointDepth; //the depth units to use
            return height - (zPos * du);
        }
    }
}

var zCalc = new ZCalc();