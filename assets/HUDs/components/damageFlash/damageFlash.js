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
            (this.flashSpeedDivider / kernel.fps) : 
            -(this.flashSpeedDivider / kernel.fps);
        
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
            
            kernel.graphicEn.infoCtx.globalAlpha = this.opacity;
        
            kernel.graphicEn.infoCtx.drawImage(
                kernel.loadedAssets[this.images[this.color]][1],
                0,
                0,
                kernel.graphicEn.infoCan.width,
                kernel.graphicEn.infoCan.height
            );
            
            kernel.graphicEn.infoCtx.globalAlpha = 1;
        }
    }
    
    load()
    {
        this.images = {
            yellow: kernel.loadImage("/assets/HUDs/components/damageFlash/images/yellow.png"),
            orange: kernel.loadImage("/assets/HUDs/components/damageFlash/images/orange.png"),
            red: kernel.loadImage("/assets/HUDs/components/damageFlash/images/red.png"),
            purple: kernel.loadImage("/assets/HUDs/components/damageFlash/images/purple.png"),
            none: kernel.loadImage("/assets/HUDs/components/damageFlash/images/none.png"),
            fire: kernel.loadImage("/assets/HUDs/components/damageFlash/images/fire.png"),
            tooth: kernel.loadImage("/assets/HUDs/components/damageFlash/images/tooth.png")
        };
    }
    
    start(color)
    {
        if(this.opacity == 0)
        {
            this.color = color;
            this.opacity += this.flashSpeed;
        }
    }
}