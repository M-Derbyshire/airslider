class DamageFlash extends HUDComponent
{
    constructor()
    {
        super(HUDComponent);
        
        this.images;
        this.opacity = 0;
        this.flashSpeed = 6 / kernel.fps;
        this.color;
    }
    
    draw()
    {
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
            yellow: kernel.loadImage(kernel.rootPath + "/assets/HUDs/components/damageFlash/images/yellow.png"),
            orange: kernel.loadImage(kernel.rootPath + "/assets/HUDs/components/damageFlash/images/orange.png"),
            red: kernel.loadImage(kernel.rootPath + "/assets/HUDs/components/damageFlash/images/red.png"),
        };
    }
    
    imagesCallback()
    {
        kernel.assetsLoading--;
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