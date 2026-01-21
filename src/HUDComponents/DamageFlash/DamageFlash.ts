import IGraphicEngine from '../../../Kernel/engines/GraphicEngine/IGraphicEngine';
import Kernel from '../../../Kernel/Kernel';
import ASHUDComponent from '../ASHUDComponent/ASHUDComponent';

/**
 * Flashes an image on the screen (such as a border, when the player take damage)
 */
export default class DamageFlash extends ASHUDComponent
{
    protected opacity:number;
    protected shouldFadeOut:boolean; // Should we be fading out the image, rather than fading in?
    protected flashSpeed:number;
    protected image:HTMLImageElement;
    
    /**
     * Prepares the component before the level starts
     */
    prepare():void 
    {
        super.prepare();
        
        this.opacity = 0;
        this.flashSpeed = 4; //change this to change flash speed
        this.shouldFadeOut = false;
    }
    
    /**
     * Draws the component
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    draw(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void
    {
        super.draw(graphicEngine, canvasContext);
        
        const flashSpeed = this._getFPSConsistentSpeed();
		
        if(this.opacity >= 1)
        {
            this._switchToFadeOut();
        }
        
		
        if(this.opacity > 0)
        {
            this.opacity += (this.shouldFadeOut) ? -flashSpeed : flashSpeed;
            
            if(this.opacity <= 0)
            {
                this._stopFlash();
                return;
            }
            
            const { x, y, width, height } = graphicEngine.getStaticDrawPositionsAndDimensions({
                x: 0,
                y: 0,
                width: graphicEngine.camera.unitsWithinCameraX,
                height: graphicEngine.camera.unitsWithinCameraY
            });
            
            canvasContext.globalAlpha = this.opacity;
            canvasContext.drawImage(this.image, x, y, width, height);
            canvasContext.globalAlpha = 1;
        }
    }
    
    /**
     * Starts the image flash going
     * @param image the image to use as the flash
     */
    start(image:HTMLImageElement):void
    {        
        if(this.opacity === 0)
        {
            this.image = image;
            this.opacity = 0.01; // Just needs to be anything over 0, to tell the component to start
        }
        
        if(this.shouldFadeOut)
        {
            this.shouldFadeOut = false;
        }
    }
	
    /**
     * Generates a speed for the flash that is consistent, regardless of a changing FPS
     * @returns a consistent speed for the flash
     */
	private _getFPSConsistentSpeed():number
	{
		return this.flashSpeed / Kernel.getInstance().fps;
	}
	
    /**
     * Starts the fading out of the image
     */
	private _switchToFadeOut():void
	{
		this.opacity = 1;
        this.shouldFadeOut = true;
	}
	
    /**
     * Stops the image flash
     */
	private _stopFlash():void
	{
		this.opacity = 0;
        this.shouldFadeOut = false;
	}
}