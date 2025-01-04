import Kernel from '../../Kernel';
import IFrame from './IFrame';
import ILightMask from './ILightMask';

/**
 * A single area of a level
 */
export default class Frame implements IFrame {
    // These are the indexes of the currently selected background and lightmask in the 
    // _loadedBackgrounds and _loadedLightMasks arrays.
    private _backgroundIndex:number|null = null;
    private _lightMaskIndex:number|null = null;
    
    private _loadedLightMasks:ILightMask[]; // The currently loaded light masks for the frame
    private _loadedBackgrounds:HTMLImageElement[]; // The currently loaded backgrounds for the frame
    
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
        this._loadedLightMasks = [];
        this._loadedBackgrounds = [];
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    /**
     * Loads a background image, and returns the index to that image in the Frame's 
     * internal state.
     * @param path the path of the background image file
     * @returns the index number of the image in the Frame's internal array
     */
    loadBackground(path:string):number
    {
        const assetHandler = Kernel.getInstance().assetHandler;
        
        this._loadedBackgrounds.push(assetHandler.loadImage(path));
        return this._loadedBackgrounds.length - 1;
    }
    
    /**
     * Loads a light mask image, and returns the index to that image in the Frame's 
     * internal state
     * @param path the path of the light mask's image file
     * @param luminosity a number that represents the light mask's luminosity (1 is the lightest, 0 is the darkest)
     * @returns the index number of the image in the Frame's internal array
     */
    loadLightMask(path:string, luminosity:number):number
    {
        const assetHandler = Kernel.getInstance().assetHandler;
        
        this._loadedLightMasks.push({
            image: assetHandler.loadImage(path),
            luminosity: 1 - luminosity
        });
        
        return this._loadedLightMasks.length - 1;
    }
    
    /**
     * Sets the background image for the frame
     * @param index the index number (returned from the loadBackground method) for the required image
     */
    setBackgroundImage(index:number):void
    {
        this._backgroundIndex = index;
    }
    
    /**
     * Sets the light mask image for the frame
     * @param index the index number (returned from the loadLightMask method) for the required image
     */
    setLightMaskImage(index:number):void
    {
        this._lightMaskIndex = index;
    }
    
    /**
     * Draws the foreground-related elements of the frame (such as the light mask)
     */
    drawFront():void
    {
        if(this._lightMaskIndex !== null)
        {
            const graphicEngine = Kernel.getInstance().graphicEngine;
            
            const { x, y, width, height } = graphicEngine.getUnscaledDrawPositionsAndDimensions({
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            });
            
            const lightMaskInfo = this._loadedLightMasks[this._lightMaskIndex];
			
            const ctx = Kernel.getInstance().canvasContext;
            
            ctx.globalAlpha = lightMaskInfo.luminosity;
            ctx.drawImage(lightMaskInfo.image, x, y, width, height);
            ctx.globalAlpha = 1;
        }
    }
    
    /**
     * Draws the background-related elements of the frame (such as the background image)
     */
    drawBack():void
    {
        if(this._backgroundIndex !== null)
        {
            const graphicEngine = Kernel.getInstance().graphicEngine;
            
            const { x, y, width, height } = graphicEngine.getUnscaledDrawPositionsAndDimensions({
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            });
            
            const backgroundImage = this._loadedBackgrounds[this._backgroundIndex];
            
            Kernel.getInstance().canvasContext.drawImage(backgroundImage, x, y, width, height);
        }
    }
}