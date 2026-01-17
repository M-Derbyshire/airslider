import IAssetHandler from "../../AssetHandler/IAssetHandler";

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
    loadComponents(assetHandler:IAssetHandler):void
    
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
     */
    draw():void;
};