class AssetHandler
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
    
    
    
    //Loads the asset, or finds it if already loaded, then returns the index number.
    //Takes the object to store (a new Image or Audio), the source path of the asset,
    //and a callback to run when the asset has loaded.
    loadAsset(obj, path, callback)
    {
		const boundCallback = callback.bind(this);
        path = this.prepareAssetPath(path);
        const assetIsHeld = this.checkAssetHeld(path); //Returns either the index number, or false
        
		if(assetIsHeld)
        {
            return assetIsHeld;
        }
        
        this._assetsStillLoading++;
        this.loadedAssets.push({
            path,
            asset: obj
        }); 
        
        if(obj instanceof Image)
        {
            this.loadedAssets[this.loadedAssets.length - 1].asset.onload = boundCallback;
        }
        else if(obj instanceof Audio)
        {
            this.loadedAssets[this.loadedAssets.length - 1].asset.addEventListener("canplaythrough", boundCallback);
        }
        
        this.loadedAssets[this.loadedAssets.length - 1].asset.src = path;
        
        return this.loadedAssets.length - 1;
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