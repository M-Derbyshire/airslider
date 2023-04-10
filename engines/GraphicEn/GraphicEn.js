import Kernel from '/Kernel/kernel';

/**
 * The engine that controls the drawing to the screen
 */
export default class GraphicEn{
    
    /**
     * Constructor
     * @param gameCanvas The canvas element that the game should be drawn on
     * @param gameContext The 2D canvas context
     * @param camera The game's camera
     * @param frameManager The level's frame manager
     */
    constructor(gameCanvas, gameContext, camera, frameManager)
    {
        this._kernel = Kernel.getInstance();
        this._helpers = this._kernel.helpers;
		
        this._gameCan = gameCanvas;
        this._gameCtx = gameContext;
        this._camera = camera;
        this._frameManager = frameManager;
        
        // The current width/height of the canvas element
        this._lastFrameCanvasWidth = 0;
        this._lastFrameCanvasHeight = 0;
        
        this.setCanvasCorrectWidthHeight(); //Needs to be ran first, so other objects can use these dimensions on startup
    }
    
    
    //----------------------------------------------------------
    
    /**
     * Triggers the clearing and re-drawing of the screen
     */
    run()
    {
        //Need to do this, rather than use an event listener, as the onResize listener
        //doesn't react to a change of size if the size is set in percentages (so, if
        //100% size, that value doesn't actually change, even if the window size does).
        if(this.canvasSizeHasChanged()) this.setCanvasCorrectWidthHeight();
        
        //clear everything on the gameCan
        this._gameCtx.clearRect(0, 0, this._gameCan.width, this._gameCan.height);
        
        
        //Draw the parts of the screen that are behind the models
        this._camera.drawBack();
        this._frameManager.determineFramesToDraw();
        this._frameManager.drawFramesBack();
        this._kernel.level.drawBack();
        
        
        this.drawModels();
        
        
        //Draw everything that needs to be drawn on top of the models
        this._kernel.level.drawFront();
        this._frameManager.drawFramesFront();
        this._kernel.level.HUD.draw();
        this._camera.drawFront();
        
        if(this._kernel.displayFps)
            this.fpsMeter();
    }
    
    /**
     * Trigger the drawing of all of the models, in the correct order
     */
    drawModels()
    {
		//We need to make sure the models are drawn ordered by z-index.
		//Array.sort() will affect the original array, so we create a new array first.
		const zSortedModels = [...this._kernel.loadedModels];
		zSortedModels.sort((a, b) => b.z - a.z);
        
		zSortedModels.forEach(modelToDraw => {
			
			if(this._camera.isOnCamera(
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
    
    /**
     * Draw the Frames Per Second counter
     */
    fpsMeter()
    {
        let fontSize = 30
        this._gameCtx.font = fontSize + "px Arial";
        this._gameCtx.fillStyle = this._kernel.fpsDisplayColor;
        const fpsDisplay = Math.round(this._kernel.fps * 100) / 100; // 2 decimal places
        this._gameCtx.fillText("FPS: " + fpsDisplay, 10, (10 + fontSize));
    }
    
    /**
     * Checks to see if the size of the canvas element has changed
     * @returns true if the size has changed, false if not
     */
    canvasSizeHasChanged()
    {
        //slice() is used here to remove the "px"
        const currentWidth = window.getComputedStyle(this._gameCan).width.slice(0, -2);
        const currentHeight = window.getComputedStyle(this._gameCan).height.slice(0, -2);
        
        if(currentWidth !== this._lastFrameCanvasWidth || currentHeight !== this._lastFrameCanvasHeight)
        {
            this._lastFrameCanvasWidth = currentWidth;
            this._lastFrameCanvasHeight = currentHeight
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Corrects the canvas element's styling width/height, based on the Device Pixel Ratio.
     * Will then call reset methods on any elements that need to be aware of the canvas element 
     * changing size
     */
    setCanvasCorrectWidthHeight()
    {
        if(this._kernel.correctCanvasStyleAndDevicePixelRatio)
        {
            //Need to change the styling for the canvas, based on the DPI,
            //to avoid it being stretched and blurry.
            
            //getComputedStyle is used incase the canvas size is in %. Slice takes off the "px".
            //.width and .height are not the same as .style.width and .style.height, and if they
            //are less than the style values, the image can be blurry (we also need to take into
            //account the devicePixelRatio)
            this._gameCan.width = window.getComputedStyle(this._gameCan).width.slice(0, -2) * (window.devicePixelRatio || 1);
            this._gameCan.height = window.getComputedStyle(this._gameCan).height.slice(0, -2) * (window.devicePixelRatio || 1);
        }
        
        //It should be noted that this should be ran on loading as well (it is the first setting of the below)
        this._camera.setCameraSize();
        this._helpers.zCalc.resetVanishPointPosition();
        this._helpers.unit.setDimensions(this._camera.canvasPositionWidth, this._camera.canvasPositionHeight);
    }
}