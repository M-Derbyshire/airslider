import Kernel from '../../Kernel/Kernel';
import IKernel from '../../Kernel/IKernel';
import IGraphicEngine from './IGraphicEngine';
import ICamera from './ICamera';
import IFrameManager from './IFrameManager';
import IHelpers from '../../Kernel/helpers/IHelpers';
import IDrawPositions from './IDrawPositions';
import IDrawDimensions from './IDrawDimensions';

/**
 * The engine that controls the drawing to the screen
 */
export default class GraphicEngine implements IGraphicEngine {
    
    private _kernel:IKernel;
    private _helpers:IHelpers;
    
    private _gameCanvas:HTMLCanvasElement; // The canvas that we're drawing on
    private _gameCtx:CanvasRenderingContext2D; // The 2D context for the canvas
    private _frameManager:IFrameManager; // Manages the level's frames
    
    private _lastFrameCanvasWidth:number; // The pixel width of the canvas element, during the last draw
    private _lastFrameCanvasHeight:number; // The pixel height of the canvas element, during the last draw
    
    /**
     * The camera for the level
     */
    camera:ICamera;
    
    /**
     * Constructor
     * @param camera The level's camera
     * @param frameManager The level's frame manager
     */
    constructor(camera:ICamera, frameManager:IFrameManager)
    {
        this._kernel = Kernel.getInstance();
        this._helpers = this._kernel.helpers;
		
        this._gameCanvas = this._kernel.gameCanvas;
        this._gameCtx = this._kernel.gameContext;
        this.camera = camera;
        this._frameManager = frameManager;
        
        this._lastFrameCanvasWidth = 0;
        this._lastFrameCanvasHeight = 0;
        
        // This needs to be ran here, so other entities can use these dimensions on startup
        this._setCanvasCorrectWidthHeight();
    }
    
    /**
     * Triggers the clearing and re-drawing of the screen
     */
    run():void
    {
        // Need to do this, rather than using an event listener, as the onResize listener
        // doesn't react to a change of canvas size if the size is set in percentages.
        if(this._canvasSizeHasChanged()) 
            this._setCanvasCorrectWidthHeight();
        
        // Clear everything on the game canvas
        this._gameCtx.clearRect(0, 0, this._gameCanvas.width, this._gameCanvas.height);
        
        // Prepare to draw
        this._frameManager.determineFramesToDraw();
        
        // Draw the elements that are behind the models
        this.camera.drawBack();
        this._frameManager.drawFramesBack();
        this._kernel.level.drawBack();
        
        // Now the models
        this._drawModels();
        
        //Finally, draw everything that needs to be drawn on top of the models
        this._kernel.level.drawFront();
        this._frameManager.drawFramesFront();
        this._kernel.level.HUD.draw();
        this.camera.drawFront();
        
        if(this._kernel.displayFps)
            this._fpsMeter();
    }
    
    /**
     * Calculates the draw positons/dimensions in pixels for a static entity (such as a HUD Component)
     * @param unitValues The position/dimension values (in units)
     * @returns The pixel values for the x/y/width/height
     */
    getStaticDrawPositionsAndDimensions(unitValues:IDrawPositions&IDrawDimensions):IDrawPositions&IDrawDimensions
    {
        const { x, y, width, height } = unitValues;
        
        const cameraX = this.camera.canvasPositionX;
        const cameraY = this.camera.canvasPositionY;
        
        return {
            x: cameraX + this._helpers.unit.xUnit(x),
            y: cameraY + this._helpers.unit.yUnit(y),
            width: this._helpers.unit.xUnit(width),
            height: this._helpers.unit.yUnit(height)
        };
    }
    
    /**
     * Trigger the drawing of all of the models, in the correct order
     */
    private _drawModels():void
    {
		// We need to make sure that the models are drawn ordered by the Z position.
		const zSortedModels = [...this._kernel.loadedModels].sort((a, b) => b.z - a.z);
        
		zSortedModels.forEach(model => {
            const isOnCamera = this.camera.isOnCamera(model.x, model.y, model.width, model.height, model.z);
            
			if(isOnCamera && model.active && model.display)
                model.draw();
		});
    }
    
    /**
     * Draw the Frames Per Second counter
     */
    private _fpsMeter():void
    {
        const fps = Math.round(this._kernel.fps * 100) / 100; // 2 decimal places
        
        const fontSize = 30;
        this._gameCtx.font = fontSize + "px Arial";
        this._gameCtx.fillStyle = this._kernel.fpsDisplayColor;
        
        this._gameCtx.fillText(`FPS: ${fps}`, 10, (10 + fontSize));
    }
    
    /**
     * Checks to see if the size of the canvas element has changed
     * @returns true if the size has changed, false if not
     */
    private _canvasSizeHasChanged():boolean
    {
        //slice() is used here to remove the "px"
        const computedStyles = window.getComputedStyle(this._gameCanvas);
        const currentWidth = Number(computedStyles.width.slice(0, -2));
        const currentHeight = Number(computedStyles.height.slice(0, -2));
        
        if(currentWidth !== this._lastFrameCanvasWidth || currentHeight !== this._lastFrameCanvasHeight)
        {
            this._lastFrameCanvasWidth = currentWidth;
            this._lastFrameCanvasHeight = currentHeight;
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Corrects the canvas element's styling width/height, based on the Device Pixel Ratio.
     * Will then call reset methods on any elements that need to be aware of the canvas element 
     * changing size.
     * 
     * This should also be called on loading, to allow a number of elements to have the new 
     * width/height values.
     */
    private _setCanvasCorrectWidthHeight():void
    {
        if(this._kernel.correctCanvasStyleToDevicePixelRatio)
        {
            const devicePixelRatio = (window.devicePixelRatio || 1);
            
            // Need to change the styling for the canvas, based on the DPI,
            // to avoid it being stretched and blurry.
            
            // getComputedStyle is used incase the canvas size is in %. Slice takes off the "px".
            // .width and .height are not the same as .style.width and .style.height, and if they
            // are less than the style values, the image can be blurry (we also need to take into
            // account the devicePixelRatio)
            const computedStyles = window.getComputedStyle(this._gameCanvas);
            this._gameCanvas.width = Number(computedStyles.width.slice(0, -2)) * devicePixelRatio;
            this._gameCanvas.height = Number(computedStyles.height.slice(0, -2)) * devicePixelRatio;
        }
        
        // It should be noted that these should be ran on loading as well (as it is the first setting of the below)
        this.camera.setCameraSize();
        this._helpers.zCalc.resetVanishPointPosition();
        this._helpers.unit.setDimensions(this.camera.canvasPositionWidth, this.camera.canvasPositionHeight);
    }
}