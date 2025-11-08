import { IDrawDimensions, IDrawPositions } from "../../../engines/GraphicEngine/IGraphicEngine";
import IZCalcStrategy from "./IZCalcStrategy";

/**
 * Strategy for the ZCalc. This strategy is for levels/games that want no z-scaling at all
 */
export default class NoScalingStrategy implements IZCalcStrategy {
    /**
     * Takes the given X/Y/Width/Height values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param pixelValues the original X/Y positions and width/height (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled X/Y/Width/Height
     */
    getDrawValues(pixelValues: IDrawPositions & IDrawDimensions, zPosition: number, showNegative?: boolean): IDrawPositions & IDrawDimensions {
        return pixelValues;
    }
};