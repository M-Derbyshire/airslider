class Kernel {
    constructor()
    {
        this.fps = 24;
        this.loadedModels = []; //will hold all models loaded during loading
        let filePath = window.location.pathname;
        this.rootPath = filePath.substring(0, filePath.lastIndexOf('/'));
        this.lastTime = new Date();
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
        if((dt.getTime() - this.lastTime.getTime()) < (1000 / this.fps))
        {
            return;
        }
        this.lastTime = new Date();
        
        this.gameEn.run();
        this.graphicEn.run();
        this.soundEn.run();
    }
    
    setCanvasSize(canvases = document.getElementsByTagName("canvas"))
    {
        let width;
        let height;
        let dpi = window.devicePixelRatio || 1;
        
        //should be essentially 17:9
        //if 17:9 is stretches out of window, correct it
        // 17 / 9 = 1.88888 (and a bit more)
        let widthRatio = 1.88888;
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
    
    loadImage(path)
    {
        let assetIsHeld = this.checkAssetHeld(path);
        if(assetIsHeld)
        {
            return assetIsHeld;
        }
        
        //wil not run if above finds something
        kernel.assetsStillLoading++;
        this.loadedAssets.push([
            path,
            new Image()
        ]); 
        
        kernel.loadedAssets[kernel.loadedAssets.length - 1][1].onload = () => {
            kernel.assetsStillLoading--;
        };
        
        kernel.loadedAssets[kernel.loadedAssets.length - 1][1].src = path;
        
        return kernel.loadedAssets.length - 1;
    }
    
    loadAudio(path)
    {
        let assetIsHeld = this.checkAssetHeld(path);
        if(assetIsHeld)
        {
            return assetIsHeld;
        }
        
        //wil not run if above finds something
        kernel.assetsStillLoading++;
        this.loadedAssets.push([
            path,
            new Audio()
        ]); 
        
        kernel.loadedAssets[kernel.loadedAssets.length - 1][1].addEventListener("loadeddata", () => {
            kernel.assetsStillLoading--;
        });
        kernel.loadedAssets[kernel.loadedAssets.length - 1][1].src = path;
        
        return kernel.loadedAssets.length - 1;
    }
    
    checkAssetHeld(path)
    {
        for(let i = 0; i < kernel.loadedAssets.length; i++)
        {
            if(kernel.loadedAssets[i][0] == path)
            {
                return i;
            }
        }
        return false;
    }
}