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
    
    /**
     * Calculates the draw positons/dimensions in pixels for an entity that isn't z-scaled
     * @param unitValues The position/dimension values (in units)
     * @returns The pixel values for the x/y/width/height
     */
    getUnscaledDrawPositionsAndDimensions(unitValues:IDrawPositions&IDrawDimensions):IDrawPositions&IDrawDimensions;
    
    /**
     * Calculates the draw positons/dimensions in pixels for an entity that is scaled on the z-axis
     * @param unitValues The position/dimension values (in units), plus the z position
     * @param showNegative Should the element still be drawn if the z position is negative?
     * @returns The pixel values for the scaled x/y/width/height
     */
    getScaledDrawPositionsAndDimensions(
        unitValues:IDrawPositions&IDrawDimensions&{ z:number }, 
        showNegative?:boolean
    ):IDrawPositions&IDrawDimensions;
};