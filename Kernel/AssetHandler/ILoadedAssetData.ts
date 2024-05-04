/**
 * An asset (such as an image or audio), and data related to it
 */
export default interface ILoadedAssetData {
    /**
     * The asset that has been (or is being) loaded
     */
    asset:HTMLImageElement|HTMLAudioElement;
    
    /**
     * The file path of the asset
     */
    path:string;
    
    /**
     * Has this asset finished its initial load?
     */
    loaded:boolean;
};