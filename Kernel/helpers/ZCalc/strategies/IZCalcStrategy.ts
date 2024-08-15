import IDrawDimensions from "../../../../engines/GraphicEngine/IDrawDimensions";
import IDrawPositions from "../../../../engines/GraphicEngine/IDrawPositions";

/**
 * Represents a strategy that provides behaviours for the z-calculator
 */
export default interface IZCalcStrategy {
    /**
     * Converts a speed on the z axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the z speed
     * @param fps the game's current Frames Per Second
     * @returns a more consistent value to be used as the actual speed
     */
    speed(speed:number, fps:number):number;
    
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