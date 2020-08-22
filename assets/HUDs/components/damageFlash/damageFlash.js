class DamageFlash extends HUDComponent
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
        this.flashSpeed = (this.flashSpeed >= 0) ? 
            (this.flashSpeedDivider / this.kernel.fps) : 
            -(this.flashSpeedDivider / this.kernel.fps);
        
        if(this.opacity >= 1)
        {
            this.opacity = 1;
            this.flashSpeed = -this.flashSpeed;
        }
        
        if(this.opacity > 0)
        {
            this.opacity += this.flashSpeed;
            
            if(this.opacity <= 0)
            {
                this.opacity = 0;
                this.flashSpeed = -this.flashSpeed;
            }
            
            this._ctx.globalAlpha = this.opacity;
        
            this._ctx.drawImage(
                this.kernel.loadedAssets[this.images[this.color]].asset,
                this._camera.canvasPositionX,
                this._camera.canvasPositionY,
                this._camera.canvasPositionWidth,
                this._camera.canvasPositionHeight
            );
            
            this._ctx.globalAlpha = 1;
        }
    }
    
    load(canvasCtx, camera)
    {
        super.load(canvasCtx, camera);
        
        this.images = {
            yellow: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/yellow.png"),
            orange: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/orange.png"),
            red: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/red.png"),
            purple: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/purple.png"),
            none: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/none.png"),
            fire: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/fire.png"),
            tooth: this.kernel.loadImage("/assets/HUDs/components/damageFlash/images/tooth.png")
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