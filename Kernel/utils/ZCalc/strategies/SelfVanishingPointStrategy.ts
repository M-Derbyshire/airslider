import { IDrawDimensions, IDrawPositions } from "../../../engines/GraphicEngine/IGraphicEngine";
import IZCalcStrategy from "./IZCalcStrategy";
import LinearVanishingPointStrategy from "./LinearVanishingPointStrategy";

/**
 * Strategy for the ZCalc. Sprites will be scaled with their center being the vanishing point (so the 
 * center position of the sprite won't change)
 */
export default class SelfVanishingPointStrategy implements IZCalcStrategy {
    private _linearStrategy:LinearVanishingPointStrategy;
    
    constructor()
    {
        const defaultVanishPointDepth = 1000;
        
        // The actual width/height scaling calculations are done by a LinearVanishingPointStrategy instance.
        this._linearStrategy = new LinearVanishingPointStrategy();
        this._linearStrategy.setVanishPoint(0, 0, defaultVanishPointDepth);
    }
    
    /**
     * The amount of possible positions that there should be on the z axis
     */
    get vanishingPointDepth()
    {
        return this._linearStrategy.vanishingPointDepth;
    }
    
    set vanishingPointDepth(depth:number)
    {
        this._linearStrategy.setVanishPoint(0, 0, depth);
    }
    
    /**
     * Takes the given X/Y/Width/Height values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param pixelValues the original X/Y positions and width/height (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled X/Y/Width/Height
     */
    getDrawValues(pixelValues: IDrawPositions & IDrawDimensions, zPosition: number, showNegative?: boolean): IDrawPositions & IDrawDimensions {
        const scaledDimensions = this._linearStrategy.getDrawDimensionValues(pixelValues, zPosition, showNegative);
        
        const widthChange = pixelValues.width - scaledDimensions.width;
        const heightChange = pixelValues.height - scaledDimensions.height;
        
        // We can't use the X/Y from the linearStrategy, as they're aimed at a specific vanishing point.
        // (and we can't change that vanishing point to the sprite's center, because we'd need the 
        // sprites positions/dimensions in units, not pixels, if we wanted to do that)
        const newX = pixelValues.x + (widthChange / 2);
        const newY = pixelValues.y + (heightChange / 2);
        
        return {
            x: newX,
            y: newY,
            width: scaledDimensions.width,
            height: scaledDimensions.height
        };
    }
    
    /**
     * Takes the given X/Y values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param pixelValues the original X/Y positions (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled X/Y
     */
    getDrawPositionValues(
        pixelValues:IDrawPositions, 
        zPosition: number, 
        showNegative?:boolean
    ): IDrawPositions {
        const msg = "The getDrawPositionValues method of the SelfVanishingPointStrategy class has not been implemented. You should use the getDrawValues method instead";
        throw new Error(msg);
    }
    
    /**
     * Takes the given Width/Height values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param pixelValues the original width/height (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled Width/Height
     */
    getDrawDimensionValues(
        pixelValues:IDrawDimensions, 
        zPosition: number, 
        showNegative?:boolean
    ): IDrawDimensions {
        return this._linearStrategy.getDrawDimensionValues(pixelValues, zPosition, showNegative);
    }
};