class GraphicEn{
    constructor()
    {
        //used when making sure models are displayed in the right order based on their z-index
        this.zSortedIndexes = [];
        for(let i = 0; i < kernel.loadedModels.length; i++)
        {
            this.zSortedIndexes.push(i);
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
        
        this.lightLuminosity = 0;
        this.lightMask;
        this.lightChanged = false;
    }
    
    run()
    {
        //this will be used to make sure the models are displayed in order
        this.zSortedIndexes.sort((a, b) => {
            return kernel.loadedModels[b].z - kernel.loadedModels[a].z;
        });
        
        //clear everything on the gameCan
        this.gameCtx.clearRect(0, 0, this.gameCan.width, this.gameCan.height);
        
        kernel.level.drawBack();
        
        for(let i = 0; i < kernel.loadedModels.length; i++)
        {
            if(kernel.loadedModels[this.zSortedIndexes[i]].active && kernel.loadedModels[this.zSortedIndexes[i]].display)
            {
                kernel.loadedModels[this.zSortedIndexes[i]].draw();
            }
        }
        
        kernel.level.drawFront();
        
        if(kernel.level.HUD.update)
        {
            this.infoCtx.clearRect(0, 0, this.infoCan.width, this.infoCan.height);
            kernel.level.HUD.draw();
        }
        
        if(this.lightChanged)
        {
            this.lightCtx.clearRect(0, 0, this.lightCan.width, this.lightCan.height);
            
            this.lightCtx.globalAlpha = this.lightLuminosity;
            
            this.lightCtx.drawImage(
                kernel.loadedAssets[this.lightMask][1],
                0,
                0,
                this.lightCan.width,
                this.lightCan.height
            );
            
            this.lightChanged = false;
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
            this.drawBackgroundFull(input); //in the unlikely event this has already loadec
            kernel.loadedAssets[input][1].onload = () => {
                kernel.defaultAssetCallback();
                this.drawBackgroundFull(input);
            };
        }
    }
    
    drawBackgroundFull(ref)
    {
        this.backCtx.drawImage(
            kernel.loadedAssets[ref][1],
            0,
            0,
            this.backCan.width,
            this.backCan.height
        );
    }
    
    setLightLuminosity(lum) //takes a number between 0 (darkest) and 1 (lightest)
    {
        this.lightLuminosity = 1 - lum;
        this.lightChanged = true;
    }
    
    setLightMask(ref)
    {
        this.lightMask = ref;
        this.lightChanged = true;
    }
    
    fpsMeter()
    {
        this.infoCtx.clearRect(0, 0, this.infoCan.width, this.infoCan.height);
        kernel.level.HUD.draw();
        
        let fontSize = 30
        this.infoCtx.font = fontSize + "px Arial";
        this.infoCtx.fillStyle = "blue";
        this.infoCtx.fillText("FPS: " + kernel.fps, xUnit(10), yUnit(10) + fontSize);
    }
}