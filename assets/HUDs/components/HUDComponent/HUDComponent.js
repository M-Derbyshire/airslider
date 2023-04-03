import Kernel from '/Kernel/kernel';

export default class HUDComponent
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        //Set in load(). 
        this._ctx; //The canvas context
        this._camera;
		
		this.x;
        this.y;
        this.width;
        this.height;
        
        this.active = true;
        
        this._assetsToUnload = []; // file paths of assets that need to be released when this is unloaded
        
        this.text = {
            content: "",
            x: 0, // relative to level
            y: 0, // relative to level
            size: 30, // in pixels
            font: "Arial",
            color: "red",
            style: "bolder", // canvas font-style, font-variant and font-weight
        };
    }
    
    load(canvasCtx, camera)
    {
        this._ctx = canvasCtx;
        this._camera = camera;
    }
    
    //If implementing your own unload in a child class, be sure to call this with super.unload()
    unload()
    {
        this._assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
    }
    
    drawText()
    {
        const drawX = this.helpers.unit.xUnit(this.text.x);
        const drawY = this.helpers.unit.yUnit(this.text.y);
        const drawSize = this.helpers.unit.yUnit(this.text.size);
        
        const cameraX = this._camera.canvasPositionX;
        const cameraY = this._camera.canvasPositionY;
        
        this._ctx.font = `${this.text.style} ${drawSize}px ${this.text.font}`;
        this._ctx.fillStyle = this.text.color;
        
        this._ctx.fillText(this.text.content, drawX + cameraX, drawY + cameraY);
    }
    
    //meant to be overriden
    draw(){}
    prepare(){}
	
	isPointerOverlapping(pointX, pointY)
	{
		const xUnit = this.helpers.unit.xUnit.bind(this.helpers.unit);
		const yUnit = this.helpers.unit.yUnit.bind(this.helpers.unit);
		
		return (
			pointX > xUnit(this.x) && pointX < (xUnit(this.x) + xUnit(this.width)) && 
			pointY > yUnit(this.y) && pointY < (yUnit(this.y) + yUnit(this.height))
		);
	}
}