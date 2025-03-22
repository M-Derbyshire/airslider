import Kernel from '../../Kernel';
import IFrame from './IFrame';
import ILightMask from './ILightMask';

/**
 * A single area of a level
 */
export default class Frame implements IFrame {
    private _backgroundColor:string|null = null;
    private _background:HTMLImageElement|null = null;
    private _lightMask:HTMLImageElement|null = null;
    private _lightMaskLuminosity:number = 1; // the light mask's luminosity (1 is the lightest, 0 is the darkest)
    
    /**
     * The x position (in units) of the frame in the level
     */
    x: number;
    
    /**
     * The y position (in units) of the frame in the level
     */
    y: number;
    
    /**
     * The width (in units) of the frame
     */
    width: number;
    
    /**
     * The height (in units) of the frame
     */
    height: number;
    
    /**
     * Constructor
     * @param x the x position (in units) of the frame in the level
     * @param y the y position (in units) of the frame in the level
     * @param width the width (in units) of the frame
     * @param height the height (in units) of the frame
     */
    constructor(x:number, y:number, width:number, height:number)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
     * Draws the foreground-related elements of the frame (such as the light mask)
     */
    drawFront():void
    {
        if(this._lightMask !== null)
        {
            const graphicEngine = Kernel.getInstance().graphicEngine;
            
            const { x, y, width, height } = graphicEngine.getUnscaledDrawPositionsAndDimensions({
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            });
            const ctx = Kernel.getInstance().canvasContext;
            
            ctx.globalAlpha = 1 - this._lightMaskLuminosity;
            ctx.drawImage(this._lightMask, x, y, width, height);
            ctx.globalAlpha = 1;
        }
    }
    
    /**
     * Draws the background-related elements of the frame (such as the background image)
     */
    drawBack():void
    {
        if(!this._background && !this._backgroundColor) return;
        
        const graphicEngine = Kernel.getInstance().graphicEngine;
        const ctx = Kernel.getInstance().canvasContext;
        
        const { x, y, width, height } = graphicEngine.getUnscaledDrawPositionsAndDimensions({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
        
        if(this._backgroundColor != null)
        {
            ctx.fillStyle = this._backgroundColor;
            ctx.fillRect(x, y, width, height);
        }
        
        if(this._background !== null)
        {
            ctx.drawImage(this._background, x, y, width, height);
        }
    }
}