class ZCalc 
{
    constructor()
    {
        //vanishing point is set with vPointX and vPointY
        this._vPointX;
        this._vPointY;
        
        this._vPointDepth; //the max z position
        this._calcDepth; //a precalculated value based on the depth set
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
        this._calcDepth = (depth / 8); //precalculating this here.
    }
    
    //-----------------------------------------------------------------
    
    speed(speed) //this is used to keep the speed on the z-axis consistent (especially with the changing fps)
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
    
    //Takes the model's z position, the model's x or y position,
    //and the vanishing point value for that axis.
    //Returns the scaled value for the position on that axis.
    position(zPos, axisPos, axisVPoint)
    {
        if(zPos > this._vPointDepth || zPos < 0)
        {
            return 0;
        } else {
            for(let i = 0; i < zPos; i++)
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
            for(let i = 0; i < zPos; i++)
            {
                dimension -= (dimension / this._calcDepth);
            }
            return dimension;
        }
    }
}

var zCalc = new ZCalc();