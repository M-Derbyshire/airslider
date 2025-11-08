import { IDrawDimensions, IDrawPositions } from "../../../engines/GraphicEngine/IGraphicEngine";
import Kernel from "../../../Kernel";
import UnitHelper from "../../UnitHelper";
import IZCalcStrategy from "./IZCalcStrategy";

/**
 * Strategy for the ZCalc. Scales sprites in a direct, straight path towards a set vanishing point
 */
export default class LinearVanishingPointStrategy implements IZCalcStrategy {
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
        
        if(depth !== this._vanishingPointDepth)
        {
            this._vanishingPointDepth = depth;
            this._precalculateScalingMultipliers();
        }
    }
    
    
    
    /*
		------------------- Scaled Positions and Dimensions ---------------------
		
		This strategy gives us the ability to create simple sprite-scaling games,
		by calculating the correct position/dimension values to draw with, based on a
        given z-axis position.
        
        The developer can set a vanishing point, with an X and Y position, and sprites 
        can move towards that point (with a straight, direct path) by moving along the 
        z-axis.
		
		If the z-axis position of the sprite is greater than the vanishing point, or it 
        is a negative number (and the developer doesn't want to display negative values), 
        then the sprite doesn't need to be displayed. In these cases, the x, y, width and height 
		values will be 0.
		
		******************************
		Problem: "The Oatmeal Effect":
		******************************
		
		Originally, the solution for doing this was to create a single unit of change
		for each position/dimension (a "depth unit"), and then multiply that by the Z 
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
		
		To do this, I found that a speed-change curve that was very close to (though not exactly
        matching) a factoral was needed to make this work (so, after a quick drop, the rate of the 
		decrease would slow down and the curve would flatten). This would be difficult to 
		calculate in a O(1) way, so I decided against calculating this during the gameplay.
		
		this._precalculateScalingMultipliers() will pre-calculate an array of "multipliers" (one
		for each position on the z-axis). These multipliers are numbers between 1 and 0, and
        together they make the shape of the required curve. They are then used to modify the passed in 
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
	 * Takes a z position, an x/y position, and the vanishing point's position on the correct axis.
	 * Returns the scaled value for the position on that axis.
	 * @param zPosition the z position of the element being drawn
	 * @param axisPosition the x or y position
	 * @param axisVanishPoint the position of the vanishing point on this axis
	 * @returns the scaled value for the position on the given axis, or 0 if the z position is "out of view"
	 */
    private _position(zPosition:number, axisPosition:number, axisVanishPoint:number):number
    {
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
	 * @returns the scaled width/height value, or 0 if the z position is "out of view"
	 */
    private _dimension(zPosition:number, dimension:number):number
    {
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
    
    /**
     * Takes the given X/Y/Width/Height values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param pixelValues the original X/Y positions and width/height (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled X/Y/Width/Height
     */
    getDrawValues(
        pixelValues: IDrawPositions & IDrawDimensions, 
        zPosition: number, 
        showNegative?: boolean
    ): IDrawPositions & IDrawDimensions {
        if(this._isOutOfView(zPosition, showNegative))
            return { x: 0, y: 0, width: 0, height: 0 };
        
        const kernel = Kernel.getInstance();
        
        const vanishPointPixelsX = UnitHelper.xUnit(this._vanishingPointX);
        const positionedVanishPointPixelsX = kernel.graphicEngine.camera.canvasPositionX + vanishPointPixelsX;
        
        const vanishPointPixelsY = UnitHelper.yUnit(this._vanishingPointY);
        const positionedVanishPointPixelsY = kernel.graphicEngine.camera.canvasPositionY + vanishPointPixelsY;
        
        return {
            x: this._position(zPosition, pixelValues.x, positionedVanishPointPixelsX),
            y: this._position(zPosition, pixelValues.y, positionedVanishPointPixelsY),
            width: this._dimension(zPosition, pixelValues.width),
            height: this._dimension(zPosition, pixelValues.height)
        };
    }
}