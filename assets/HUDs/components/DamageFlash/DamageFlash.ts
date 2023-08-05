import ASHUDComponent from '../ASHUDComponent/ASHUDComponent';

/**
 * Flashes an image on the screen (such as a border, when the player take damage)
 */
export default class DamageFlash extends ASHUDComponent
{
    protected opacity:number;
    protected flashSpeed:number;
    protected flashSpeedDivider:number;
    protected image:HTMLImageElement;
    
    /**
     * Constructor
     */
    constructor()
    {
        super();
    }
    
    prepare():void 
    {
        super.prepare();
        
        this.opacity = 0;
        this.flashSpeed = 0.1; //this will be changed when drawing it to match fps
        this.flashSpeedDivider = 4; //change this to change flash speed
    }
    
    draw():void
    {
        this.flashSpeed = this._getFPSConsistentSpeed(this.flashSpeed);
        
		
        if(this.opacity >= 1)
        {
            this._switchToFadeOut();
        }
        
		
        if(this.opacity > 0)
        {
            this.opacity += this.flashSpeed;
            
            if(this.opacity <= 0)
            {
                this._stopFlash();
            }
            
            this.ctx.globalAlpha = this.opacity;
        
            this.ctx.drawImage(
                this.image,
                this.camera.canvasPositionX,
                this.camera.canvasPositionY,
                this.camera.canvasPositionWidth,
                this.camera.canvasPositionHeight
            );
            
            this.ctx.globalAlpha = 1;
        }
    }
	
    /**
     * Generates a speed for the flash that is consistent, regardless of a changing FPS
     * @param lastFrameSpeed the speed used on the last frame
     * @returns a consistent speed for the flash
     */
	private _getFPSConsistentSpeed(lastFrameSpeed:number):number
	{
		const newSpeed = (this.flashSpeedDivider / this.kernel.fps);
		return (lastFrameSpeed >= 0) ? newSpeed : -newSpeed;
	}
	
    /**
     * Starts the fading out of the image
     */
	private _switchToFadeOut():void
	{
		this.opacity = 1;
        this.flashSpeed = -this.flashSpeed;
	}
	
    /**
     * Stops the image flash, and flips its speed
     */
	private _stopFlash():void
	{
		this.opacity = 0;
        this.flashSpeed = -this.flashSpeed;
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
            this.opacity += this.flashSpeed;
        }
    }
}