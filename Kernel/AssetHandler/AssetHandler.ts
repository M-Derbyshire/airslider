import IAssetHandler from "./IAssetHandler";
import ILoadedAsset from "./ILoadedAsset";

/**
 * Loads and handles assets
 */
export default class AssetHandler implements IAssetHandler
{
    private _rootPath:string;
    private _assetsStillLoading:number;
    private _baseUrl:string;
    
    /**
     * The loaded image/audio assets
     */
    loadedAssets:ILoadedAsset[];
    
    /**
     * Constructor
     * @param rootPath the root directory/path, added to the beginning of all asset file paths
     */
    constructor(rootPath:string)
    {
        this._rootPath = rootPath;
        this._assetsStillLoading = 0; //increased when asset starts loading, decrease when done
        
        this._baseUrl = window.location.href.replace("/index.html", ""); // Start of development asset path
        
        this.loadedAssets = [];
    }
    
    /**
     * How many assets are still loading?
     */
    get assetsStillLoading(){return this._assetsStillLoading;}
    set assetsStillLoading(newVal){this._assetsStillLoading = newVal;}
    
    /**
     * Will be called when an asset has finished loading
     */
    private _defaultAssetCallback():void
    {
        this.assetsStillLoading--;
    }
    
    /**
     * Returns the asset handler's default callback (that will be called when an asset has finished loading)
     */
    getDefaultAssetCallback():()=>void
    {
        return this._defaultAssetCallback.bind(this);
    }
    
    
    
    /**
     * Starts the loading of an asset into the asset handler, and returns a reference to it. If the asset has already been 
     * loaded, the reference to it will be returned, and the handler's internal usage count for that asset will be incremented
     * @param obj an object of the correct asset type (will be used as the asset object)
     * @param path the path to the asset file
     * @param callback a function to be called, once the asset has finished loading (see the getDefaultAssetCallback method)
     * @returns the asset object
     */
    loadAsset(obj:HTMLImageElement|HTMLAudioElement, path:string, callback:()=>void):HTMLImageElement|HTMLAudioElement
    {
		const boundCallback = callback;
        path = this._prepareAssetPath(path);
        const heldAssetIdx = this._checkAssetHeld(path); //Returns either the index number, or -1
        
        
		if(heldAssetIdx > -1)
        {
            this.loadedAssets[heldAssetIdx].usageCount++;
            return this.loadedAssets[heldAssetIdx].asset;
        }
        
        this._assetsStillLoading++;
        const newLoadedAsset = {
            path,
            asset: obj,
            usageCount: 1 // How many entities are currently using this?
        }; 
        
		
        if(obj instanceof Image)
        {
            newLoadedAsset.asset.onload = boundCallback;
        }
        else if(obj instanceof Audio)
        {
            newLoadedAsset.asset.addEventListener("canplaythrough", boundCallback);
        }
        
        newLoadedAsset.asset.src = path;
        
        this.loadedAssets.push(newLoadedAsset);
        return newLoadedAsset.asset;
    }
    
    /**
     * Reduces the usage count against the loaded asset with the given file path.
     * The asset should stay loaded if there are still entities using it, but if the usage count goes down to 0, it will be removed
     * @param path the path to the asset file
     */
    releaseAsset(path:string):void
    {
        path = this._prepareAssetPath(path);
        const heldAssetIdx = this._checkAssetHeld(path);
        
        if(heldAssetIdx === -1)
        {
            return;
        }
        
        this.loadedAssets[heldAssetIdx].usageCount--;
        
        if(this.loadedAssets[heldAssetIdx].usageCount === 0)
        {
            this.loadedAssets.splice(heldAssetIdx, 1);
        }
    }
    
    /**
     * Makes any required modifications to the asset path, before it is used
     * @param path the original asset path
     * @returns the modified asset path
     */
    private _prepareAssetPath(path:string):string
    {
        return this._rootPath + path;
    }
    
    /**
     * Checks if an asset is currently held, and returns its index (or -1 if it isn't)
     * @param path the path to the asset file
     * @returns the index of the asset if it has been loaded, or -1 if not
     */
    private _checkAssetHeld(path:string):number
    {
        for(let i = 0; i < this.loadedAssets.length; i++)
        {
            if(this.loadedAssets[i].path === path)
            {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Starts the loading of a font file into the HTML document
     * @param name the name of the font
     * @param path the path to the font file
     * @param callback a function to be called, once the font has finished loading (see the getDefaultAssetCallback method)
     */
    loadFont(name:string, path:string, callback:()=>void):void
    {
        const boundCallback = callback;
        
        const font = new FontFace(name, `url(${this._baseUrl}/${path})`);
        font.load().then((font) => {
            (document.fonts as FontFaceSet & { add:(f:FontFace)=>void }).add(font);
            boundCallback();
        });
        
        this._assetsStillLoading++;
    }
}