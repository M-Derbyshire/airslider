class Frame {
    
    //x, y, width and height are all unit values
    constructor(x, y, width, height)
    {
        this.kernel = Kernel.getInstance();
        this.unitHelpers = this.kernel.helpers.unit;
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        //-1 means there is none set.
        //These are the indexes of the set background and lightmask in the 
        //_loadedBackgrounds and _loadedLightMasks arrays.
        this._background = -1;
        this._lightMask = -1;
        
        //Will contain the indexes of the images in the kernel's assets array
        this._loadedLightMasks = []; //{ imageIndex, luminosity }
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
            imageIndex: this.kernel.loadImage(path),
            luminosity: 1 - luminosity
        });
        return this._loadedLightMasks.length - 1;
    }
    
    setBackgroundImage(index)
    {
        this._background = index;
    }
    
    setLightMaskImage(index)
    {
        this._lightMask = index;
    }
    
    
    drawFront(xUnitPos, yUnitPos) //Draw the light mask
    {
        if(this._lightMask > -1)
        {
            const camera = this.kernel.graphicEn.camera;
            const lightMaskInfo = this._loadedLightMasks[this._lightMask];
        
            this.kernel.graphicEn.gameCtx.globalAlpha = lightMaskInfo.luminosity;
            this.kernel.graphicEn.gameCtx.drawImage(
                this.kernel.loadedAssets[lightMaskInfo.imageIndex].asset,
                this.unitHelpers.xUnit(xUnitPos) + camera.positions.canvas.x,
                this.unitHelpers.yUnit(yUnitPos) + camera.positions.canvas.y,
                this.unitHelpers.xUnit(this.width),
                this.unitHelpers.yUnit(this.height)
            );
            this.kernel.graphicEn.gameCtx.globalAlpha = 1;
        }
    }
    
    drawBack(xUnitPos, yUnitPos) //Draw the background image
    {
        if(this._lightMask > -1)
        {
            const camera = this.kernel.graphicEn.camera;
            
            this.kernel.graphicEn.gameCtx.drawImage(
                this.kernel.loadedAssets[this._loadedBackgrounds[this._background]].asset,
                this.unitHelpers.xUnit(xUnitPos) + camera.positions.canvas.x,
                this.unitHelpers.yUnit(yUnitPos) + camera.positions.canvas.y,
                this.unitHelpers.xUnit(this.width),
                this.unitHelpers.yUnit(this.height)
            );
        }
    }
}