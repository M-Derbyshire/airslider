import Kernel from '/kernel/kernel';

export default class Frame {
    
    //x, y, width and height are all unit values
    constructor(canvasCtx, camera, x, y, width, height)
    {
        this.kernel = Kernel.getInstance();
        this.unitHelpers = this.kernel.helpers.unit;
        
        this._camera = camera;
        this._canvasCtx = canvasCtx;
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        //-1 means there is none set.
        //These are the indexes of the set background and lightmask in the 
        //_loadedBackgrounds and _loadedLightMasks arrays.
        this._backgroundIndex = -1;
        this._lightMaskIndex = -1;
        
        //Will contain the images in the kernel's assets array
        this._loadedLightMasks = []; //{ image, luminosity }
        this._loadedBackgrounds = [];
    }
    
    
    
    loadBackground(path) //Will return the index in this._loadedBackgrounds
    {
        this._loadedBackgrounds.push(this.kernel.loadImage(path));
        return this._loadedBackgrounds.length - 1;
    }
    
    loadLightMask(path, luminosity) //Will return the index in this._loadedLightMasks
    {
        //luminoisty takes a number between 0 (darkest) and 1 (lightest)
        
        this._loadedLightMasks.push({
            image: this.kernel.loadImage(path),
            luminosity: 1 - luminosity
        });
        return this._loadedLightMasks.length - 1;
    }
    
    setBackgroundImage(index)
    {
        this._backgroundIndex = index;
    }
    
    setLightMaskImage(index)
    {
        this._lightMaskIndex = index;
    }
    
    
    drawFront(xUnitPos, yUnitPos) //Draw the light mask
    {
        if(this._lightMaskIndex > -1)
        {
            const lightMaskInfo = this._loadedLightMasks[this._lightMaskIndex];
			
            this._canvasCtx.globalAlpha = lightMaskInfo.luminosity;
            this._canvasCtx.drawImage(
                lightMaskInfo.image,
                this.unitHelpers.xUnit(xUnitPos) + this._camera.canvasPositionX,
                this.unitHelpers.yUnit(yUnitPos) + this._camera.canvasPositionY,
                this.unitHelpers.xUnit(this.width),
                this.unitHelpers.yUnit(this.height)
            );
            this._canvasCtx.globalAlpha = 1;
        }
    }
    
    drawBack(xUnitPos, yUnitPos) //Draw the background image
    {
        if(this._backgroundIndex > -1)
        {
            this._canvasCtx.drawImage(
                this._loadedBackgrounds[this._backgroundIndex],
                this.unitHelpers.xUnit(xUnitPos) + this._camera.canvasPositionX,
                this.unitHelpers.yUnit(yUnitPos) + this._camera.canvasPositionY,
                this.unitHelpers.xUnit(this.width),
                this.unitHelpers.yUnit(this.height)
            );
        }
    }
}