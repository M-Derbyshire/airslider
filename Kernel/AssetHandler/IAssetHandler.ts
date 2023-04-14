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
     * How many assets are still loading?
     */
    assetsStillLoading:number;
    
    /**
     * Returns the asset handler's default callback (that will be called when an asset has finished loading)
     */
    getDefaultAssetCallback():()=>void;
    
    /**
     * Starts the loading of an asset into the asset handler, and returns a reference to it. If the asset has already been 
     * loaded, the reference to it will be returned, and the handler's internal usage count for that asset will be incremented
     * @param obj an object of the correct asset type (will be used as the asset object)
     * @param path the path to the asset file
     * @param callback a function to be called, once the asset has finished loading (see the getDefaultAssetCallback method)
     * @returns the asset object
     */
    loadAsset(obj:HTMLImageElement|HTMLAudioElement, path:string, callback:()=>void):HTMLImageElement|HTMLAudioElement;
    
    /**
     * Reduces the usage count against the loaded asset with the given file path.
     * The asset should stay loaded if there are still entities using it, but if the usage count goes down to 0, it will be removed
     * @param path the path to the asset file
     */
    releaseAsset(path:string):void;
    
    /**
     * Starts the loading of a font file into the HTML document
     * @param name the name of the font
     * @param path the path to the font file
     * @param callback a function to be called, once the font has finished loading (see the getDefaultAssetCallback method)
     */
    loadFont(name:string, path:string, callback:()=>void):void;
    
};