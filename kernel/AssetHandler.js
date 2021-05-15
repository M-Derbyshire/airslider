export default class AssetHandler
{
    constructor(rootPath)
    {
        this._rootPath = rootPath;
        this._assetsStillLoading = 0; //increased when asset starts loading, decrease when done
        this.loadedAssets = [];
    }
    
    get assetsStillLoading(){return this._assetsStillLoading;}
    set assetsStillLoading(newVal){this._assetsStillLoading = newVal;}
    
    defaultAssetCallback()
    {
		//Need to bind this when using this on an asset
        this.assetsStillLoading--;
    }
    
    getDefaultAssetCallback()
    {
        return this.defaultAssetCallback;
    }
    
    
    
    //Loads the asset, or finds it if already loaded, then returns the asset.
    //Takes the object to store (a new Image or Audio), the source path of the asset,
    //and a callback to run when the asset has loaded.
    loadAsset(obj, path, callback)
    {
		const boundCallback = callback.bind(this);
        path = this.prepareAssetPath(path);
        const assetIsHeld = this.checkAssetHeld(path); //Returns either the index number, or false
        
		if(assetIsHeld)
        {
            return this.loadedAssets[assetIsHeld].asset;
        }
        
        this._assetsStillLoading++;
        this.loadedAssets.push({
            path,
            asset: obj
        }); 
        
		const newLoadedAsset = this.loadedAssets[this.loadedAssets.length - 1];
		
        if(obj instanceof Image)
        {
            newLoadedAsset.asset.onload = boundCallback;
        }
        else if(obj instanceof Audio)
        {
            newLoadedAsset.asset.addEventListener("canplaythrough", boundCallback);
        }
        
        newLoadedAsset.asset.src = path;
        return newLoadedAsset.asset;
    }
    
    prepareAssetPath(path)
    {
        return this._rootPath + path;
    }
    
    checkAssetHeld(path)
    {
        for(let i = 0; i < this.loadedAssets.length; i++)
        {
            if(this.loadedAssets[i].path == path)
            {
                return i;
            }
        }
        return false;
    }
}