import {: baseClass :} from "../{: baseClass :}/{: baseClass :}";
import IPointerEventManager from "../../../Kernel/entities/Level/IPointerEventManager";
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';
import ISoundEngine from '../../../Kernel/engines/SoundEngine/ISoundEngine';
import IGraphicEngine from '../../../Kernel/engines/GraphicEngine/IGraphicEngine';

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
     * @param soundEngine the sound engine for the level
     */
    prepare(soundEngine:ISoundEngine):void
    {
        super.prepare(soundEngine);
        
        // Set anything that will need setting/resetting when a level starts/restarts
    }
    
    /**
     * Draws the HUD (triggers the same on any HUD components)
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    draw(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void
    {
        super.draw(graphicEngine, canvasContext);
        
        // Do any extra drawing operations here
    }
};