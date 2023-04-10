import Kernel from '/Kernel/kernel';

/**
 * A component of the Heads Up Display
 */
export default class HUDComponent
{
    /**
     * Constructor
     */
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
         
        this.ctx; //The canvas context
        this.camera;
        
        this.assetsToUnload = []; // file paths of assets that need to be released when this is unloaded
		
        
        /**
         * The x coordinate of this component
         */
		this.x;
        
        /**
         * The y coordinate of this component
         */
        this.y;
        
        /**
         * The width of this component
         */
        this.width;
        
        /**
         * The height of this component
         */
        this.height;
        
        /**
         * Is this component active?
         */
        this.active = true;
        
        /**
         * Details for displaying an entity's text content
         */
        this.text = {
            content: "",
            x: 0, // relative to level
            y: 0, // relative to level
            size: 30, // in pixels
            font: "Arial",
            color: "red",
            style: "bolder", // See the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
        };
    }
    
    /**
     * Loads the component
     * @param canvasCtx the 2D context from the HTML canvas element
     * @param camera the game's camera
     */
    load(canvasCtx, camera)
    {
        this.ctx = canvasCtx;
        this.camera = camera;
    }
    
    /**
     * Unloads any assets that need to be unloaded by the component
     */
    unload()
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
    }
    
    /**
     * Draws the text content setup within this component
     */
    drawText()
    {
        const drawX = this.helpers.unit.xUnit(this.text.x);
        const drawY = this.helpers.unit.yUnit(this.text.y);
        const drawSize = this.helpers.unit.yUnit(this.text.size);
        
        const cameraX = this.camera.canvasPositionX;
        const cameraY = this.camera.canvasPositionY;
        
        this.ctx.font = `${this.text.style} ${drawSize}px ${this.text.font}`;
        this.ctx.fillStyle = this.text.color;
        
        this.ctx.fillText(this.text.content, drawX + cameraX, drawY + cameraY);
    }
    
    /**
     * Draws the component
     */
    draw(){}
    
    /**
     * Prepares the component before the level starts
     */
    prepare(){}
	
    /**
     * Is the mouse pointer overlapping this component?
     * @param pointX the x position (within the canvas's space) of the mouse pointer 
     * @param pointY the y position (within the canvas's space) of the mouse pointer
     * @returns true if it is overlapping, false if not
     */
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