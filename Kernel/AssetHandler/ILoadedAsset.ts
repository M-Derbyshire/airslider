/**
 * An asset (such as an image or audio), and data related to it
 */
export default interface ILoadedAsset {
    
    /**
     * The asset that has been (or is being) loaded
     */
    asset:HTMLImageElement|HTMLAudioElement;
    
    /**
     * The file path of the asset
     */
    path:string;
    
    /**
     * How many entities are currently using this asset?
     */
    usageCount:number;
    
    /**
     * Has this asset finished its initial load?
     */
    loaded:boolean;
};