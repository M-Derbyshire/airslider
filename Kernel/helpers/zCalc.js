/**
 * Provides methods to calculate the correct drawing position/dimensions for an element, based on it position on the z axis.
 * Also provides methods relating to consistent speed (regardless of a changing FPS) on the z axis
 */
export default class ZCalc 
{
    /**
     * Constructor
     */
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
        this._calcVPointX = () => 0;
        this._calcVPointY = () => 0;
    }
    
    //-------------------------- getters and setters ----------------------------
    
	/**
     * The x position (not in units) of the vanishing point
     */
    get vPointX(){return this._vPointX;}
	
	/**
     * The y position (not in units) of the vanishing point
     */
    get vPointY(){return this._vPointY;}
    
	/**
     * the "z unit" position of the vanishing point, on the z axis
     */
    get vPointDepth(){return this._vPointDepth;}
    
    /**
     * Used to set the vanishing point. The x and y positions are provided through callback functions, as they may need to change if 
     * the canvas element is resized
     * @param canvasXPosCalcFunction a function that returns the correct x position (not in units) of the vanishing point, on the canvas
     * @param canvasYPosCalcFunction a function that returns the correct y position (not in units) of the vanishing point, on the canvas
     * @param depth how many possible positions should there be on the z axis?
     */
    setVanishPoint(canvasXPosCalcFunction, canvasYPosCalcFunction, depth = 1000)
     {
        this._calcVPointX = canvasXPosCalcFunction;
        this._calcVPointY = canvasYPosCalcFunction;
        
        this._vPointDepth = depth;
		
		this.resetVanishPointPosition();
		this._precalculateScalingMultipliers();
    }
    
	/**
     * Calls the callback functions (that were passed to the setVanishPoint method) for the x/y positions of the vanishing point, and 
     * resets the values in the internal state
     */
    resetVanishPointPosition()
    {
        this._vPointX = this._calcVPointX();
        this._vPointY = this._calcVPointY();
    }
	
    
    //-------------------------- Z Axis Speed ----------------------------------
    
	/**
     * Converts a speed on the z axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the z speed
     * @param fps the game's current Frames Per Second
     * @returns a more consistent value to be used as the actual speed
     */
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
	
	
	/**
     * Takes an x position (not in units), and calculates the correct x position to use, based on the given z position
     * @param xPosition the original x position (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected x position will be returned
     */
    x(xPosition, zPosition, showNegative = false)
    {
        return this._position(zPosition, xPosition, this._vPointX, showNegative);
    }
    
	/**
     * Takes an y position (not in units), and calculates the correct y position to use, based on the given z position
     * @param yPosition the original y position (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected y position will be returned
     */
    y(yPosition, zPosition, showNegative = false)
    {
        return this._position(zPosition, yPosition, this._vPointY, showNegative);
    }
    
	/**
     * Takes a width value (not in units) and calculates the correct value to use, based on the given z position
     * @param width the original width (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected width will be returned
     */
    width(width, zPosition, showNegative = false)
    {
        return this._dimension(zPosition, width, showNegative);
    }
    
	/**
     * Takes a height value (not in units) and calculates the correct value to use, based on the given z position
     * @param height the original height (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected height will be returned
     */
    height(height, zPosition, showNegative = false)
    {
        return this._dimension(zPosition, height, showNegative);
    }
    
	
	/**
	 * Takes a z position, x/y position, and the vanishing point's position on that axis.
	 * Returns the scaled value for the position on that axis.
	 * @param zPosition the z position of the element being drawn
	 * @param axisPosition the x/y position
	 * @param axisVPoint the position of the vanishing point on this axis
	 * @param showNegative should the element still be drawn if the z position is negative?
	 * @returns the scaled value for the position on the given axis, or 0 if the z position is "out of view"
	 */
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
    
    /**
	 * Takes a z position and a width/height value. Returns the scaled value for the width/height.
	 * @param zPosition the z position of the element being drawn
	 * @param dimension the width/height value
	 * @param showNegative should the element still be drawn if the z position is negative?
	 * @returns the scaled width/height value on the given axis, or 0 if the z position is "out of view"
	 */
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
	
	
	/**
	 * Is the given z position not visible?
	 * @param zPosition the z position to check
	 * @param showNegative are negative z positions still considered visible?
	 * @returns true if the position is considered out of view, otherwise false
	 */
	_isOutOfView(zPosition, showNegative)
    {
        return (zPosition > this.vPointDepth || (!showNegative && zPosition < 0));
    }
}