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
                this.images[this.color],
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
            yellow: new Image(),
            orange: new Image(),
            red: new Image(),
        };
        
        kernel.assetsLoading += 3;
        
        this.images.yellow.onload = this.imagesCallback;
        this.images.orange.onload = this.imagesCallback;
        this.images.red.onload = this.imagesCallback;
        
        this.images.yellow.src = kernel.rootPath + "/assets/HUDs/components/damageFlash/images/yellow.png";
        this.images.orange.src = kernel.rootPath + "/assets/HUDs/components/damageFlash/images/orange.png";
        this.images.red.src = kernel.rootPath + "/assets/HUDs/components/damageFlash/images/red.png";
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