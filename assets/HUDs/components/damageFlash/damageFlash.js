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
            
            this.kernel.graphicEn.infoCtx.globalAlpha = this.opacity;
        
            this.kernel.graphicEn.infoCtx.drawImage(
                this.kernel.loadedAssets[this.images[this.color]][1],
                0,
                0,
                this.kernel.graphicEn.infoCan.width,
                this.kernel.graphicEn.infoCan.height
            );
            
            this.kernel.graphicEn.infoCtx.globalAlpha = 1;
        }
    }
    
    load()
    {
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
        if(this.opacity == 0)
        {
            this.color = color;
            this.opacity += this.flashSpeed;
        }
    }
}