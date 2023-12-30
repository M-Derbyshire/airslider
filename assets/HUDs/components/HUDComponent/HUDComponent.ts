import Kernel from '../../../../Kernel/Kernel';
import IKernel from '../../../../Kernel/IKernel';
import IHUDComponent from './IHUDComponent';
import IHelpers from '../../../../Kernel/helpers/IHelpers';
import ICamera from '../../../../engines/GraphicEngine/ICamera';
import ITextContent from '../../../../engines/GraphicEngine/ITextContent';

/**
 * A component to be displayed by the Heads Up Display
 */
export default class HUDComponent implements IHUDComponent
{
    protected kernel: IKernel;
    protected helpers: IHelpers;
    protected ctx: CanvasRenderingContext2D;
    protected camera: ICamera;
    protected assetsToUnload: string[]; // File paths of assets that need to be released when this is unloaded
    
    /**
     * The x coordinate of this component (in units)
     */
    x: number;
    
    /**
     * The y coordinate of this component (in units)
     */
    y: number;
    
    /**
     * The width of this component (in units)
     */
    width: number;
    
    /**
     * The height of this component (in units)
     */
    height: number;
    
    /**
     * Is this component active?
     */
    active: boolean;
    
    /**
     * The text content to be displayed with the component
     */
    text: ITextContent;
    
    
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        this.ctx = this.kernel.gameContext;
        
        this.assetsToUnload = [];
    }
    
    /**
     * Prepares the component before the level starts
     */
    prepare():void 
    {
        this.text = {
            content: "",
            x: 0, // In units
            y: 0, // In units
            size: 30, // in pixels
            font: "Arial",
            color: "red",
            style: "bolder", // See the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
        };
        
        this.active = true;
    }
    
    /**
     * Loads the component
     * @param camera the game's camera
     */
    load(camera:ICamera):void
    {
        this.camera = camera;
    }
    
    /**
     * Unloads any assets that need to be unloaded by the component
     */
    unload():void
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
    }
    
    /**
     * Draws the text content setup within this component
     */
    drawText():void
    {
        const { x, y } = this.kernel.graphicEngine.getStaticDrawPositionsAndDimensions({ 
            x: this.text.x, 
            y: this.text.y, 
            width: 0, 
            height: 0 
        });
        
        const drawSize = this.helpers.unit.yUnit(this.text.size);
        
        this.ctx.font = `${this.text.style} ${drawSize}px ${this.text.font}`;
        this.ctx.fillStyle = this.text.color;
        
        this.ctx.fillText(this.text.content, x, y);
    }
    
    /**
     * Draws the component
     */
    draw():void {}
	
    /**
     * Is the mouse pointer overlapping this component?
     * @param pointX the x position (within the canvas's space) of the mouse pointer 
     * @param pointY the y position (within the canvas's space) of the mouse pointer
     * @returns true if it is overlapping, false if not
     */
	isPointerOverlapping(pointX:number, pointY:number):boolean
	{
        const { x, y, width, height } = this.kernel.graphicEngine.getStaticDrawPositionsAndDimensions({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
        
        return (
			pointX >= x && 
            pointX <= (x + width) && 
			pointY >= y && 
            pointY <= (y + height)
		);
	}
}