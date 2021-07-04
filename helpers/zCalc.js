export default class ZCalc 
{
    constructor()
    {
        //Vanishing point settings
        this._vPointX;
        this._vPointY;
        this._vPointDepth; //the max z position
		
		this._precalculatedScalingMultipliers = [];
        
        //The vanishing point is defined in literal canvas positions,
        //so these functions will be used to calculate the new values
        //on a screen resize.
        this._calcVPointX = () => {};
        this._calcVPointY = () => {};
    }
    
    //-------------------------- getters and setters ----------------------------
    
    get vPointX(){return this._vPointX;}
         
    get vPointY(){return this._vPointY;}
    
    get vPointDepth(){return this._vPointDepth;}
    
    //Here you can provide the functions that will set the exact canvas position (these 
	//should be called by the graphic engine if the canvas is resized). Also, you can 
	//provide how many units you want in depth.
    setVanishPoint(canvasXPosCalcFunction, canvasYPosCalcFunction, depth = 1000)
     {
        this._calcVPointX = canvasXPosCalcFunction;
        this._calcVPointY = canvasYPosCalcFunction;
        
        this._vPointDepth = depth;
		
		this.resetVanishPointPosition();
		this._precalculateScalingMultipliers();
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
        return speed / fps;
    }
    
	
	
	/*
		------------------- Scaled Positions and Dimensions ---------------------
		
		This class is designed to provide the ability to create sprite-scaling games,
		by providing position/dimension values, based on a given z-axis position.
		
		If the z-axis position is greater than the vanishing point, or it is a negative 
		number (and the developer doesn't want to display negative values), then the 
		sprite doesn't need to be displayed. In these cases, the x, y, width and height 
		methods will return 0.
		
		
		******************************
		Problem: "The Oatmeal Effect":
		******************************
		
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
		
		However, the problem with this solution is something called "The Oatmeal Effect". 
		This is where the movement of the sprite being drawn appears to speed up as it gets 
		further along the z-axis (moving towards the vanishing point).
		
		After experimenting with this for a while, I found that the way to solve this was to 
		decrease the speed of the scaling as the z-position got nearer to the vanishing point.
		
		To do this, I found that a curve that was very close to (though not exactly matching) 
		a factoral was needed to make this work (so -- after a quick drop -- the rate of the 
		decrease would slow down and the curve would flatten). This would be difficult to 
		calculate in a O(1) way, so I decided against calculating this during gameplay.
		
		this._precalculateScalingMultipliers() will pre-calculate an array of "multipliers" (one
		for each position on the z-axis). These multipliers are numbers between 1 and 0, and they 
		will match the shape of the required curve. They are then used to modify the passed in 
		dimension/position values (in this._position() and this._dimension()).
		
		During the calculation of the scaling multipliers, a "shrunkDepth" is used. This is 
		the vanishing point depth, divided by 8 (a number chosen through trial and error). 
		The reason for the division on the vanishing point depth is because, even though the 
		speed of movement will appear consistent, the continuous reduction of the multiplier 
		means that any scaled values would not actually reach the vanishing point when at the 
		deepest z-position.
		
		******************************
		Calculating the Dimensions:
		******************************
		
		The given dimension (width/height) value will be decreased by multiplying it by the 
		correct scaling multiplier for the given z-axis position.
		
		******************************
		Calculating the Positions:
		******************************
		
		Calculating the positions (X/Y) is essentially the same procedure as with the dimensions, 
		except for 2 differences:
			1 - The position value is increased, not decreased, as we get further along the z-axis.
			2 - The vanishing point's position is taken into account in the calculations, in order to 
				make the sprite move towards/from it.
    */
	
	_precalculateScalingMultipliers()
	{
		const shrunkDepth = this._vPointDepth / 8;
		
		let multiplier = 1;
		for(let z = 0; z <= this._vPointDepth; z++)
		{
			this._precalculatedScalingMultipliers.push(multiplier);
			multiplier -= (multiplier / shrunkDepth);
		}
	}
	
	
	//Provide the position/dimension value, the z-axis position,
	//and a boolean to confirm if you want to allow negative z 
	//positions.
	
    x(xPosition, zPosition, showNegative = false)
    {
        return this._position(zPosition, xPosition, this._vPointX, showNegative);
    }
    
    y(yPosition, zPosition, showNegative = false)
    {
        return this._position(zPosition, yPosition, this._vPointY, showNegative);
    }
    
    width(width, zPosition, showNegative = false)
    {
        return this._dimension(zPosition, width, showNegative);
    }
    
    height(height, zPosition, showNegative = false)
    {
        return this._dimension(zPosition, height, showNegative);
    }
    
	
	
    //Takes the model's z position, the model's x or y position,
    //and the vanishing point position on that axis.
    //Returns the scaled value for the position on that axis.
    _position(zPosition, axisPosition, axisVPoint, showNegative)
    {
        if(this._isOutOfView(zPosition, showNegative))
        {
            return 0;
        } 
		else 
		{
			//We need a positive z-index, so if it's negative we'll flip it now, then flip the 
			//multiplier once we have it.
			const originalZPosition = zPosition;
            zPosition = (originalZPosition < 0) ? -zPosition : zPosition;
			
			const distanceToVPoint = (axisVPoint - axisPosition);
			const multiplier = this._precalculatedScalingMultipliers[Math.round(zPosition)];
			
			const positiveMultiplier = (1 - multiplier);
			const realMultiplier = ((originalZPosition < 0) ? -positiveMultiplier : positiveMultiplier);
			
			return axisPosition + (distanceToVPoint * realMultiplier);
        }
    }
    
    //Same concept as above, except does this with the dimensions instead of the positions
    _dimension(zPosition, dimension, showNegative)
    {
        if(this._isOutOfView(zPosition, showNegative))
        {
            return 0;
        } 
		else 
		{
			//We need a positive z-index, so if it's negative we'll flip it now, then correct the 
			//result later.
			const originalZPosition = zPosition;
			zPosition = (originalZPosition < 0) ? -zPosition : zPosition;
			
			const positiveMultiplier = this._precalculatedScalingMultipliers[Math.round(zPosition)];
			const changedDimension = (dimension * positiveMultiplier);
			
			return (originalZPosition < 0) ? (dimension + (dimension - changedDimension)) : changedDimension;
        }
    }
	
	
	//Is the given z position not viewable?
	_isOutOfView(zPosition, showNegative)
    {
        return (zPosition > this.vPointDepth || (!showNegative && zPosition < 0));
    }
}