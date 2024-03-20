import HUD from "../HUD/HUD";
import IPointerEventManager from '../../levels/Level/IPointerEventManager';

/**
 * A base class for a Heads up display
 */
export default class {: name :} extends HUD
{
    constructor()
    {
        super();
        
        // Handle construction here
    }
    
    /**
     * Loads the HUD
     * @param pointerEventManager the level's PointerEventManager
     */
    load(pointerEventManager:IPointerEventManager):void
    {
        super.load(pointerEventManager);
        
        // Handle loading any assets here
        // You should also push any HUDComponents to the this.components array here
        
        this.assetsToUnload.push(
            // Any assets that need to be unloaded (when the level is unloaded) should be added here
        );
    }
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     */
    prepare():void
    {
        super.prepare();
        
        // Set anything that will need setting/resetting when a level starts/restarts
    }
    
    /**
     * Draws the HUD (triggers the same on any HUD components)
     */
    draw():void
    {
        super.draw();
        
        // Do any extra drawing operations here
    }
};