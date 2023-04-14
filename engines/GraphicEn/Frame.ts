import IFrame from './IFrame';
import ICamera from './ICamera';
import Kernel from '../../Kernel/Kernel';
import IKernel from '../../Kernel/IKernel';
import IUnitHelper from '../../Kernel/helpers/IUnitHelper';
import ILightMask from './ILightMask';

/**
 * A single area of a level
 */
export default class Frame implements IFrame {
    
    private _kernel:IKernel;
    private _unitHelpers:IUnitHelper;
    
    private _camera:ICamera;
    private _canvasCtx:CanvasRenderingContext2D;
    
    //These are the indexes of the set background and lightmask in the 
    //_loadedBackgrounds and _loadedLightMasks arrays.
    private _backgroundIndex:number;
    private _lightMaskIndex:number;
    
    private _loadedLightMasks:ILightMask[];
    private _loadedBackgrounds:HTMLImageElement[];
    
    /**
     * the x position (in units) of the frame in the level
     */
    x: number;
    
    /**
     * the y position (in units) of the frame in the level
     */
    y: number;
    
    /**
     * the width (in units) of the frame
     */
    width: number;
    
    /**
     * the height (in units) of the frame
     */
    height: number;
    
    /**
     * Constructor
     * @param canvasCtx The 2D canvas context
     * @param camera The game's camera
     * @param x the x position (in units) of the frame in the level
     * @param y the y position (in units) of the frame in the level
     * @param width the width (in units) of the frame
     * @param height the height (in units) of the frame
     */
    constructor(canvasCtx:CanvasRenderingContext2D, camera:ICamera, x:number, y:number, width:number, height:number)
    {
        this._kernel = Kernel.getInstance();
        this._unitHelpers = this._kernel.helpers.unit;
        
        this._camera = camera;
        this._canvasCtx = canvasCtx;
        
        this._loadedLightMasks = [];
        this._loadedBackgrounds = [];
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    
    /**
     * Loads the background image at the given path, and returns the index to that image in the Frame's 
     * internal state
     * @param path the path of the image file
     * @returns the index number of the image in the Frame's internal array
     */
    loadBackground(path:string):number
    {
        this._loadedBackgrounds.push(this._kernel.loadImage(path));
        return this._loadedBackgrounds.length - 1;
    }
    
    /**
     * Loads the light mask image at the given path, and returns the index to that image in the Frame's 
     * internal state
     * @param path the path of the light mask's image file
     * @param luminosity a number that represents the light mask's luminosity (0 is the darkest, 1 is the lightest)
     * @returns the index number of the image in the Frame's internal array
     */
    loadLightMask(path:string, luminosity:number):number
    {   
        this._loadedLightMasks.push({
            image: this._kernel.loadImage(path),
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
     * @param xUnitPos The x position (in units) to draw the frame at
     * @param yUnitPos The y position (in units) to draw the frame at
     */
    drawFront(xUnitPos:number, yUnitPos:number):void
    {
        if(this._lightMaskIndex)
        {
            const lightMaskInfo = this._loadedLightMasks[this._lightMaskIndex];
			
            this._canvasCtx.globalAlpha = lightMaskInfo.luminosity;
            this._canvasCtx.drawImage(
                lightMaskInfo.image,
                this._unitHelpers.xUnit(xUnitPos) + this._camera.canvasPositionX,
                this._unitHelpers.yUnit(yUnitPos) + this._camera.canvasPositionY,
                this._unitHelpers.xUnit(this.width),
                this._unitHelpers.yUnit(this.height)
            );
            this._canvasCtx.globalAlpha = 1;
        }
    }
    
    /**
     * Draws the background-related elements of the frame (such as the background image)
     * @param xUnitPos The x position (in units) to draw the frame at
     * @param yUnitPos The y position (in units) to draw the frame at
     */
    drawBack(xUnitPos:number, yUnitPos:number):void
    {
        if(this._backgroundIndex)
        {
            this._canvasCtx.drawImage(
                this._loadedBackgrounds[this._backgroundIndex],
                this._unitHelpers.xUnit(xUnitPos) + this._camera.canvasPositionX,
                this._unitHelpers.yUnit(yUnitPos) + this._camera.canvasPositionY,
                this._unitHelpers.xUnit(this.width),
                this._unitHelpers.yUnit(this.height)
            );
        }
    }
}