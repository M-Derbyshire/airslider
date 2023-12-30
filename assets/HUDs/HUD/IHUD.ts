import IPointerEventManager from "../../levels/Level/IPointerEventManager";

/**
 * A level's Heads Up Display
 */
export default interface IHUD {
    /**
     * Loads the HUD
     * @param pointerEventManager the level's PointerEventManager
     */
    load(pointerEventManager:IPointerEventManager):void;
    
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