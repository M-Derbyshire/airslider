import IKernel from "../IKernel";
import Kernel from "../Kernel";
import IAssetHandler from "./IAssetHandler";
import ILoadedAssetData from "./ILoadedAssetData";

/**
 * Loads and manages assets
 */
export default class AssetHandler implements IAssetHandler
{
    private _kernel:IKernel;
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
        this._kernel = Kernel.getInstance();
        
        this._assetsStillLoading = 0;
        
        this._loadedAssets = new Map<string, ILoadedAssetData>();
        this._loadedFontPaths = [];
    }
    
    /**
     * Starts the loading of an asset into the asset handler, and returns a reference to it. If the asset has already been 
     * loaded, the reference to it will be returned, and the handler's internal usage count for that asset will be incremented
     * @param obj an object of the correct asset type (will be used as the asset object)
     * @param path the path to the asset file
     * @returns the asset object
     */
    loadAsset(obj:HTMLImageElement|HTMLAudioElement, path:string):HTMLImageElement|HTMLAudioElement
    {
        const preparedPath = this._prepareAssetPath(path);
        const currentlyHeldAsset = this._loadedAssets.get(preparedPath);
        
		if(currentlyHeldAsset)
        {
            currentlyHeldAsset.usageCount++;
            return currentlyHeldAsset.asset;
        }
        
        const newLoadedAsset:ILoadedAssetData = {
            path: preparedPath,
            asset: obj,
            usageCount: 1,
            loaded: false
        }; 
        
        newLoadedAsset.asset.onerror = (err:any) => {
            this._kernel.handleError(err);
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
        
        const font = new FontFace(name, `url(${this._prepareAssetPath(path)})`);
        
        font.load()
            .then((newFont) => {
                const fontFaceSet = document.fonts as FontFaceSet & { add:(f:FontFace)=>void };
                
                fontFaceSet.add(newFont);
                this._defaultAssetCallback();
            })
            .catch((err:any) => this._kernel.handleError(err));
        
        this._assetsStillLoading++;
        this._loadedFontPaths.push(path);
    }
    
    /**
     * Reduces the usage count against the loaded asset with the given file path.
     * The asset should stay loaded if there are still entities using it, but if the usage count goes down to 0, it will be removed
     * @param path the path to the asset file
     */
    releaseAsset(path:string):void
    {
        const preparedPath = this._prepareAssetPath(path);
        const heldAsset = this._loadedAssets.get(preparedPath);
        
        if(!heldAsset)
            return;
        
        heldAsset.usageCount--;
        
        if(heldAsset.usageCount === 0)
            this._loadedAssets.delete(preparedPath);
    }
    
    /**
     * Resets the usage counts of all assets to 0 (This can be used after all the assets that need 
     * unloading have been unloaded, to ensure that the remaining assets have the right usage count 
     * once the next level has loaded)
     */
    resetAllUsageCounts():void
    {
        this._loadedAssets.forEach(asset => asset.usageCount = 0);
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
        return this._kernel.rootPath + path;
    }
}