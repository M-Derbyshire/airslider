class Kernel {
    constructor()
    {
        this.isOnMobile = false; //is this a mobile app (such as through Cordova)?
        
        this.fps = 24;
        this.fpsLimit = 120;
        this.lastTime = new Date(); //used when calculating fps and enforcing fps limit
        
        this.totalActiveMilliseconds = 0; //total ms that the game has not been paused or stopped for any reason
        this.active = true;
        
        let filePath = window.location.pathname;
        this.rootPath = filePath.substring(0, filePath.lastIndexOf('/'));
        
        this.loadedModels = []; //will hold all models loaded during loading
        this.assetsStillLoading = 0; //increased when asset starts loading, decrease when done
        this.loadedAssets = [];
    }
    
    load()
    {
        this.setCanvasSize();
    }
    
    loadLevel(Level)
    {
        this.level = Level;
        
        //get models here so they can be picked up by the engines
        this.loadedModels = this.level.getModels();
        
        this.gameEn = new GameEn();
        this.graphicEn = new GraphicEn();
        this.soundEn = new SoundEn();
        this.menuEn = new MenuEn();
        
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
    
    run()
    {
        requestAnimationFrame(this.run.bind(this));
        
        //don't run unless it's time for next frame
        let dt = new Date();
        if((dt.getTime() - this.lastTime.getTime()) < (1000 / this.fpsLimit) || !this.active || this.assetsStillLoading > 0)
        {
            return;
        }
        
        this.updateTotalTime();
        
        this.fps = 1000 / (dt.getTime() - this.lastTime.getTime());
        
        this.lastTime = dt;
        
        this.gameEn.run();
        this.graphicEn.run();
        this.soundEn.run();
    }
    
    toggleGamePause()
    {
        if(this.active)
        {
            this.soundEn.pauseMusic();
        } else {
            this.soundEn.playMusic();
        }
        
        this.active = !this.active;
    }
    
    updateTotalTime()
    {
        let dt = new Date()
        let timePassed = Math.floor(dt.getMilliseconds()) - Math.floor(this.lastTime.getMilliseconds());
        
        //if a millisecond has passed (or more, if it's been inactive)
        if(timePassed >= 1)
        {
            this.totalActiveMilliseconds += timePassed;
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
}