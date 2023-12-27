import ICamera from "./ICamera";
import IDrawDimensions from "./IDrawDimensions";
import IDrawPositions from "./IDrawPositions";

/**
 * The engine that controls the drawing to the screen
 */
export default interface IGraphicEngine {
    /**
     * The camera for the level
     */
    camera:ICamera;
    
    /**
     * Triggers the clearing and re-drawing of the screen
     */
    run():void;
    
    /**
     * Calculates the draw positons/dimensions in pixels for a static entity (such as a HUD Component)
     * @param unitValues The position/dimension values (in units)
     * @returns The pixel values for the x/y/width/height
     */
    getStaticDrawPositionsAndDimensions(unitValues:IDrawPositions&IDrawDimensions):IDrawPositions&IDrawDimensions;
};