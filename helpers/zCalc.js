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
    
    x(xPos, width, zPos)
    {
        width = this.width(width, zPos);
        let centerPos = xPos + (width / 2);
        let du = (this.vPointX - centerPos) / this.vPointDepth; //the depth units to use
        let drawX = xPos + (zPos * du);
        
        if(zPos > this.vPointDepth)
        {
            return this.vPointX - (width / 2);
        } else {
            return drawX;
        }
    }
    
    y(yPos, height, zPos)
    {
        height = this.height(height, zPos);
        
        let centerPos = yPos + (height / 2);
        let du = (this.vPointY - centerPos) / this.vPointDepth; //the depth units to use
        let drawY = yPos + (zPos * du);
        
        if(zPos > this.vPointDepth)
        {
            return this.vPointY - (height / 2);
        } else {
            return drawY;
        }
    }
    
    width(width, zPos)
    {
        let du = width / this.vPointDepth; //the depth units to use
        width -= zPos * du;
        
        if(zPos > this.vPointDepth)
        {
            return 0;
        } else {
            return width;
        }
    }
    
    height(height, zPos)
    {
        let du = height / this.vPointDepth; //the depth units to use
        height -= zPos * du;
        
        if(zPos > this.vPointDepth)
        {
            return 0;
        } else {
            return height;
        }
    }
}

var zCalc = new ZCalc();