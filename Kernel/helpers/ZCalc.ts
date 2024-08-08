import Kernel from "../Kernel";
import IZCalc from "./IZCalc";

/**
 * Provides methods to calculate the correct positions/dimensions for drawing an element, based on its position on the z axis.
 * Also provides methods relating to keeping a consistent speed (regardless of a changing FPS) on the z axis.
 */
export default class ZCalc implements IZCalc
{
    private _vanishingPointX:number; // The x position (in units) of the vanishing point
    private _vanishingPointY:number; // The y position (in units) of the vanishing point
    private _vanishingPointDepth:number; // The amount of possible positions that there should be on the z axis
    
    private _precalculatedScalingMultipliers:number[]; // This is explained in the "Scaled Positions and Dimensions" section below
    
    constructor()
    {
        this._vanishingPointX = 0;
        this._vanishingPointY = 0;
		
		this._precalculatedScalingMultipliers = [];
    }
    
    //-------------------------- getters and setters ----------------------------
    
	/**
     * The x position (in units) of the vanishing point
     */
    get vanishingPointX()
    {
        return this._vanishingPointX;
    }
	
	/**
     * The y position (in units) of the vanishing point
     */
    get vanishingPointY()
    {
        return this._vanishingPointY;
    }
    
	/**
     * The amount of possible positions that there should be on the z axis
     */
    get vanishingPointDepth()
    {
        return this._vanishingPointDepth;
    }
    
    /**
     * Used to set the vanishing point.
     * @param x the x position (in units) of the vanishing point
     * @param y the y position (in units) of the vanishing point
     * @param depth the amount of possible positions that there should be on the z axis
     */
    setVanishPoint(x:number, y:number, depth:number = 1000):void
    {
        this._vanishingPointX = x;
        this._vanishingPointY = y;
        this._vanishingPointDepth = depth;
		
		this._precalculateScalingMultipliers();
    }
    
    //-------------------------- Z Axis Speed ----------------------------------
    
	/**
     * Converts a speed on the z axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the z speed
     * @param fps the game's current Frames Per Second
     * @returns a more consistent value to be used as the actual speed
     */
    speed(speed:number, fps:number):number
    {
        return speed / fps;
    }
    
	/*
		------------------- Scaled Positions and Dimensions ---------------------
		
		This class gives us the ability to create sprite-scaling games,
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
		// For X and Y:
		const depthUnit = (vanishingPointX - xPosition) / vanishingPointDepth;
        return xPosition + (zPosition * depthUnit);
		
		// And for Width and Height:
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
		The reason for this division on the vanishing point depth is because (even though the 
		speed of movement will appear consistent) the continuous reduction of the multiplier 
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
	
    /**
     * Pre-calculates the scaling multiplier values. See the "Scaled Positions and Dimensions" section above
     */
    private _precalculateScalingMultipliers():void
	{
        this._precalculatedScalingMultipliers = [];
        
		const shrunkDepth = this._vanishingPointDepth / 8;
		
		let multiplier = 1;
		for(let z = 0; z <= this._vanishingPointDepth; z++)
		{
			this._precalculatedScalingMultipliers.push(multiplier);
			multiplier -= (multiplier / shrunkDepth);
		}
	}
	
	/**
     * Takes an x position (not in units), and calculates the correct x position to draw with, based on the given z position
     * @param xPosition the original x position (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected x position will be returned
     */
    x(xPosition:number, zPosition:number, showNegative:boolean = false):number
    {
        const kernel = Kernel.getInstance();
        
        const vanishPointPixels = kernel.helpers.unit.xUnit(this._vanishingPointX);
        
        const camera = kernel.graphicEngine.camera;
        const positionedVanishPointPixels = camera.canvasPositionX + vanishPointPixels;
        
        return this._position(zPosition, xPosition, positionedVanishPointPixels, showNegative);
    }
    
