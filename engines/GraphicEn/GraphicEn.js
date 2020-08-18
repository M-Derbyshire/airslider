class GraphicEn{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        //used when making sure models are displayed in the right order based on their z-index
        this._zSortedIndexes = [...this.kernel.loadedModels.keys()];
        
        this.gameCan = document.getElementById("gameCan");
        this.gameCtx = this.gameCan.getContext("2d");
        this.camera = new Camera(this.gameCan, this.gameCtx);
        this.frameManager = new FrameManager(this.camera);
        
        //These will be set on the first frame, in the run() method, by the cavas-size-change handler
        this._lastFrameCanvasWidth = 0;
        this._lastFrameCanvasHeight = 0;
        
        this.setCanvasCorrectWidthHeight(); //Needs to be ran first, so other objects can use these dimensions on startup
        this.helpers.unit.setDimensions(this.camera.positions.canvas.width, this.camera.positions.canvas.height);
    }
    
    
    //----------------------------------------------------------
    
    run()
    {
        //Need to do this, rather than use an event listener, as the onResize listener
        //doesn't react to a change of size if the size is set in percentages (so, if
        //100% size, that value doesn't actually change, even if the window size does).
        if(this.canvasSizeHasChanged()) this.setCanvasCorrectWidthHeight();
        
        //clear everything on the gameCan
        this.gameCtx.clearRect(0, 0, this.gameCan.width, this.gameCan.height);
        
        
        //Draw the parts of the screen that are behind the models
        this.camera.drawBack();
        this.frameManager.determineFramesToDraw();
        this.frameManager.drawFramesBack();
        this.kernel.level.drawBack();
        
        
        this.drawModels();
        
        
        //Draw everything that needs to be drawn on top of the models
        this.kernel.level.drawFront();
        this.frameManager.drawFramesFront();
        this.kernel.level.HUD.draw();
        this.camera.drawFront();
        
        //Leave this here if you want to see the game's current FPS.
        this.fpsMeter();
    }
    
    
    drawModels()
    {
        //This will make sure the models are displayed in order (based on their Z index)
        this._zSortedIndexes.sort((a, b) => {
            return this.kernel.loadedModels[b].z - this.kernel.loadedModels[a].z;
        });
        
        let modelToDraw
        
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            modelToDraw = this.kernel.loadedModels[this._zSortedIndexes[i]];
            
            if(this.camera.isOnCamera(
                        modelToDraw.x, 
                        modelToDraw.y, 
                        modelToDraw.width, 
                        modelToDraw.height, 
                        modelToDraw.z) && modelToDraw.active && modelToDraw.display)
            {
                modelToDraw.draw();
            }
        }
    }
    
    
    fpsMeter(color = "blue")
    {
        let fontSize = 30
        this.gameCtx.font = fontSize + "px Arial";
        this.gameCtx.fillStyle = color;
        this.gameCtx.fillText("FPS: " + this.kernel.fps, 10, (10 + fontSize));
    }
    
    
    canvasSizeHasChanged()
    {
        //slice() is used here to remove the "px"
        const currentWidth = window.getComputedStyle(this.gameCan).width.slice(0, -2);
        const currentHeight = window.getComputedStyle(this.gameCan).height.slice(0, -2);
        
        if(currentWidth !== this._lastFrameCanvasWidth || currentHeight !== this._lastFrameCanvasHeight)
        {
            this._lastFrameCanvasWidth = currentWidth;
            this._lastFrameCanvasHeight = currentHeight
            
            return true;
        }
        
        return false;
    }
    
    
    setCanvasCorrectWidthHeight()
    {
        //Need to change the styling for the canvas, based on the DPI,
        //to avoid it being stretched and blurry.
        
        //getComputedStyle is used incase the canvas size is in %. Slice takes off the "px".
        //.width and .height are not the same as .style.width and .style.height, and if they
        //are less than the style values, the image can be blurry (we also need to take into
        //account the devicePixelRatio)
        this.gameCan.width = window.getComputedStyle(this.gameCan).width.slice(0, -2) * (window.devicePixelRatio || 1);
        this.gameCan.height = window.getComputedStyle(this.gameCan).height.slice(0, -2) * (window.devicePixelRatio || 1);
        
        this.camera.setCameraSize();
    }
}