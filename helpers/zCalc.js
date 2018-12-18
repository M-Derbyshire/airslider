class ZCalc 
{
    constructor()
    {
        //vanishing point is set with vPointX and vPointY
        this.vPointX;
        this.vPointY;
        
        this.vPointDepth; //the max z position
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
            return xPos + (zPos * du);
        }
    }
    
    y(yPos, zPos)
    {
        if(zPos > this.vPointDepth)
        {
            return 0;
        } else {
            let du = (this.vPointY - yPos) / this.vPointDepth; //the depth units to use
            return yPos + (zPos * du);;
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
            //the greater the zpos, the greater is taken off
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