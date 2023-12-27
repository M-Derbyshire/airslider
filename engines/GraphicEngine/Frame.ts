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
    
    private _camera:ICamera; // The level's camera
    private _canvasCtx:CanvasRenderingContext2D; // The 2D context from the canvas element
    
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
     * @param camera the level's camera
     * @param x the x position (in units) of the frame in the level
     * @param y the y position (in units) of the frame in the level
     * @param width the width (in units) of the frame
     * @param height the height (in units) of the frame
     */
    constructor(camera:ICamera, x:number, y:number, width:number, height:number)
    {
        this._kernel = Kernel.getInstance();
        this._unitHelpers = this._kernel.helpers.unit;
        
        this._camera = camera;
        this._canvasCtx = this._kernel.gameContext;
        
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
        this._loadedBackgrounds.push(this._kernel.loadImage(path));
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
     */
    drawFront():void
    {
        if(this._lightMaskIndex !== null)
        {
            const xUnitValue = this._camera.unitCameraPositionCalc.x(this.x);
            const yUnitValue = this._camera.unitCameraPositionCalc.y(this.y);
            
            const xDrawValue = this._unitHelpers.xUnit(xUnitValue) + this._camera.canvasPositionX;
            const yDrawValue = this._unitHelpers.yUnit(yUnitValue) + this._camera.canvasPositionY;
            
            const lightMaskInfo = this._loadedLightMasks[this._lightMaskIndex];
			
            this._canvasCtx.globalAlpha = lightMaskInfo.luminosity;
            this._canvasCtx.drawImage(
                lightMaskInfo.image,
                xDrawValue,
                yDrawValue,
                this._unitHelpers.xUnit(this.width),
                this._unitHelpers.yUnit(this.height)
            );
            this._canvasCtx.globalAlpha = 1;
        }
    }
    
    /**
     * Draws the background-related elements of the frame (such as the background image)
     */
    drawBack():void
    {
        if(this._backgroundIndex !== null)
        {
            const xUnitValue = this._camera.unitCameraPositionCalc.x(this.x);
            const yUnitValue = this._camera.unitCameraPositionCalc.y(this.y);
            
            const xDrawValue = this._unitHelpers.xUnit(xUnitValue) + this._camera.canvasPositionX;
            const yDrawValue = this._unitHelpers.yUnit(yUnitValue) + this._camera.canvasPositionY;
            
            this._canvasCtx.drawImage(
                this._loadedBackgrounds[this._backgroundIndex],
                xDrawValue,
                yDrawValue,
                this._unitHelpers.xUnit(this.width),
                this._unitHelpers.yUnit(this.height)
            );
        }
    }
}