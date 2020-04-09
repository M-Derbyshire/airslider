// This class provides a Singleton instance
// So, other than the first time, you should use Kernel.getInstance()
class Kernel {
    
    static instance = null; //The single instance of Kernel
    static getInstance()
    {
        return this.instance;
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
        
        this._totalActiveMilliseconds = 0; //total ms that the game has not been paused or stopped for any reason
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
        
        this._controlInitialiser;
    }
    
    //getters and setters ----------------------------------------------------------------------
    get isOnMobile(){return this._isOnMobile;}
    
    get fps(){return this._fps;}
    
    get fpsLimit(){return this._fpsLimit;}
    
    get totalActiveMilliseconds(){return this._totalActiveMilliseconds;}
    
    get active(){return this._active;}
    set active(newVal){this._active = newVal;}
    
    get rootPath(){return this._rootPath;}
    
    get assetsStillLoading(){return this._assetsStillLoading;}
    set assetsStillLoading(newVal){this._assetsStillLoading = newVal;}
    
    get controlInitialiser() {return this._controlInitialiser;}
    
    get level(){return this._level;}
    set level(newVal){this._level = newVal;}
    
    get gameEn(){return this._gameEn;}
    
    get graphicEn(){return this._graphicEn;}
    
    get soundEn(){return this._soundEn;}
    
    get menuEn(){return this._menuEn;}
    
    
    // loading methods --------------------------------------------------------------------------
    load()
    {
        this.setCanvasSize();
        this._controlInitialiser = new ControlsInitialiser();
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
        this.level.loadSuper();
        this.level.load();
        this.level.HUD.loadSuper();
        this.level.HUD.load();
        for(let i = 0; i < this.loadedModels.length; i++)
        {
            this.loadedModels[i].loadedIndex = i; //used for events
            this.loadedModels[i].loadSuper();
            this.loadedModels[i].load();
        }
    }
    
    setCanvasSize(aspectHorizontal = 17, aspectVertical = 9, canvases = document.getElementsByTagName("canvas"))
    {
        let width;
        let height;
        let dpi = window.devicePixelRatio || 1;
        
        // set the width and height of the canvases based on the aspect ratio
        //if aspect ratio is stretched out of window, correct it
        let widthRatio = aspectHorizontal / aspectVertical;
        if((window.innerWidth / widthRatio) > window.innerHeight)
        {
            height = window.innerHeight;
            width = height * widthRatio;
        } else {
            height = window.innerWidth / widthRatio;
            width = window.innerWidth;
        }
        
        let x = (window.innerWidth - width) / 2;
        let y = (window.innerHeight - height) / 2;
        
        for(let i = 0; i < canvases.length; i++)
        {
            canvases[i].style.left = x + "px";
            canvases[i].style.top = y + "px";
            canvases[i].width = width * dpi;
            canvases[i].height = height * dpi;
            canvases[i].style.width = width + "px";
            canvases[i].style.height = height + "px";
        }
    }
    
    loadImage(path, callback = this.defaultAssetCallback)
    {
        path = this.prepareAssetPath(path);
        let assetIsHeld = this.checkAssetHeld(path);
        if(assetIsHeld)
        {
            return assetIsHeld;
        }
        
        //wil not run if above finds something
        this.assetsStillLoading++;
        this.loadedAssets.push([
            path,
            new Image()
        ]); 
        
        this.loadedAssets[this.loadedAssets.length - 1][1].onload = callback;
        
        this.loadedAssets[this.loadedAssets.length - 1][1].src = path;
        
        return this.loadedAssets.length - 1;
    }
    
    loadAudio(path, callback = this.defaultAssetCallback)
    {
        path = this.prepareAssetPath(path);
        let assetIsHeld = this.checkAssetHeld(path);
        if(assetIsHeld)
        {
            return assetIsHeld;
        }
        
        //wil not run if above finds something
        this.assetsStillLoading++;
        this.loadedAssets.push([
            path,
            new Audio()
        ]); 
        
        this.loadedAssets[this.loadedAssets.length - 1][1].addEventListener("canplaythrough", callback);
        this.loadedAssets[this.loadedAssets.length - 1][1].src = path;
        
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
            if(this.loadedAssets[i][0] == path)
            {
                return i;
            }
        }
        return false;
    }
    
    defaultAssetCallback()
    {
        kernel.assetsStillLoading--;
    }
    
    
    
    //running the game ---------------------------------------------------------------
    run()
    {
        requestAnimationFrame(this.run.bind(this));
        
        //don't run unless it's time for next frame
        let dt = new Date();
        if((dt.getTime() - this._lastTime.getTime()) < (1000 / this._fpsLimit) || !this._active || this._assetsStillLoading > 0)
        {
            return;
        }
        
        this.updateTotalTime();
        
        this._fps = 1000 / (dt.getTime() - this._lastTime.getTime());
        
        this._lastTime = dt;
        
        this._gameEn.run();
        this._graphicEn.run();
        this._soundEn.run();
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
    
    updateTotalTime()
    {
        let dt = new Date()
        let timePassed = Math.floor(dt.getMilliseconds()) - Math.floor(this._lastTime.getMilliseconds());
        
        //if a millisecond has passed (or more, if it's been inactive)
        if(timePassed >= 1)
        {
            this._totalActiveMilliseconds += timePassed;
        }
    }
}