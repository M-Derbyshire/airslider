import ICamera from "../../../engines/GraphicEn/ICamera";
import IPointerEventManager from "../../levels/Level/IPointerEventManager";
import IModel from "../../models/Model/IModel";

/**
 * A level's Heads Up Display
 */
export default interface IHUD {
    /**
     * Loads the HUD
     * @param camera the level's camera
     * @param pointerEventManager the level's PointerEventManager
     */
    load(camera:ICamera, pointerEventManager:IPointerEventManager):void;
    
    /**
     * Loads the HUD's components 
     */
    loadComponents():void
    
    /**
     * Unloads any assets that need to be unloaded by the HUD (triggers the same on any HUD components)
     */
    unload():void;
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     */
    prepare():void;
    
    /**
     * Draws the HUD (triggers the same on any HUD components)
     */
    draw():void;
};