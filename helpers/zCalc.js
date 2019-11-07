class ZCalc 
{
    constructor()
    {
        //vanishing point is set with vPointX and vPointY
        this._vPointX;
        this._vPointY;
        
        this._vPointDepth; //the max z position
        
        //A precalculated value based on the depth set
        //(This is explained in the "Scaled Positions and Dimensions" section)
        this._calcDepth;
    }
    
    //-------------------------- getters and setters ----------------------------
    
    get vPointX(){return this._vPointX;}
    get vPointY(){return this._vPointY;}
    get vPointDepth(){return this._vPointDepth;}
    
    setVanishPoint(x, y, depth)
    {
        this._vPointX = x;
        this._vPointY = y;
        this._vPointDepth = depth;
        
        //Precalculating this here. 
        //It is explained in the "Scaled Positions and Dimensions" section below.
        this._calcDepth = depth / 8; 
    }
    
    //---------------------------- Methods -------------------------------------
    
    //-------------------------- Z Axis Speed ----------------------------------
    
    //This is used to keep the speed on the z-axis consistent (so the changing fps is not a problem)
    speed(speed, fps)
    {
        return ((this._vPointDepth / 1000) * speed) / fps;
    }
    
    //------------------- Scaled Positions and Dimensions ---------------------
    
    //   If the z position is less than 0, or greater than the vanishing point,
    // then the sprite doesn't need to be displayed. Therefore, x, y, width and
    // height will all return 0.

    //   If not, then the display positions and dimensions for the sprite will 
    // need to be calculated, based on the model's position on the z axis.

    // Calculating the dimensions:
    //   The original solution to this was to divide the dimension by the vanishing
    // point's depth, in order to get a "depth unit" (the amount of change for one 
    // z axis move). The method would then return: dimension - (zPos * depthUnit).

    //   However, the problem with this solution was that, with every move on the
    // z axis, the dimension was getting smaller and smaller. Think of it like this:
    // 25% of 100 is 25. 100 - 25 = 75 (a 25% change);
    // 75 - 25 = 50 (a 33.333% change on the 75);
    // 50 - 25 = 25 (a 50% change on the 50); etc.
    //   Therefore, as the model increased its z axis, its movement seemed to speed up.

    //   Because of this, a new depth unit will need to be calculated for every 
    // point of the z axis. Therefore, we use a for loop over the zPos, and minus a
    // fresh depth unit from the dimension. Finally, we return the new dimension value.

    //   The depth unit is calculated by taking the new dimension value, and dividing
    // it by: (vanishingPointDepth / 8).
    //   The reason for the division on the vanishing point depth (which is pre-calculated
    // into this._calcDepth) is because, even though the speed of movement will appear
    // consistent, the continuous reduction of the dimension means that, if you just divided by the
    // vanishing point depth, the dimension would never reach 0 when at the deepest depth. 
    //   Dividing by 8 was settled on through trial and error.

    // Calculating the positions (x/y):
    //   This is essentially the same procedure as with the dimensions, except for 2 differences:
    // 1 - The position value is increased, not decreased.
    // 2 - The vanishing point's position is taken into account in the calculations, in order to 
    // make the sprite move towards/from it.
    
    x(xPos, zPos)
    {
        return this._position(zPos, xPos, this._vPointX);
    }
    
    y(yPos, zPos)
    {
        return this._position(zPos, yPos, this._vPointY);
    }
    
    width(width, zPos)
    {
        return this._dimension(zPos, width);
    }
    
    height(height, zPos)
    {
        return this._dimension(zPos, height);
    }
    
    //Takes the model's z position, the model's x or y position,
    //and the vanishing point value for that axis.
    //Returns the scaled value for the position on that axis.
    _position(zPos, axisPos, axisVPoint)
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
    _dimension(zPos, dimension)
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