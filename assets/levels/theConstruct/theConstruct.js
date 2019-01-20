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
        
        this.background = kernel.loadImage(kernel.rootPath + "/assets/levels/theConstruct/images/background.png");
    }
    
    act()
    {
        this.framesPassed++;
        
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
        if(this.framesPassed < secondsToFrames(30))
        {
            this.sendShockers(this.shockerIndexes.from, this.shockerIndexes.to);
            
            if(this.tunnel.length == 0 || this.tunnel[this.tunnel.length - 1].active)
            {
                let newTunnelParts = [this.newTunnelPart("#ff0000", 100)];
                newTunnelParts.push(this.newTunnelPart("#333333", 5));
                newTunnelParts.push(this.newTunnelPart("#000000", 15));
                newTunnelParts.push(this.newTunnelPart("#333333", 5));
                
                for(let i = 0; i < newTunnelParts.length; i++)
                {
                    this.tunnel.push(newTunnelParts[i]);
                }
            }
        }
        
        if(this.framesPassed == secondsToFrames(30))
        {
            this.outsideVisible = true;
            this.tunnel.push(this.newTunnelPart("clear"));
        }
    }
}