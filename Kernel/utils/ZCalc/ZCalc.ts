import IDrawDimensions from "../../engines/GraphicEngine/IDrawDimensions";
import IDrawPositions from "../../engines/GraphicEngine/IDrawPositions";
import IZCalcStrategy from "./strategies/IZCalcStrategy";
import NoScalingStrategy from "./strategies/NoScalingStrategy";

/**
 * Provides methods to calculate the correct positions/dimensions for drawing an element, based on its position on the z axis.
 */
export default class ZCalc
{
    private static _strategy:IZCalcStrategy = new NoScalingStrategy();
    
    /**
     * Changes the strategy to be used
     * @param strategy the new strategy
     */
    static setStrategy(strategy:IZCalcStrategy):void {
        this._strategy = strategy;
    }
    
    /**
     * Takes the given X/Y/Width/Height values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param pixelValues the original X/Y positions and width/height (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled X/Y/Width/Height
     */
    static getDrawValues(
        pixelValues:IDrawPositions&IDrawDimensions, 
        zPosition: number, 
        showNegative?:boolean
    ):IDrawPositions&IDrawDimensions 
    {
        return this._strategy.getDrawValues(pixelValues, zPosition, showNegative);
    }
}