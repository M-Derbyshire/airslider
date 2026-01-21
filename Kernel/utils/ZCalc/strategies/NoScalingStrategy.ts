import ICamera from "../../../engines/GraphicEngine/ICamera";
import { IDrawDimensions, IDrawPositions } from "../../../engines/GraphicEngine/IGraphicEngine";
import IZCalcStrategy from "./IZCalcStrategy";

/**
 * Strategy for the ZCalc. This strategy is for levels/games that want no z-scaling at all
 */
export default class NoScalingStrategy implements IZCalcStrategy {
    /**
     * Takes the given X/Y/Width/Height values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param camera the camera for the level
     * @param pixelValues the original X/Y positions and width/height (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled X/Y/Width/Height
     */
    getDrawValues(camera:ICamera, pixelValues: IDrawPositions & IDrawDimensions, zPosition: number, showNegative?: boolean): IDrawPositions & IDrawDimensions {
        return pixelValues;
    }
    
    /**
     * Takes the given X/Y values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param camera the camera for the level
     * @param pixelValues the original X/Y positions (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled X/Y
     */
    getDrawPositionValues(camera:ICamera, pixelValues:IDrawPositions, zPosition: number, showNegative?:boolean):IDrawPositions {
        return pixelValues;
    }
    
    /**
     * Takes the given Width/Height values (in pixels) and calculates the correct values to draw with, based on the 
     * given Z position
     * @param camera the camera for the level
     * @param pixelValues the original width/height (in pixels)
     * @param zPosition the Z position of the element being drawn
     * @param showNegative should the element still be drawn if the Z position is negative?
     * @returns If the Z position is "out of view", 0 will be returned for all values. Otherwise, the scaled Width/Height
     */
    getDrawDimensionValues(camera:ICamera, pixelValues:IDrawDimensions, zPosition: number, showNegative?:boolean):IDrawDimensions {
        return pixelValues;
    }
};