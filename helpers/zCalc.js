class ZCalc 
{
    constructor(unitsWithinCamera)
    {
        this.kernel = Kernel.getInstance();
        
        this._unitsWithinCamera = unitsWithinCamera;
        
        //Vanishing point settings
        this._vPointX;
        this._vPointY;
        this._vPointDepth; //The depth of the vanishing point
		this._depthLimit; //The point along the z-axis where we should stop drawing
        
        //The vanishing point is defined in literal canvas positions,
        //so these functions will be used to calculate the new values
        //whenever the canvas is resized.
        this._calcVPointX = () => {};
        this._calcVPointY = () => {};
    }
    
    //-------------------------- Getters and Setters ----------------------------
    
    get vPointX(){return this._vPointX;}
         
    get vPointY(){return this._vPointY;}
    
    get vPointDepth(){return this._vPointDepth;}
	
	get depthLimit(){return this._depthLimit;}
    
    //Use this to provide functions that will set the exact canvas position (these should 
	//be called by the graphic engine if the canvas is resized.). Also, provide how many 
	//units you want in depth (models will move along the z-axis faster if you set the depth 
	//to a smaller amount, and vice-versa).
    setVanishPoint(canvasXPosCalcFunction, canvasYPosCalcFunction, depth = 1000)
     {
        this._calcVPointX = canvasXPosCalcFunction;
        this._calcVPointY = canvasYPosCalcFunction;
        
        this.resetVanishPointPosition();
        this._vPointDepth = depth;
		this._depthLimit = depth * 0.9;
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
	
	
    /*
		------------------- Scaled Positions and Dimensions ---------------------
		
		This class is designed to provide the ability to create sprite-scaling games,
		by providing position/dimension values, based on a given z-index position.
		
		***********
		Problem: "The Oatmeal Effect":
		***********
		
		Originally, the solution for doing this was to create a single unit of change
		for each position/dimension (a "depth unit"), and then multiply that by the z 
		position:
		
		-------------------------------------------------------------------------
		//For X and Y:
		const depthUnit = (vanishingPointX - xPosition) / vanishingPointDepth;
        return xPosition + (zPosition * depthUnit);
		
		//And for Width and Height:
		const depthUnit = width / vanishingPointDepth;
        return width - (zPosition * depthUnit);
		-------------------------------------------------------------------------
		
		However, the problem with this solution is something called "the oatmeal effect". 
		This is where the movement of the sprite being drawn appears to increase as it 
		moves further along the z-axis. To solve this problem, you need to create a new Z 
		position and then use that. But, rather than this new Z position being the correct 
		position, it will be increased or decreased based on a curve. This curve is created 
		by a "quadratic function" (See the comments in this._getCurvedChange for more info 
		on how this works.).
		
		This solves the problem, however it does mean that the sprites will never reach the 
		vanishing point (just a quirk of it -- in fact, they actually start to move backwards 
		slightly past a certain depth). Because of these quirks, the this._isOutOfView method 
		will use this.depthLimit value to determine when the sprites should no longer be drawn.
	*/
    
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
        return this._dimension(zPos, width, this.vPointX, showNegative);
    }
    
    height(height, zPos, showNegative = false)
    {
        return this._dimension(zPos, height, this.vPointY, showNegative);
    }
    
    //Takes the model's z position, the model's x or y position,
    //and the vanishing point value for that axis.
    //Returns the scaled value for the position on that axis.
    _position(zPos, axisPos, axisVPoint, showNegative)
    {
        if(this._isOutOfView(zPos, showNegative))
        {
            return 0;
        } else {
			
			const totalMovementSpace = axisVPoint - axisPos;
			return axisPos + this._getChange(zPos, totalMovementSpace, showNegative);
			
        }
    }
    
    //Same concept as above, except does this with the dimensions instead of the positions
    _dimension(zPos, dimension, axisVPoint, showNegative)
    {
        if(this._isOutOfView(zPos, showNegative))
        {
            return 0;
        } else {
			
			return dimension - this._getChange(zPos, dimension, showNegative);
			
        }
    }
	
	_isOutOfView(zPos, showNegative) //if the given z position is not viewable
    {
        return (zPos > this.depthLimit || (!showNegative && zPos < 0));
    }
	
	_getChange(zPos, totalChangeSpace, showNegative)
	{
		//The change methods needs a positive zPos (we'll flip the result afterwards)
		const zPosFlipped = (showNegative && zPos < 0);
		if(zPosFlipped) zPos -= zPos;
		
		const change = this._getCurvedChange(zPos, totalChangeSpace);
		
		//If the zPos was flipped to positive, flip the result to negative.
        return zPosFlipped ? -change : change;
	}
	
	_getCurvedChange(zPos, totalChangeSpace)
	{
		/*
			The curve that this change is based on is created by a "quadratic function". 
			Please see the below videos for an explanation of how these work: 
				
			https://www.youtube.com/watch?v=KRwb4YhQPwA
			https://www.youtube.com/watch?v=5yecNfFyvF8&t=318s
			
			As per the 2nd video, we are coming up with the "vertex form" of the curve 
			defined by the below Curve-Vertex and Curve-Later-Point (a point somewhere else 
			on the curve).
			
			The below point settings are the ones I find work best for greatly reducing 
			the oatmeal effect. That being said, they won't actually take you up to the 
			vanishing point.
			
			Also, before getting to the farthest point it can, this actually starts to move 
			you back a little. This is why the depthLimit is set in this.setVanishPoint.
		*/
		
		const curveVertexMain = this.depthLimit;
		
		//Define the curve
		const curveVertexX = curveVertexMain;
		const curveVertexY = curveVertexMain;
		const curveLaterPointX = this.vPointDepth * 2.3;
		const curveLaterPointY = -this.vPointDepth;
		
		//Get the new z-position, using the curve
		const leadingCoefficient = (curveLaterPointY - curveVertexY) / Math.pow(curveLaterPointX - curveVertexX, 2);
		const curvedZPos = (leadingCoefficient * Math.pow(zPos - curveVertexX, 2)) + curveVertexY;
		
		const zUnit = totalChangeSpace / this.vPointDepth; //create a "z unit" (a single unit of movement on the z axis)
		return curvedZPos * zUnit;
		
	}
}