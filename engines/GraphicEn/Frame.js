import Kernel from '/Kernel/kernel';

/**
 * A single area of a level
 */
export default class Frame {
    
    /**
     * Constructor
     * @param canvasCtx The 2D canvas context
     * @param camera The game's camera
     * @param x the x position (in units) of the frame in the level
     * @param y the y position (in units) of the frame in the level
     * @param width the width (in units) of the frame
     * @param height the height (in units) of the frame
     */
    constructor(canvasCtx, camera, x, y, width, height)
    {
        this._kernel = Kernel.getInstance();
        this._unitHelpers = this._kernel.helpers.unit;
        
        this._camera = camera;
        this._canvasCtx = canvasCtx;
        
        //These are the indexes of the set background and lightmask in the 
        //_loadedBackgrounds and _loadedLightMasks arrays.
        this._backgroundIndex:number;
        this._lightMaskIndex:number;
        
        this._loadedLightMasks:ILightMask[] = [];
        this._loadedBackgrounds:HTMLImageElement[] = [];
        
         /**
         * the x position (in units) of the frame in the level
         */
        this.x = x;
        
         /**
         * the y position (in units) of the frame in the level
         */
        this.y = y;
        
        /**
         * the width (in units) of the frame
         */
        this.width = width;
        
        /**
         * the height (in units) of the frame
         */
        this.height = height;
    }
    
    
    /**
     * Loads the background image at the given path, and returns the index to that image in the Frame's 
     * internal state
     * @param path the path of the image file
     * @returns the index number of the image in the Frame's internal array
     */
    loadBackground(path)
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
    loadLightMask(path, luminosity)
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
    setBackgroundImage(index)
    {
        this._backgroundIndex = index;
    }
    
    /**
     * Sets the light mask image for the frame
     * @param index the index number (returned from the loadLightMask method) for the required image
     */
    setLightMaskImage(index)
    {
        this._lightMaskIndex = index;
    }
    
    /**
     * Draws the foreground-related elements of the frame (such as the light mask)
     * @param xUnitPos The x position (in units) to draw the frame at
     * @param yUnitPos The y position (in units) to draw the frame at
     */
    drawFront(xUnitPos, yUnitPos)
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
    drawBack(xUnitPos, yUnitPos)
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