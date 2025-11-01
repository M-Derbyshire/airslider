import { IDrawDimensions, IDrawPositions } from "../../../engines/GraphicEngine/IGraphicEngine";
import IZCalcStrategy from "./IZCalcStrategy";

/**
 * Strategy for the ZCalc. This strategy is for levels/games that want no z-scaling at all
 */
export default class NoScalingStrategy implements IZCalcStrategy {
    getDrawValues(pixelValues: IDrawPositions & IDrawDimensions, zPosition: number, showNegative?: boolean): IDrawPositions & IDrawDimensions {
        return pixelValues;
    }
};