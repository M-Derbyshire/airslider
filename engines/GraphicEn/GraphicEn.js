import Kernel from '/Kernel/kernel';

export default class GraphicEn{
    constructor(gameCanvas, gameContext, camera, frameManager)
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
		
        this.gameCan = gameCanvas;
        this.gameCtx = gameContext;
        this.camera = camera;
        this.frameManager = frameManager;
        
        //These will be set on the first frame, in the run() method, by the cavas-size-change handler
        this._lastFrameCanvasWidth = 0;
        this._lastFrameCanvasHeight = 0;
        
        this.setCanvasCorrectWidthHeight(); //Needs to be ran first, so other objects can use these dimensions on startup
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
        
        if(this.kernel.displayFps)
            this.fpsMeter();
    }
    
    
    drawModels()
    {
		//We need to make sure the models are drawn ordered by z-index.
		//Array.sort() will affect the original array (which needs to stay in order,
		//as indexes may be used by other classes to reference models). Therefore, we
		//create a new array first.
		const zSortedModels = [...this.kernel.loadedModels];
		zSortedModels.sort((a, b) => b.z - a.z);
        
		zSortedModels.forEach(modelToDraw => {
			
			if(this.camera.isOnCamera(
                        modelToDraw.x, 
                        modelToDraw.y, 
                        modelToDraw.width, 
                        modelToDraw.height, 
                        modelToDraw.z) && modelToDraw.active && modelToDraw.display)
            {
                modelToDraw.draw();
            }
			
		});
    }
    
    
    fpsMeter()
    {
        let fontSize = 30
        this.gameCtx.font = fontSize + "px Arial";
        this.gameCtx.fillStyle = this.kernel.fpsDisplayColor;
        const fpsDisplay = Math.round(this.kernel.fps * 100) / 100; // 2 decimal places
        this.gameCtx.fillText("FPS: " + fpsDisplay, 10, (10 + fontSize));
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
        if(this.kernel.correctCanvasStyleAndDevicePixelRatio)
        {
            //Need to change the styling for the canvas, based on the DPI,
            //to avoid it being stretched and blurry.
            
            //getComputedStyle is used incase the canvas size is in %. Slice takes off the "px".
            //.width and .height are not the same as .style.width and .style.height, and if they
            //are less than the style values, the image can be blurry (we also need to take into
            //account the devicePixelRatio)
            this.gameCan.width = window.getComputedStyle(this.gameCan).width.slice(0, -2) * (window.devicePixelRatio || 1);
            this.gameCan.height = window.getComputedStyle(this.gameCan).height.slice(0, -2) * (window.devicePixelRatio || 1);
        }
        
        //It should be noted that this should be ran on loading as well (it is the first setting of the below)
        this.camera.setCameraSize();
        this.helpers.zCalc.resetVanishPointPosition();
        this.helpers.unit.setDimensions(this.camera.canvasPositionWidth, this.camera.canvasPositionHeight);
    }
}