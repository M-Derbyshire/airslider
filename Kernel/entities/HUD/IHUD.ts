import IAssetHandler from "../../AssetHandler/IAssetHandler";
import IGraphicEngine from "../../engines/GraphicEngine/IGraphicEngine";
import ISoundEngine from "../../engines/SoundEngine/ISoundEngine";

/**
 * A level's Heads Up Display
 */
export default interface IHUD {
    /**
     * Loads the HUD
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void;
    
    /**
     * Loads the HUD's components
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    loadComponents(assetHandler:IAssetHandler):void;
    
    /**
     * Registers the sounds used by the HUD (these should be added to the sounds array during loading). Also
     * triggers the registration of the component's sounds
     * @param soundEngine the sound engine for the level 
     */
    registerSounds(soundEngine:ISoundEngine):void;
    
    /**
     * Unloads any assets that need to be unloaded by the HUD (triggers the same on any HUD components)
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    unload(assetHandler:IAssetHandler):void;
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     */
    prepare():void;
    
    /**
     * Draws the HUD (triggers the same on any HUD components)
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    draw(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void;
};