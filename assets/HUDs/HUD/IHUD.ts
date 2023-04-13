import ICamera from "../../../engines/GraphicEn/ICamera";
import IPointerEventManager from "../../levels/Level/IPointerEventManager";
import IModel from "../../models/Model/IModel";

/**
 * A level's Heads Up Display
 */
export default interface IHUD {
    
    /**
     * Models that can be referenced by the HUD components
     */
    models:IModel[];
    
    /**
     * Loads the HUD
     * @param canvasCtx the 2D context from the HTML canvas element
     * @param camera the game's camera
     * @param pointerEventManager the level's PointerEventManager
     */
    load(canvasCtx:CanvasRenderingContext2D, camera:ICamera, pointerEventManager:IPointerEventManager):void;
    
    /**
     * Unloads any assets that need to be unloaded by the HUD (does the same for any HUD components)
     */
    unload():void;
    
    /**
     * Prepares the HUD before the level starts (does the same for any HUD components)
     */
    prepare():void;
    
    /**
     * Draws the HUD (does the same for any HUD components)
     */
    draw():void;
    
};