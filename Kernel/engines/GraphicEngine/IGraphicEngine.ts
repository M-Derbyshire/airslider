import ICamera from "./ICamera";
import IDrawDimensions from "./IDrawDimensions";
import IDrawPositions from "./IDrawPositions";
import ITextContent from "./ITextContent";

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
     * Draws text onto the canvas
     * @param text the text content, and the details required to draw it
     * @param entityUnitValues the x/y/z values (in units) of the entity that owns the text
     * @param scaleType determines which method is used to scale the position/size of the text
     * @param showNegative if scaling the text, should it still be drawn when the z-index is negative?
     */
    drawText(
        textContent:ITextContent, 
        entityUnitValues:IDrawPositions & { z:number }, 
        scaleType:"static"|"scaled", 
        showNegative?:boolean
    ):void;
    
     /**
     * Calculates the draw positons/dimensions in pixels for a static entity (such as a HUD Component).
     * If any values aren't provided, 0 will be returned as the result.
     * @param unitValues The position/dimension values (in units)
     * @returns The pixel values for the x/y/width/height
     */
     getStaticDrawPositionsAndDimensions(unitValues:Partial<IDrawPositions&IDrawDimensions>):IDrawPositions&IDrawDimensions;
    
    /**
     * Calculates the draw positons/dimensions in pixels for an entity that isn't z-scaled.
     * If any values aren't provided, 0 will be returned as the result.
     * @param unitValues The position/dimension values (in units)
     * @returns The pixel values for the x/y/width/height
     */
    getUnscaledDrawPositionsAndDimensions(unitValues:Partial<IDrawPositions&IDrawDimensions>):IDrawPositions&IDrawDimensions;
    
    /**
     * Calculates the draw positons/dimensions in pixels for an entity that is scaled on the z-axis.
     * If any values aren't provided, 0 will be returned as the result.
     * @param unitValues The position/dimension values (in units), plus the z position
     * @param showNegative Should the element still be drawn if the z position is negative?
     * @returns The pixel values for the scaled x/y/width/height
     */
    getScaledDrawPositionsAndDimensions(
        unitValues:Partial<IDrawPositions&IDrawDimensions>&{ z:number }, 
        showNegative?:boolean
    ):IDrawPositions&IDrawDimensions;
};