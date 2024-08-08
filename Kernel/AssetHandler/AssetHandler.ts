import Kernel from "../Kernel";
import IAssetHandler from "./IAssetHandler";
import ILoadedAssetData from "./ILoadedAssetData";

/**
 * Loads and manages assets
 */
export default class AssetHandler implements IAssetHandler
{
    private _assetsStillLoading:number; // The number of assets that are still loading
    private _loadedAssets:Map<string, ILoadedAssetData>; // The loaded image/audio assets
    private _loadedFontPaths:string[]; // Asset paths for loaded (or currently loading) fonts
    
    /**
     * How many assets are still loading?
     */
    get assetsStillLoading()
    {
        return this._assetsStillLoading;
    }
    
    constructor()
    {
        this._assetsStillLoading = 0;
        
        this._loadedAssets = new Map<string, ILoadedAssetData>();
        this._loadedFontPaths = [];
    }
    
    /**
     * Starts the loading of an asset into the asset handler, and returns a reference to it. If the asset has already been 
     * loaded, the reference to it will be returned, and the handler's internal usage count for that asset will be incremented
     * @param obj an object of the correct asset type (this will be used as the asset object, if the asset hasn't already been loaded)
     * @param path the path to the asset file
     * @returns the asset object
     */
    loadAsset(obj:HTMLImageElement|HTMLAudioElement, path:string):HTMLImageElement|HTMLAudioElement
    {
        const preparedPath = this._prepareAssetPath(path);
        const currentlyHeldAsset = this._loadedAssets.get(preparedPath);
        
		if(currentlyHeldAsset)
            return currentlyHeldAsset.asset;
        
        const newLoadedAsset:ILoadedAssetData = {
            path: preparedPath,
            asset: obj,
            loaded: false
        }; 
        
        const kernel = Kernel.getInstance();
        newLoadedAsset.asset.onerror = (err:any) => {
            kernel.handleError(err);
        };
        
        const afterLoadCallback = () => {
            if(!newLoadedAsset.loaded)
            {
                newLoadedAsset.loaded = true;
                this._defaultAssetCallback();
            }
        };
		
        if(obj instanceof Image)
            newLoadedAsset.asset.onload = afterLoadCallback;
        else if(obj instanceof Audio)
            newLoadedAsset.asset.addEventListener("canplaythrough", afterLoadCallback);
        
        this._assetsStillLoading++;
        newLoadedAsset.asset.src = preparedPath;
        
        this._loadedAssets.set(preparedPath, newLoadedAsset);
        return newLoadedAsset.asset;
    }
    
    /**
     * Starts the loading of a font file into the HTML document
     * @param name the name of the font
     * @param path the path to the font file
     */
    loadFont(name:string, path:string):void
    {
        if(this._loadedFontPaths.includes(path)) 
            return;
        
        const kernel = Kernel.getInstance();
        
        const font = new FontFace(name, `url(${this._prepareAssetPath(path)})`);
        
        font.load()
            .then((newFont) => {
                const fontFaceSet = document.fonts as FontFaceSet & { add:(f:FontFace)=>void };
                
                fontFaceSet.add(newFont);
                this._defaultAssetCallback();
            })
            .catch((err:any) => kernel.handleError(err));
        
        this._assetsStillLoading++;
        this._loadedFontPaths.push(path);
    }
    
    /**
     * Deletes the asset with the given file path
     * @param path the path to the asset file
     */
    releaseAsset(path:string):void
    {
        const preparedPath = this._prepareAssetPath(path);
        this._loadedAssets.delete(preparedPath);
    }
    
    /**
     * This will be called when an asset has finished loading
     */
    private _defaultAssetCallback():void
    {
        this._assetsStillLoading--;
    }
    
    /**
     * Makes any required modifications to the asset path before it is used
     * @param path the original asset path
     * @returns the modified asset path
     */
    private _prepareAssetPath(path:string):string
    {
        const relativePath = path.startsWith("/") ? path : `/${path}`;
        return Kernel.getInstance().rootPath + relativePath;
    }
}