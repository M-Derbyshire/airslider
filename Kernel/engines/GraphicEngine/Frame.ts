import IFrame from './IFrame';
import IGraphicEngine, { IDrawDimensions, IDrawPositions } from './IGraphicEngine';

/**
 * A single area of a level
 */
export default class Frame implements IFrame {
    private _backgroundColor:string|null = null;
    private _background:HTMLImageElement|null = null;
    private _lightMask:HTMLImageElement|null = null;
    private _lightMaskLuminosity:number = 1; // the light mask's luminosity (1 is the lightest, 0 is the darkest)
    
    private _calculatedDrawPositionsAndDimensions:IDrawDimensions&IDrawPositions = null; // Stores the actual positions/dimensions to draw the frame with
    private _x:number; // The x position (in units) of the frame in the level
    private _y:number; // The y position (in units) of the frame in the level
    private _width:number; // The width (in units) of the frame
    private _height:number; // The height (in units) of the frame
    
    /**
     * The x position (in units) of the frame in the level
     */
    get x():number
    {
        return this._x;
    }
    set x(val:number)
    {
        this._calculatedDrawPositionsAndDimensions = null;
        this._x = val;
    }
    
    /**
     * The y position (in units) of the frame in the level
     */
    get y():number
    {
        return this._y;
    }
    set y(val:number)
    {
        this._calculatedDrawPositionsAndDimensions = null;
        this._y = val;
    }
    
    /**
     * The width (in units) of the frame
     */
    get width():number
    {
        return this._width;
    }
    set width(val:number)
    {
        this._calculatedDrawPositionsAndDimensions = null;
        this._width = val;
    }
    
    /**
     * The height (in units) of the frame
     */
    get height():number
    {
        return this._height;
    }
    set height(val:number)
    {
        this._calculatedDrawPositionsAndDimensions = null;
        this._height = val;
    }
    
    /**
     * Constructor
     * @param x the x position (in units) of the frame in the level
     * @param y the y position (in units) of the frame in the level
     * @param width the width (in units) of the frame
     * @param height the height (in units) of the frame
     */
    constructor(x:number, y:number, width:number, height:number)
    {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }
    
    /**
     * Sets the background color for the frame
     * @param color the color (e.g. "red"/"#ff0000") to use as the background of the frame (this will be drawn 
     * underneath the background image, if an image is set)
     */
    setBackgroundColor(color:string):void
    {
        this._backgroundColor = color;
    }
    
    /**
     * Sets the background image for the frame
     * @param image the image to use as the background of the frame
     */
    setBackgroundImage(image:HTMLImageElement):void
    {
        this._background = image;
    }
    
    /**
     * Sets the light mask image for the frame
     * @param image the image to use as the light mask of the frame
     * @param luminosity a number that represents the light mask's luminosity (1 is the lightest, 0 is the darkest)
     */
    setLightMaskImage(image:HTMLImageElement, luminosity:number):void
    {
        this._lightMask = image;
        this._lightMaskLuminosity = luminosity;
    }
    
    /**
     * Calculates and stores the positions/dimensions to draw the frame with
     * @param graphicEngine The graphic engine for the level
     */
    calculateDrawPositionsAndDimensions(graphicEngine:IGraphicEngine):void
    {
        this._calculatedDrawPositionsAndDimensions = graphicEngine.getUnscaledDrawPositionsAndDimensions({
            x: this._x,
            y: this._y,
            width: this._width,
            height: this._height
        });
    }
    
    /**
     * Draws the foreground-related elements of the frame (such as the light mask)
     * @param canvasCtx The context used to draw on the game's canvas
     */
    drawFront(canvasCtx:CanvasRenderingContext2D):void
    {
        if(!this._lightMask)
            return;
        
        const { x, y, width, height } = this._calculatedDrawPositionsAndDimensions;
        
        canvasCtx.globalAlpha = 1 - this._lightMaskLuminosity;
        canvasCtx.drawImage(this._lightMask, x, y, width, height);
        canvasCtx.globalAlpha = 1;
    }
    
    /**
     * Draws the background-related elements of the frame (such as the background image)
     * @param canvasCtx The context used to draw on the game's canvas
     */
    drawBack(canvasCtx:CanvasRenderingContext2D):void
    {
        if(!this._background && !this._backgroundColor) return;
        
        const { x, y, width, height } = this._calculatedDrawPositionsAndDimensions;
        
        if(this._backgroundColor != null)
        {
            canvasCtx.fillStyle = this._backgroundColor;
            canvasCtx.fillRect(x, y, width, height);
        }
        
        if(this._background !== null)
        {
            canvasCtx.drawImage(this._background, x, y, width, height);
        }
    }
}