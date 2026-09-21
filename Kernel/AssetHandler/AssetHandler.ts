import { pathToUniqueFilename } from "./deployedFilename";
import IAssetHandler from "./IAssetHandler";
import ILoadedAssetData from "./ILoadedAssetData";

/**
 * Loads and manages assets
 */
export default class AssetHandler implements IAssetHandler
{
    private _onErrorCallback:(err:any)=>void; // Should be called whenever there is a loading error
    
    private _assetsDirPath:string; // The path of the assets directory
    private _fontsDirPath:string; // The path of the fonts directory
    private _isHostedLocally:boolean; // Is the game being hosted locally?
    
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
    
    /**
     * Constructor
     * @param onErrorCallback a callback to trigger if there is an error when loading an asset
     * @param assetsDirUrl the URL of the assets directory (if the game is not being hosted locally)
     */
    constructor(onErrorCallback:(err:any)=>void, assetsDirUrl?:string)
    {
        this._onErrorCallback = onErrorCallback;
        
        this._isHostedLocally = !assetsDirUrl;
        this._assetsDirPath = assetsDirUrl ?? this._getLocalAssetsDirPath();
        this._fontsDirPath = assetsDirUrl ?? this._getLocalFontsDirPath();
        
        this._assetsStillLoading = 0;
        
        this._loadedAssets = new Map<string, ILoadedAssetData>();
        this._loadedFontPaths = [];
    }
    
    /**
     * Loads an image with the asset handler. If the asset has already been loaded, the 
     * reference to it will be returned
     * @param path the file path to the image
     * @returns the image object
     */
    loadImage(path:string):HTMLImageElement
    {
        return this._loadAsset(new Image, path) as HTMLImageElement;
    }
    
    /**
     * Loads an audio file with the asset handler. If the asset has already been loaded, the 
     * reference to it will be returned
     * @param path the file path to the audio file
     * @returns the audio object
     */
    loadAudio(path:string):HTMLAudioElement
    {
        return this._loadAsset(new Audio, path) as HTMLAudioElement;
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
        
        const font = new FontFace(name, `url(${this._prepareAssetPath(path, this._fontsDirPath)})`);
        
        font.load()
            .then((newFont) => {
                const fontFaceSet = document.fonts as FontFaceSet & { add:(f:FontFace)=>void };
                
                fontFaceSet.add(newFont);
                this._defaultAssetCallback();
            })
            .catch((err:any) => this._onErrorCallback(err));
        
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
     * Starts the loading of an asset into the asset handler, and returns a reference to it. If the asset has already been 
     * loaded, the reference to it will be returned, and the handler's internal usage count for that asset will be incremented
     * @param obj an object of the correct asset type (this will be used as the asset object, if the asset hasn't already been loaded)
     * @param path the path to the asset file
     * @returns the asset object
     */
    private _loadAsset(obj:HTMLImageElement|HTMLAudioElement, path:string):HTMLImageElement|HTMLAudioElement
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
        
        newLoadedAsset.asset.onerror = (err:any) => this._onErrorCallback(err)
        
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
     * Constructs the path to the assets directory, when the game is being hosted locally
     * @returns The local assets directory path
     */
    private _getLocalAssetsDirPath():string
    {
        const root = this._getLocalProjectRootDirPath();
        return `${root}/src`;
    }

    /**
     * Constructs the path to the fonts directory, when the game is being hosted locally
     * @returns The local fonts directory path
     */
    private _getLocalFontsDirPath():string
    {
        const root = this._getLocalProjectRootDirPath();
        return `${root}/fonts`;
    }

    /**
     * Constructs the path to the project's root directory, when the game is being hosted locally
     * @returns The local directory path of this project
     */
    private _getLocalProjectRootDirPath():string
    {
        let root = window.location.pathname;
        if(root.endsWith("/"))
            root = root.slice(0, -1); // Remove trailing slash

        return root;
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
     * @param assetsDirPath the path to the directory that holds the game's assets
     * @returns the modified asset path
     */
    private _prepareAssetPath(path:string, assetsDirPath:string = this._assetsDirPath):string
    {
        // Remove leading slash from path
        if(path.startsWith("/"))
            path = path.substring(1);
        
        if(!this._isHostedLocally)
            path = pathToUniqueFilename(path);
        
        return `${assetsDirPath}/${path}`;
    }
}