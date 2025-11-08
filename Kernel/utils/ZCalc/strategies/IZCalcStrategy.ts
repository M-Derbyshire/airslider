import { IDrawDimensions, IDrawPositions } from "../../../engines/GraphicEngine/IGraphicEngine";

/**
 * Represents a strategy that provides behaviours for the z-calculator
 */
export default interface IZCalcStrategy {
    /**
     * Takes the given X/Y/Width/Height values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param pixelValues the original X/Y positions and width/height (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled X/Y/Width/Height
     */
    getDrawValues(
        pixelValues:IDrawPositions&IDrawDimensions, 
        zPosition: number, 
        showNegative?:boolean
    ):IDrawPositions&IDrawDimensions;
    
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
    ):IDrawPositions;
    
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
    ):IDrawDimensions;
};