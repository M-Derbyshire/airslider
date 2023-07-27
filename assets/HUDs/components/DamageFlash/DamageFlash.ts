import ICamera from '../../../../engines/GraphicEn/ICamera';
import ASHUDComponent from '../ASHUDComponent/ASHUDComponent';

/**
 * Flashes an image on the screen (such as a border, when the player take damage)
 */
export default class DamageFlash extends ASHUDComponent
{
    protected images:IDamageFlashImages;
    protected opacity:number;
    protected flashSpeed:number;
    protected flashSpeedDivider:number;
    protected color:keyof IDamageFlashImages;
    
    /**
     * Constructor
     */
    constructor()
    {
        super();
    }
    
    load(canvasCtx:CanvasRenderingContext2D, camera:ICamera):void
    {
        super.load(canvasCtx, camera);
        
		//The purple option is purposefully the same as the yellow image, as they're both lightning.
        this.images = {
            yellow: this.kernel.loadImage("/assets/HUDs/components/DamageFlash/images/yellow.png"),
            purple: this.kernel.loadImage("/assets/HUDs/components/DamageFlash/images/yellow.png"),
            none: this.kernel.loadImage("/assets/HUDs/components/DamageFlash/images/none.png"),
            fire: this.kernel.loadImage("/assets/HUDs/components/DamageFlash/images/fire.png"),
            ghost: this.kernel.loadImage("/assets/HUDs/components/DamageFlash/images/ghost.png"),
            damage: this.kernel.loadImage("/assets/HUDs/components/LowHealthFlash/images/damage.png")
        };
        
    }
    
    prepare():void 
    {
        super.prepare();
        
        this.color = "none";
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
                this.images[this.color],
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
     * @param color the image to use as the flash
     */
    start(color:keyof IDamageFlashImages):void
    {
        if(this.opacity === 0)
        {
            this.color = color;
            this.opacity += this.flashSpeed;
        }
    }
}

/**
 * The possible images that can be flashed
 */
export interface IDamageFlashImages {
    yellow: HTMLImageElement;
    purple: HTMLImageElement;
    none: HTMLImageElement;
    fire: HTMLImageElement;
    ghost: HTMLImageElement;
    damage: HTMLImageElement;
};