import ILoadedAsset from "./ILoadedAsset";

/**
 * Loads and handles assets
 */
export default interface IAssetHandler {
    
    /**
     * The loaded image/audio assets
     */
    loadedAssets:ILoadedAsset[];
    
    /**
     * Asset paths for loaded/loading fonts
     */
    loadedFontPaths:string[];
    
    /**
     * How many assets are still loading?
     */
    assetsStillLoading:number;
    
    /**
     * Starts the loading of an asset into the asset handler, and returns a reference to it. If the asset has already been 
     * loaded, the reference to it will be returned, and the handler's internal usage count for that asset will be incremented
     * @param obj an object of the correct asset type (will be used as the asset object)
     * @param path the path to the asset file
     * @returns the asset object
     */
    loadAsset(obj:HTMLImageElement|HTMLAudioElement, path:string):HTMLImageElement|HTMLAudioElement;
    
    /**
     * Starts the loading of a font file into the HTML document
     * @param name the name of the font
     * @param path the path to the font file
     */
    loadFont(name:string, path:string):void;
    
    /**
     * Reduces the usage count against the loaded asset with the given file path.
     * The asset should stay loaded if there are still entities using it, but if the usage count goes down to 0, it will be removed
     * @param path the path to the asset file
     */
    releaseAsset(path:string):void;
    
    /**
     * Resets the usage counts of all assets to 0 (to be used after all the assets that need 
     * unloading have been unloaded, to ensure the remaining assets have the right usage count 
     * once the next level has loaded -- meaning they can be unloaded correctly at a later 
     * time)
     */
    resetAllUsageCounts():void
};