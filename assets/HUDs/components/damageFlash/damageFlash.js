import Kernel from '/kernel/kernel';
import HUDComponent from '/assets/HUDs/components/HUDComponent/HUDComponent';

export default class DamageFlash extends HUDComponent
{
    constructor()
    {
        super(HUDComponent);
        
        this.images;
        this.opacity = 0;
        this.flashSpeed = 0.1; //this will be changed when drawing it to match fps
        this.flashSpeedDivider = 4; //change this to change flash speed
        this.color;
    }
    
    draw()
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
            
            this._ctx.globalAlpha = this.opacity;
        
            this._ctx.drawImage(
                this.images[this.color],
                this._camera.canvasPositionX,
                this._camera.canvasPositionY,
                this._camera.canvasPositionWidth,
                this._camera.canvasPositionHeight
            );
            
            this._ctx.globalAlpha = 1;
        }
    }
	
	_getFPSConsistentSpeed(lastFrameSpeed)
	{
		const newSpeed = (this.flashSpeedDivider / this.kernel.fps);
		return (lastFrameSpeed >= 0) ? newSpeed : -newSpeed;
	}
	
	_switchToFadeOut()
	{
		this.opacity = 1;
        this.flashSpeed = -this.flashSpeed;
	}
	
	_stopFlash()
	{
		this.opacity = 0;
        this.flashSpeed = -this.flashSpeed;
	}
	
	
    
    load(canvasCtx, camera)
    {
        super.load(canvasCtx, camera);
        
		//The purple option is purposefully the same as the yellow image, as they're both lightning.
        this.images = {
            yellow: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/yellow.png"),
            purple: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/yellow.png"),
            none: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/none.png"),
            fire: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/fire.png"),
            ghost: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/ghost.png")
        };
    }
    
    //This is called by the player's model, and starts the flash going
    start(color)
    {
        if(this.opacity === 0)
        {
            this.color = color;
            this.opacity += this.flashSpeed;
        }
    }
}