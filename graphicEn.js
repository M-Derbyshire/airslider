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
        
        this.gameCan = document.getElementById("gameCan");
        this.gameCtx = this.gameCan.getContext("2d");
        
        this._lightLuminosity = 0;
        this._lightMask;
        
        this._background;
        this._useColorForBackground = false;
    }
    
    //getters and setters --------------------------------------
    get lightLuminosity() {return this._lightLuminosity;}
    set lightLuminosity(lum) //takes a number between 0 (darkest) and 1 (lightest)
    {
        this._lightLuminosity = 1 - lum;
    }
    
    get lightMask() {return this._lightMask;}
    set lightMask(ref)
    {
        this._lightMask = ref;
    }
    
    setStaticBackground(input, useColor = false)
    {
        this._background = input;
        this._useColorForBackground = false;
    }
    
    //----------------------------------------------------------
    
    run()
    {
        
        
        //clear everything on the gameCan
        this.gameCtx.clearRect(0, 0, this.gameCan.width, this.gameCan.height);
        
        //Draw the parts of the screen that are behind the models
        this.drawBackgroundFull();
        
        this.kernel.level.drawBack();
        
        this.drawModels();
        
        //Finally, draw everything that needs to be drawn on top of the models
        this.kernel.level.drawFront();
        
        this.drawLightMask();
        
        this.kernel.level.HUD.draw();
        
        //Leave this here if you want to see the game's current FPS.
        this.fpsMeter();
    }
    
    
    drawModels()
    {
        //This will make sure the models are displayed in order (based on their Z index)
        this._zSortedIndexes.sort((a, b) => {
            return this.kernel.loadedModels[b].z - this.kernel.loadedModels[a].z;
        });
        
        
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            if(this.kernel.loadedModels[this._zSortedIndexes[i]].active && this.kernel.loadedModels[this._zSortedIndexes[i]].display)
            {
                this.kernel.loadedModels[this._zSortedIndexes[i]].draw();
            }
        }
    }
    
    
    drawBackgroundFull()
    {
        if(this._useColorForBackground)
        {
            this.gameCtx.fillStyle = this._useColorForBackground;
            this.gameCtx.fillRect(0, 0, this.gameCan.width, this.gameCan.height);
        } else {
            this.gameCtx.drawImage(
                this.kernel.loadedAssets[this._background][1],
                0,
                0,
                this.gameCan.width,
                this.gameCan.height
            );
        }
    }
    
    drawLightMask()
    {
        this.gameCtx.globalAlpha = this.lightLuminosity;
        this.gameCtx.drawImage(
            this.kernel.loadedAssets[this.lightMask][1],
            0,
            0,
            this.gameCan.width,
            this.gameCan.height
        );
        this.gameCtx.globalAlpha = 1;
    }
    
    fpsMeter()
    {
        let fontSize = 30
        this.gameCtx.font = fontSize + "px Arial";
        this.gameCtx.fillStyle = "blue";
        this.gameCtx.fillText("FPS: " + this.kernel.fps, this.helpers.unit.xUnit(10), this.helpers.unit.yUnit(10) + fontSize);
    }
}