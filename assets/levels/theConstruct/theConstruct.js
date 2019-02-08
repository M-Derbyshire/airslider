class TheConstruct extends Level
{
    constructor()
    {
        super(Level);
        
        this.shockerCount = 7;
        this.shockerIndexes = {
            from: 0,
            to: 0
        };
    }
    
    getModels()
    {
        let models = [];
        
        models.push(new Tarian()); //add main character (has to be 0)
        controlConstructor.keyboardControls(0);
        controlConstructor.touchControls(0);
        this.HUD.modelIndexes.push(0);
        
        this.shockerIndexes.from = 1;
        for(let i = 0; i < this.shockerCount; i++)
        {
            models.push(new Shocker("yellow", "sweep", 2000));
        }
        this.shockerIndexes.to = models.length - 1;
        
        return models;
    }
    
    load()
    {
        this.setGround(
            kernel.rootPath + "/assets/levels/theConstruct/images/ground.png",
            yUnit(50)
        );
        
        this.background = kernel.loadImage(kernel.rootPath + "/assets/levels/theConstruct/images/testBackground.png");
        kernel.graphicEn.setStaticBackground(this.background);
        
        this.outsideLightMask = kernel.loadImage(kernel.rootPath + "/assets/levels/theConstruct/images/testBackgroundMask.png");
        this.outsideLightBrightness = 0;
        
        kernel.graphicEn.setLightMask(this.tunnelLightMask);
        kernel.graphicEn.setLightLuminosity(this.tunnelLightBrightness);
    }
    
    act()
    {
        this.framesPassed++;
        
        //if outside/inside changes, change light mask
        this.checkLightMask();
        
        //start in the tunnel
        if(this.framesPassed == 1)
        {
            let tunnelParts = [this.newTunnelPart("#ff0000", 100)];
            tunnelParts.push(this.newTunnelPart("#333333", 5));
            tunnelParts.push(this.newTunnelPart("#000000", 15));
            tunnelParts.push(this.newTunnelPart("#333333", 5));
            this.createStartingTunnel(tunnelParts);
        }
        
        //start the shockers after first 5 seconds (run until end of first minute)
        if(this.framesPassed < secondsToFrames(15))
        {
            this.sendShockers(this.shockerIndexes.from, this.shockerIndexes.to);
            
            if(this.tunnel.length == 0 || this.tunnel[this.tunnel.length - 1].active)
            {
                // let newTunnelParts = [this.newTunnelPart("#ff0000", 100)];
                // newTunnelParts.push(this.newTunnelPart("#333333", 5));
                // newTunnelParts.push(this.newTunnelPart("#000000", 15));
                // newTunnelParts.push(this.newTunnelPart("#333333", 5));
                
                let newTunnelParts = [
                    this.newTunnelPart("#ff0000", 100),
                    this.newTunnelPart("#333333", 5),
                    this.newTunnelPart("#000000", 15),
                    this.newTunnelPart("#333333", 5),
                    this.newTunnelPart("clear", 100),
                    this.newTunnelPart("#333333", 5),
                    this.newTunnelPart("#000000", 15),
                    this.newTunnelPart("#333333", 5)
                ];
                
                for(let i = 0; i < newTunnelParts.length; i++)
                {
                    this.tunnel.push(newTunnelParts[i]);
                }
            }
        }
        
        if(this.framesPassed == secondsToFrames(15))
        {
            this.outsideVisible = true;
            this.tunnel.push(this.newTunnelPart("clear"));
        }
    }
}