/**
 * Loads and manages assets
 */
export default interface IAssetHandler {
    /**
     * The number of assets that are still loading
     */
    readonly assetsStillLoading:number;
    
    /**
     * Loads an image with the asset handler. If the asset has already been loaded, the 
     * reference to it will be returned
     * @param path the file path to the image
     * @returns the image object
     */
    loadImage(path:string):HTMLImageElement;
    
    /**
     * Loads an audio file with the asset handler. If the asset has already been loaded, the 
     * reference to it will be returned
     * @param path the file path to the audio file
     * @returns the audio object
     */
    loadAudio(path:string):HTMLAudioElement;
    
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