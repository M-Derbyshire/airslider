import {: baseClass :} from "../{: baseClass :}/{: baseClass :}";
import IPointerEventManager from "../../../Kernel/entities/Level/IPointerEventManager";
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';

/**
 * A class for a Heads Up Display
 */
export default class {: name :} extends {: baseClass :}
{
    /**
     * Constructor
     * @param pointerEventManager the level's PointerEventManager
     */
    constructor(pointerEventManager:IPointerEventManager)
    {
        super(pointerEventManager);
        
        // Handle construction here
    }
    
    /**
     * Loads the HUD
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
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