class GraphicEn{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        //used when making sure models are displayed in the right order based on their z-index
        this._zSortedIndexes = [];
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            this._zSortedIndexes.push(i);
        }
        
        this.backCan = document.getElementById("backCan");
        this.backCtx = this.backCan.getContext("2d");
        this.gameCan = document.getElementById("gameCan");
        this.gameCtx = this.gameCan.getContext("2d");
        this.lightCan = document.getElementById("lightCan");
        this.lightCtx = this.lightCan.getContext("2d");
        this.infoCan = document.getElementById("infoCan");
        this.infoCtx = this.infoCan.getContext("2d");
        this.menuCan = document.getElementById("menuCan");
        this.menuCtx = this.menuCan.getContext("2d");
        
        this._lightLuminosity = 0;
        this._lightMask;
        this._lightChanged = false;
    }
    
    //getters and setters --------------------------------------
    get lightLuminosity() {return this._lightLuminosity;}
    set lightLuminosity(lum) //takes a number between 0 (darkest) and 1 (lightest)
    {
        this._lightLuminosity = 1 - lum;
        this._lightChanged = true;
    }
    
    get lightMask() {return this._lightMask;}
    set lightMask(ref)
    {
        this._lightMask = ref;
        this._lightChanged = true;
    }
    
    get lightChanged() {return this._lightChanged;}
    //----------------------------------------------------------
    
    run()
    {
        //this will be used to make sure the models are displayed in order
        this._zSortedIndexes.sort((a, b) => {
            return this.kernel.loadedModels[b].z - this.kernel.loadedModels[a].z;
        });
        
        //clear everything on the gameCan
        this.gameCtx.clearRect(0, 0, this.gameCan.width, this.gameCan.height);
        
        this.kernel.level.drawBack();
        
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            if(this.kernel.loadedModels[this._zSortedIndexes[i]].active && this.kernel.loadedModels[this._zSortedIndexes[i]].display)
            {
                this.kernel.loadedModels[this._zSortedIndexes[i]].draw();
            }
        }
        
        this.kernel.level.drawFront();
        
        if(this.kernel.level.HUD.update)
        {
            this.infoCtx.clearRect(0, 0, this.infoCan.width, this.infoCan.height);
            this.kernel.level.HUD.draw();
        }
        
        if(this.lightChanged)
        {
            this.lightCtx.clearRect(0, 0, this.lightCan.width, this.lightCan.height);
            
            this.lightCtx.globalAlpha = this.lightLuminosity;
            
            this.lightCtx.drawImage(
                this.kernel.loadedAssets[this.lightMask][1],
                0,
                0,
                this.lightCan.width,
                this.lightCan.height
            );
            
            this._lightChanged = false;
        }
        
        this.fpsMeter();
    }
    
    setStaticBackground(input, useColor = false)
    {
        if(useColor)
        {
            this.backCtx.fillStyle = input;
            this.backCtx.fillRect(0, 0, this.backCan.width, this.backCan.height);
        } else {
            this.drawBackgroundFull(input); //in the unlikely event this has already loaded
            this.kernel.loadedAssets[input][1].onload = () => {
                this.kernel.defaultAssetCallback();
                this.drawBackgroundFull(input);
            };
        }
    }
    
    drawBackgroundFull(ref)
    {
        this.backCtx.drawImage(
            this.kernel.loadedAssets[ref][1],
            0,
            0,
            this.backCan.width,
            this.backCan.height
        );
    }
    
    fpsMeter()
    {
        this.infoCtx.clearRect(0, 0, this.infoCan.width, this.infoCan.height);
        this.kernel.level.HUD.draw();
        
        let fontSize = 30
        this.infoCtx.font = fontSize + "px Arial";
        this.infoCtx.fillStyle = "blue";
        this.infoCtx.fillText("FPS: " + this.kernel.fps, this.kernel.helpers.xUnit(10), this.kernel.helpers.yUnit(10) + fontSize);
    }
}