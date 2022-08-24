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
        const heldAssetIdx = this.checkAssetHeld(path); //Returns either the index number, or -1
        
        
		if(heldAssetIdx > -1)
        {
            this.loadedAssets[heldAssetIdx].usageCount++;
            return this.loadedAssets[heldAssetIdx].asset;
        }
        
        this._assetsStillLoading++;
        const newLoadedAsset = {
            path,
            asset: obj,
            usageCount: 1 //How many entities are currently using this?
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
    
    // Finds the loaded asset with the given file path, and reduces the usage count against it.
    // The asset should stay loaded if there are still entities using it, but if the usage count goes down to 0, this will remove it
    releaseAsset(path)
    {
        path = this.prepareAssetPath(path);
        const heldAssetIdx = this.checkAssetHeld(path);
        
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
    
    prepareAssetPath(path)
    {
        return this._rootPath + path;
    }
    
    //Returns the index of the asset if it has been loaded, or -1 if not
    checkAssetHeld(path)
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
}