	/**
     * Takes an y position (not in units), and calculates the correct y position to draw with, based on the given z position
     * @param yPosition the original y position (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected y position will be returned
     */
    y(yPosition:number, zPosition:number, showNegative:boolean = false):number
    {
        const kernel = Kernel.getInstance();
        
        const vanishPointPixels = kernel.helpers.unit.yUnit(this._vanishingPointY);
        
        const camera = kernel.graphicEngine.camera;
        const positionedVanishPointPixels = camera.canvasPositionY + vanishPointPixels;
        
        return this._position(zPosition, yPosition, positionedVanishPointPixels, showNegative);
    }
    
	/**
     * Takes a width value (not in units) and calculates the correct value to draw with, based on the given z position
     * @param width the original width (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected width will be returned
     */
    width(width:number, zPosition:number, showNegative:boolean = false):number
    {
        return this._dimension(zPosition, width, showNegative);
    }
    
	/**
     * Takes a height value (not in units) and calculates the correct value to draw with, based on the given z position
     * @param height the original height (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected height will be returned
     */
    height(height:number, zPosition:number, showNegative:boolean = false):number
    {
        return this._dimension(zPosition, height, showNegative);
    }
	
	/**
	 * Takes a z position, an x/y position, and the vanishing point's position on the correct axis.
	 * Returns the scaled value for the position on that axis.
	 * @param zPosition the z position of the element being drawn
	 * @param axisPosition the x or y position
	 * @param axisVanishPoint the position of the vanishing point on this axis
	 * @param showNegative should the element still be drawn if the z position is negative?
	 * @returns the scaled value for the position on the given axis, or 0 if the z position is "out of view"
	 */
    private _position(zPosition:number, axisPosition:number, axisVanishPoint:number, showNegative:boolean):number
    {
        if(this._isOutOfView(zPosition, showNegative))
            return 0;
		
        // We need a positive z-index to get the scaler, so if it's negative we'll 
        // flip it, then flip the multiplier later to get a negative position again.
        const positiveZPosition = Math.abs(zPosition);
        
        const distanceToVanishPoint = (axisVanishPoint - axisPosition);
        
        const multiplier = this._precalculatedScalingMultipliers[Math.round(positiveZPosition)];
        const invertedMultiplier = (1 - multiplier); // (e.g. 0.25 becomes 0.75)
        const realMultiplier = (zPosition < 0) ? -invertedMultiplier : invertedMultiplier;
        
        return axisPosition + (distanceToVanishPoint * realMultiplier);
    }
    
    /**
	 * Takes a z position and a width/height value. Returns the scaled value for the width/height.
	 * @param zPosition the z position of the element being drawn
	 * @param dimension the width or height value
	 * @param showNegative should the element still be drawn if the z position is negative?
	 * @returns the scaled width/height value, or 0 if the z position is "out of view"
	 */
    private _dimension(zPosition:number, dimension:number, showNegative:boolean):number
    {
        if(this._isOutOfView(zPosition, showNegative))
            return 0;
		
        // We need a positive z-index to get the scaler, so if it's negative we'll flip it 
        // now, then correct the result later.
        const positiveZPosition = Math.abs(zPosition);
        
        const multiplier = this._precalculatedScalingMultipliers[Math.round(positiveZPosition)];
        const changedDimension = (dimension * multiplier);
        
        const result = (zPosition < 0) 
                            ? (dimension + (dimension - changedDimension)) 
                            : changedDimension;
        
        return result;
    }
	
	/**
	 * Is the given z position not visible?
	 * @param zPosition the z position to check
	 * @param showNegative are negative z positions still considered visible?
	 * @returns true if the position is considered out of view, otherwise false
	 */
	private _isOutOfView(zPosition:number, showNegative:boolean):boolean
    {
        return (
            zPosition > this._vanishingPointDepth || // Position is too far in the distance
            (!showNegative && zPosition < 0) // Position is negative, and that's not considered visible
        );
    }
}