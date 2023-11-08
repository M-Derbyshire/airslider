import Kernel from '../../Kernel/Kernel';
import IKernel from '../../Kernel/IKernel';
import IGraphicEn from './IGraphicEn';
import ICamera from './ICamera';
import IFrameManager from './IFrameManager';
import IHelpers from '../../Kernel/helpers/IHelpers';

/**
 * The engine that controls the drawing to the screen
 */
export default class GraphicEn implements IGraphicEn {
    
    private _kernel:IKernel;
    private _helpers:IHelpers;
    
    private _gameCan:HTMLCanvasElement;
    private _gameCtx:CanvasRenderingContext2D;
    private _frameManager:IFrameManager;
    
    private _lastFrameCanvasWidth:number;
    private _lastFrameCanvasHeight:number;
    
    /**
     * The camera for the level
     */
    camera:ICamera;
    
    /**
     * Constructor
     * @param camera The game's camera
     * @param frameManager The level's frame manager
     */
    constructor(camera:ICamera, frameManager:IFrameManager)
    {
        this._kernel = Kernel.getInstance();
        this._helpers = this._kernel.helpers;
		
        this._gameCan = this._kernel.gameCanvas;
        this._gameCtx = this._kernel.gameContext;
        this.camera = camera;
        this._frameManager = frameManager;
        
        // The current width/height of the canvas element
        this._lastFrameCanvasWidth = 0;
        this._lastFrameCanvasHeight = 0;
        
        this._setCanvasCorrectWidthHeight(); //Needs to be ran first, so other objects can use these dimensions on startup
    }
    
    
    //----------------------------------------------------------
    
    /**
     * Triggers the clearing and re-drawing of the screen
     */
    run():void
    {
        //Need to do this, rather than use an event listener, as the onResize listener
        //doesn't react to a change of size if the size is set in percentages (so, if
        //100% size, that value doesn't actually change, even if the window size does).
        if(this._canvasSizeHasChanged()) this._setCanvasCorrectWidthHeight();
        
        //clear everything on the gameCan
        this._gameCtx.clearRect(0, 0, this._gameCan.width, this._gameCan.height);
        
        
        //Draw the parts of the screen that are behind the models
        this.camera.drawBack();
        this._frameManager.determineFramesToDraw();
        this._frameManager.drawFramesBack();
        this._kernel.level.drawBack();
        
        
        this._drawModels();
        
        
        //Draw everything that needs to be drawn on top of the models
        this._kernel.level.drawFront();
        this._frameManager.drawFramesFront();
        this._kernel.level.HUD.draw();
        this.camera.drawFront();
        
        if(this._kernel.displayFps)
            this._fpsMeter();
    }
    
    /**
     * Trigger the drawing of all of the models, in the correct order
     */
    private _drawModels():void
    {
		//We need to make sure the models are drawn ordered by z-index.
		//Array.sort() will affect the original array, so we create a new array first.
		const zSortedModels = [...this._kernel.loadedModels];
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
    
    /**
     * Draw the Frames Per Second counter
     */
    private _fpsMeter():void
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
    private _canvasSizeHasChanged():boolean
    {
        //slice() is used here to remove the "px"
        const currentWidth = Number(window.getComputedStyle(this._gameCan).width.slice(0, -2));
        const currentHeight = Number(window.getComputedStyle(this._gameCan).height.slice(0, -2));
        
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
    private _setCanvasCorrectWidthHeight():void
    {
        if(this._kernel.correctCanvasStyleAndDevicePixelRatio)
        {
            //Need to change the styling for the canvas, based on the DPI,
            //to avoid it being stretched and blurry.
            
            //getComputedStyle is used incase the canvas size is in %. Slice takes off the "px".
            //.width and .height are not the same as .style.width and .style.height, and if they
            //are less than the style values, the image can be blurry (we also need to take into
            //account the devicePixelRatio)
            this._gameCan.width = Number(window.getComputedStyle(this._gameCan).width.slice(0, -2)) * (window.devicePixelRatio || 1);
            this._gameCan.height = Number(window.getComputedStyle(this._gameCan).height.slice(0, -2)) * (window.devicePixelRatio || 1);
        }
        
        //It should be noted that this should be ran on loading as well (it is the first setting of the below)
        this.camera.setCameraSize();
        this._helpers.zCalc.resetVanishPointPosition();
        this._helpers.unit.setDimensions(this.camera.canvasPositionWidth, this.camera.canvasPositionHeight);
    }
}