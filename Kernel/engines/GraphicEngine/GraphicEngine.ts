import IGraphicEngine from './IGraphicEngine';
import ICamera from './ICamera';
import IFrameManager from './IFrameManager';
import IDrawPositions from './IDrawPositions';
import IDrawDimensions from './IDrawDimensions';
import ITextContent from './ITextContent';
import Kernel from '../../Kernel';
import UnitHelper from '../../utils/UnitHelper';
import ZCalc from '../../utils/ZCalc/ZCalc';

/**
 * The engine that controls the drawing to the screen
 */
export default class GraphicEngine implements IGraphicEngine {
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
        this.camera = camera;
        this._frameManager = frameManager;
        
        this._lastFrameCanvasWidth = 0;
        this._lastFrameCanvasHeight = 0;
        
        this._handleCanvasSizeChange();
    }
    
    /**
     * Triggers the clearing and re-drawing of the screen
     */
    run():void
    {
        const kernel = Kernel.getInstance();
        const canvas = kernel.canvasContext.canvas;
        
        // Need to do this, rather than using an event listener, as the onResize listener
        // doesn't react to a change of canvas size if the size is set in percentages.
        if(this._canvasSizeHasChanged()) 
            this._handleCanvasSizeChange();
        
        // Clear everything on the game canvas
        kernel.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        
        // Prepare to draw
        this._frameManager.determineFramesToDraw();
        
        // Draw the elements that are behind the models
        this.camera.drawBack();
        this._frameManager.drawFramesBack(kernel.canvasContext, this);
        kernel.level.drawBack();
        
        // Now the models
        this._drawModels();
        
        //Finally, draw everything that needs to be drawn on top of the models
        kernel.level.drawFront();
        this._frameManager.drawFramesFront(kernel.canvasContext, this);
        kernel.level.HUD.draw();
        this.camera.drawFront();
        
        if(kernel.settings.fpsDisplayColor)
            this._fpsMeter();
    }
    
    /**
     * Draws text onto the canvas
     * @param text the text content, and the details required to draw it
     * @param entityUnitValues the x/y/z values (in units) of the entity that owns the text
     * @param scaleType determines which method is used to scale the position/size of the text
     * @param showNegative if scaling the text, should it still be drawn when the z-index is negative?
     */
    drawText(
        textContent:ITextContent, 
        entityUnitValues:IDrawPositions & { z:number }, 
        scaleType:"static"|"scaled", 
        showNegative?:boolean
    ):void
    {
        // Scale the position/dimension values
        let x:number;
        let y:number; 
        let height:number;
        let lineGap:number;
        const unscaledValues = {
            x: entityUnitValues.x + textContent.x,
            y: entityUnitValues.y + textContent.y,
            z: entityUnitValues.z,
            height: textContent.size
        };
        
        if(scaleType == "static")
        {
            ({ x, y, height } = this.getStaticDrawPositionsAndDimensions(unscaledValues));
            lineGap = this.getStaticDrawPositionsAndDimensions({ height: textContent.lineGap }).height;
        }
        else
        {
            ({ x, y, height } = this.getScaledDrawPositionsAndDimensions(unscaledValues, !!showNegative));
            lineGap = this.getScaledDrawPositionsAndDimensions({ 
                height: textContent.lineGap,
                z: unscaledValues.z
            }, !!showNegative).height;
        }
        
        // Setup style and alignment properties
        const ctx = Kernel.getInstance().canvasContext;
        ctx.font = `${textContent.style} ${height}px ${textContent.font}`;
        ctx.fillStyle = textContent.color;
        ctx.textAlign = textContent.alignment;
        
        // Split the text into the individual lines
        const lines = textContent.content.split("\n");
        
        // Draw the lines of text
        lines.forEach(line => {
            ctx.fillText(line, x, y);
            y += (height + lineGap);
        });
    }
    
    /**
     * Calculates the draw positons/dimensions in pixels for a static entity (such as a HUD Component).
     * If any values aren't provided, 0 will be returned as the result.
     * @param unitValues The position/dimension values (in units)
     * @returns The pixel values for the x/y/width/height
     */
    getStaticDrawPositionsAndDimensions(unitValues:Partial<IDrawPositions&IDrawDimensions>):IDrawPositions&IDrawDimensions
    {
        const { x, y, width, height } = unitValues;
        
        const cameraX = this.camera.canvasPositionX;
        const cameraY = this.camera.canvasPositionY;
        
        const pixelValues = { x: 0, y: 0, width: 0, height: 0 };
        
        if(this._isSetNumber(x)) pixelValues.x = cameraX + UnitHelper.xUnit(x);
        if(this._isSetNumber(y)) pixelValues.y = cameraY + UnitHelper.yUnit(y);
        if(this._isSetNumber(width)) pixelValues.width = UnitHelper.xUnit(width);
        if(this._isSetNumber(height)) pixelValues.height = UnitHelper.yUnit(height)
        
        return pixelValues;
    }
    
    /**
     * Calculates the draw positons/dimensions in pixels for an entity that isn't z-scaled.
     * If any values aren't provided, 0 will be returned as the result.
     * @param unitValues The position/dimension values (in units)
     * @returns The pixel values for the x/y/width/height
     */
    getUnscaledDrawPositionsAndDimensions(unitValues:Partial<IDrawPositions&IDrawDimensions>):IDrawPositions&IDrawDimensions
    {
        const { x, y, width, height } = unitValues;
        
        return this.getStaticDrawPositionsAndDimensions({
            x: (this._isSetNumber(x)) ? this.camera.unitCameraPositionCalc.x(x) : undefined,
            y: (this._isSetNumber(y)) ? this.camera.unitCameraPositionCalc.y(y) : undefined,
            width,
            height
        });
    }
    
    /**
     * Calculates the draw positons/dimensions in pixels for an entity that is scaled on the z-axis.
     * If any values aren't provided, 0 will be returned as the result.
     * @param unitValues The position/dimension values (in units), plus the z position
     * @param showNegative Should the element still be drawn if the z position is negative?
     * @returns The pixel values for the scaled x/y/width/height
     */
    getScaledDrawPositionsAndDimensions(
        unitValues:Partial<IDrawPositions&IDrawDimensions>&{ z:number }, 
        showNegative = false
    ):IDrawPositions&IDrawDimensions
    {
        const unscaledValues = this.getUnscaledDrawPositionsAndDimensions(unitValues);
        
        return ZCalc.getDrawValues(unscaledValues, unitValues.z, showNegative);;
    }
    
    /**
     * Determines if an optional number variable has been set
     * @param val either a number, or an unset value (e.g. null, undefined)
     * @returns true if the value is a valid number, false if it's an "unset" value
     */
    private _isSetNumber(val?:number):boolean
    {
        return (typeof val === "number");
    }
    
    /**
     * Trigger the drawing of all of the models, in the correct order
     */
    private _drawModels():void
    {
        const loadedModels = Kernel.getInstance().loadedModels;
        
		// We need to make sure that the models are drawn ordered by the Z position.
		const zSortedModels = [...loadedModels].sort((a, b) => {
            const zA = typeof a.z === 'number' ? a.z : 0;
            const zB = typeof b.z === 'number' ? b.z : 0;
            
            return zB - zA;
        });
        
		zSortedModels.forEach(model => {
            if(
                model.active && 
                model.display && 
                this.camera.isOnCamera(model.x, model.y, model.width, model.height, model.z)
            )
            {
                model.draw();
            }
		});
    }
    
    /**
     * Draw the Frames Per Second counter
     */
    private _fpsMeter():void
    {
        const kernel = Kernel.getInstance();
        const ctx = kernel.canvasContext;
        
        const fps = Math.round(kernel.fps * 100) / 100; // 2 decimal places
        
        const fontSize = 30;
        ctx.font = fontSize + "px Arial";
        ctx.fillStyle = kernel.settings.fpsDisplayColor;
        ctx.textAlign = "left";
        
        ctx.fillText(`FPS: ${fps}`, 10, (10 + fontSize));
    }
    
    /**
     * Checks to see if the size of the canvas element has changed
     * @returns true if the size has changed, false if not
     */
    private _canvasSizeHasChanged():boolean
    {
        const canvas = Kernel.getInstance().canvasContext.canvas;
        const computedStyles = window.getComputedStyle(canvas);
        
        //slice() is used here to remove the "px"
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
     * Handles the canvas size changing (This should also be called on game initialisation).
     */
    private _handleCanvasSizeChange():void
    {
        this.camera.setCameraSize();
    }
}