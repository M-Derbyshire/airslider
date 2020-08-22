// This class provides a Singleton instance
// So, other than the first time, you should use Kernel.getInstance()
class Kernel {
    
    static instance = null; //The single instance of Kernel
    static getInstance()
    {
        //The Kernel constructor will return the single instance
        //if it has already been created, and if not then it will create
        //it. We want the same behaviour for this method. The only
        //actual reason for this method is language -- it's better
        //that people know you're "getting" the "instance", then thinking
        //you are truly making something "new".
        return new Kernel();
    }
    
    constructor()
    {
        if(Kernel.instance !== null)
        {
            return Kernel.instance;
        }
        Kernel.instance = this;
        
        
        this._isOnMobile = false; //is this a mobile app (such as through Cordova)?
        
        this._fps = 24;
        this._fpsLimit = 120;
        this._lastTime = new Date(); //used when calculating fps and enforcing fps limit
        
        this.unitsWithinCamera = 1000; //how many drawSpace x/y units are there within the camera's size
        
        this._totalActiveMilliseconds = 0; //total ms that the game has not been paused or stopped for any reason
        this._totalInactiveMilliseconds = 0;
        this._active = true;
        
        let filePath = window.location.pathname;
        this._rootPath = filePath.substring(0, filePath.lastIndexOf('/'));
        
        this.loadedModels = []; //will hold all models loaded during loading
        this._assetsStillLoading = 0; //increased when asset starts loading, decrease when done
        this.loadedAssets = [];
        
        this._level;
        this._gameEn;
        this._graphicEn;
        this._soundEn;
        this._menuEn;
        
        this._helpers;
    }
    
    //getters and setters ----------------------------------------------------------------------
    get isOnMobile(){return this._isOnMobile;}
    
    get fps(){return this._fps;}
    
    get fpsLimit(){return this._fpsLimit;}
    
    get totalActiveMilliseconds(){return this._totalActiveMilliseconds;}
    get totalInactiveMilliseconds(){return this._totalInactiveMilliseconds;}
    
    get active(){return this._active;}
    set active(newVal){this._active = newVal;}
    
    get rootPath(){return this._rootPath;}
    
    get assetsStillLoading(){return this._assetsStillLoading;}
    set assetsStillLoading(newVal){this._assetsStillLoading = newVal;}
    
    get helpers() {return this._helpers;}
    
    get level(){return this._level;}
    set level(newVal){this._level = newVal;}
    
    get gameEn(){return this._gameEn;}
    
    get graphicEn(){return this._graphicEn;}
    
    get soundEn(){return this._soundEn;}
    
    get menuEn(){return this._menuEn;}
    
    
    // loading methods --------------------------------------------------------------------------
    load()
    {
        this._helpers = {
            zCalc: new ZCalc(this.unitsWithinCamera),
            time: new TimeHelper(),
            unit: new UnitHelper(this.unitsWithinCamera)
        };
    }
    
    loadLevel(Level)
    {
        this.level = Level;
        
        //get models here so they can be picked up by the engines
        this.loadedModels = this.level.getModels();
        
        this._gameEn = new GameEn();
        this._graphicEn = new GraphicEn();
        this._soundEn = new SoundEn();
        this._menuEn = new MenuEn();
        
        //do any extra setup that may need access to the engines
        this.level.load(this._graphicEn.gameCtx, this._graphicEn.camera);
        this.level.HUD.load(this._graphicEn.gameCtx, this._graphicEn.camera);
        for(let i = 0; i < this.loadedModels.length; i++)
        {
            this.loadedModels[i].loadedIndex = i;
            this.loadedModels[i].load();
            this.loadedModels[i].loadAnimationsManager(this._graphicEn.camera);
        }
    }
    
    loadImage(path, callback = this.defaultAssetCallback)
    {
        return this.loadAsset(new Image, path, callback);
    }
    
    loadAudio(path, callback = this.defaultAssetCallback)
    {
        return this.loadAsset(new Audio, path, callback);
    }
    
    //Loads the asset, or finds it if already loaded, then returns the index number
    loadAsset(obj, path, callback)
    {
        path = this.prepareAssetPath(path);
        let assetIsHeld = this.checkAssetHeld(path); //Returns either the index number, or false
        if(assetIsHeld)
        {
            return assetIsHeld;
        }
        
        this.assetsStillLoading++;
        this.loadedAssets.push({
            path,
            asset: obj
        }); 
        
        if(obj instanceof Image)
        {
            this.loadedAssets[this.loadedAssets.length - 1].asset.onload = callback;
        }
        else if(obj instanceof Audio)
        {
            this.loadedAssets[this.loadedAssets.length - 1].asset.addEventListener("canplaythrough", callback);
        }
        
        this.loadedAssets[this.loadedAssets.length - 1].asset.src = path;
        
        return this.loadedAssets.length - 1;
    }
    
    prepareAssetPath(path)
    {
        return this.rootPath + path;
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
    
    defaultAssetCallback()
    {
        Kernel.getInstance().assetsStillLoading--;
    }
    
    
    
    //running the game ---------------------------------------------------------------
    run()
    {
        requestAnimationFrame(this.run.bind(this));
        
        //don't run unless it's time for next frame
        let dt = new Date();
        if((dt.getTime() - this._lastTime.getTime()) < (1000 / this._fpsLimit) || this._assetsStillLoading > 0)
        {
            return;
        }
        
        this._fps = 1000 / (dt.getTime() - this._lastTime.getTime());
        
        this.updateTotalTime(dt);
        this._lastTime = dt;
        
        if(this.active)
        {
            this._gameEn.run();
            this._graphicEn.run();
            this._soundEn.run();
        }
    }
    
    toggleGamePause()
    {
        if(this._active)
        {
            this._soundEn.pauseMusic();
        } else {
            this._soundEn.playMusic();
        }
        
        this._active = !this._active;
    }
    
    updateTotalTime(currentDateTime)
    {
        let timePassed = Math.floor(currentDateTime.getMilliseconds()) - Math.floor(this._lastTime.getMilliseconds());
        
        if(timePassed >= 1)
        {
            if(this._active)
            {
                this._totalActiveMilliseconds += timePassed;
            }
            else
            {
                this._totalInactiveMilliseconds += timePassed;
            }
        }
    }
}