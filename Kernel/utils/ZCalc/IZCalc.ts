import IDrawDimensions from "../../engines/GraphicEngine/IDrawDimensions";
import IDrawPositions from "../../engines/GraphicEngine/IDrawPositions";
import IZCalcStrategy from "./strategies/IZCalcStrategy";

/**
 * Provides methods to calculate the correct positions/dimensions for drawing an element, based on its position on the z axis.
 * Also provides methods relating to keeping a consistent speed (regardless of a changing FPS) on the z axis.
 */
export default interface IZCalc {
    /**
     * Changes the strategy to be used
     * @param strategy the new strategy
     */
    setStrategy(strategy:IZCalcStrategy):void;
    
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
};