class ZCalc 
{
    constructor(unitsWithinCamera)
    {
        this.kernel = Kernel.getInstance();
        
        this._unitsWithinCamera = unitsWithinCamera;
        
        //Vanishing point settings
        this._vPointX;
        this._vPointY;
        this._vPointDepth; //the max z position
        
        //The vanishing point is defined in literal canvas positions,
        //so these functions will be used to calculate the new values
        //on a screen resize.
        this._calcVPointX = () => {};
        this._calcVPointY = () => {};
        
        //A precalculated value based on the depth set
        //(This is explained in the "Scaled Positions and Dimensions" section)
        this._calcDepth;
    }
    
    //-------------------------- getters and setters ----------------------------
    
    get vPointX(){return this._vPointX;}
         
    get vPointY(){return this._vPointY;}
    
    get vPointDepth(){return this._vPointDepth;}
    
    //Provide functions that will set the exact canvas position (these should be called 
    //by the graphic engine if the canvas is resized.). Also, provide how many units you 
    //want in depth (models will move along the z-axis faster if you set the depth to a 
    //smaller amount, and vice-versa).
    setVanishPoint(canvasXPosCalcFunction, canvasYPosCalcFunction, depth = 1000)
     {
        this._calcVPointX = canvasXPosCalcFunction;
        this._calcVPointY = canvasYPosCalcFunction;
        
        this.resetVanishPointPosition();
        this._vPointDepth = depth;
        
        //Precalculating this here. 
        //It is explained in the "Scaled Positions and Dimensions" section below.
        this._calcDepth = depth / 8; 
    }
    
    resetVanishPointPosition()
    {
        this._vPointX = this._calcVPointX();
        this._vPointY = this._calcVPointY();
    }
    
    //-------------------------- Z Axis Speed ----------------------------------
    
    //This is used to keep the speed on the z-axis consistent (so the changing fps is not a problem)
    speed(speed, fps)
    {
        return ((this._vPointDepth / this._unitsWithinCamera) * speed) / fps;
    }
    
    //------------------- Scaled Positions and Dimensions ---------------------
    
    //   If the z position is greater than the vanishing point, then the sprite doesn't
    // need to be displayed. The developer may also want it to not be displayed if the z 
    // position is less than 0. If either is true (and the developer hasn't provided the bool
    // value to these methods to allow negative values), then the x, y, width and
    // height methods will all return 0.

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
    
    // The z position and returned dimension values are changed within the methods first,
    // if negative z positions are allowed and one is provided.

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
    
    // Again, there is a change to the z position and returned axis position if a negative values
    // are allowed, and one is provided.
    
    x(xPos, zPos, showNegative = false)
    {
        return this._position(zPos, xPos, this.vPointX, showNegative);
    }
    
    y(yPos, zPos, showNegative = false)
    {
        return this._position(zPos, yPos, this.vPointY, showNegative);
    }
    
    width(width, zPos, showNegative = false)
    {
        return this._dimension(zPos, width, showNegative);
    }
    
    height(height, zPos, showNegative = false)
    {
        return this._dimension(zPos, height, showNegative);
    }
    
    _isOutOfView(zPos) //if the given z position is not viewable
    {
        return (zPos > this._vPointDepth || zPos < 0);
    }
    
    //Takes the model's z position, the model's x or y position,
    //and the vanishing point value for that axis.
    //Returns the scaled value for the position on that axis.
    _position(zPos, axisPos, axisVPoint, showNegative)
    {
        if(!showNegative && this._isOutOfView(zPos))
        {
            return 0;
        } else {
			
			//The for loop below needs a positive zPos, so if zPos is negative,
			//make it positive (we'll flip it back later).
            const origZPos = zPos;
            const origPosition = axisPos
            zPos = (showNegative && origZPos < 0) ? -zPos : zPos;
            
            for(let i = 0; i < zPos; i++)
            {
                axisPos += ((axisVPoint - axisPos) / this._calcDepth);
            }
            
            //If the zPos was made positive, flip the result back to negative.
            return (showNegative && origZPos < 0) ? origPosition + (origPosition - axisPos) : axisPos;
        }
    }
    
    //Same concept as above, except does this with the dimensions instead of the positions
    _dimension(zPos, dimension, showNegative)
    {
        if(!showNegative && this._isOutOfView(zPos))
        {
            return 0;
        } else {
			
			//The for loop below needs a positive zPos, so if zPos is negative,
			//make it positive (we'll flip it back later).
            const origZPos = zPos;
            const origDimension = dimension;
            zPos = (showNegative && origZPos < 0) ? -zPos : zPos;
            
            for(let i = 0; i < zPos; i++)
            {
                dimension -= (dimension / this._calcDepth);
            }
            
			//If the zPos was made positive, flip the result back to negative.
            return (showNegative && origZPos < 0) ? origDimension + (origDimension - dimension) : dimension;
        }
    }
}