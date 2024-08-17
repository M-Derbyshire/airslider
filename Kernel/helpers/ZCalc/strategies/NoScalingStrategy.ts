import IDrawDimensions from "../../../../engines/GraphicEngine/IDrawDimensions";
import IDrawPositions from "../../../../engines/GraphicEngine/IDrawPositions";
import IZCalcStrategy from "./IZCalcStrategy";

/**
 * Strategy for the ZCalc. This strategy is for levels/games that want no z-scaling at all
 */
export default class NoScalingStrategy implements IZCalcStrategy {
    speed(speed: number, fps: number): number {
        return 0;
    }
    
    getDrawValues(pixelValues: IDrawPositions & IDrawDimensions, zPosition: number, showNegative?: boolean): IDrawPositions & IDrawDimensions {
        return pixelValues;
    }
};