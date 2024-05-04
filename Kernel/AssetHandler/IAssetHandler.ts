/**
 * Loads and manages assets
 */
export default interface IAssetHandler {
    /**
     * The number of assets that are still loading
     */
    readonly assetsStillLoading:number;
    
    /**
     * Starts the loading of an asset into the asset handler, and returns a reference to it. If the asset has already been 
     * loaded, the reference to it will be returned, and the handler's internal usage count for that asset will be incremented
     * @param obj an object of the correct asset type (this will be used as the asset object, if the asset hasn't already been loaded)
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
     * Deletes the asset with the given file path
     * @param path the path to the asset file
     */
    releaseAsset(path:string):void;
};