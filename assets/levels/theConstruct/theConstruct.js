class TheConstruct extends Level
{
    constructor()
    {
        super(Level);
        
        this.shockerCount = 5;
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
        
        for(let i = 0; i < this.shockerCount; i++)
        {
            models.push(new Shocker("yellow", "home", 200));
        }
        
        return models;
    }
    
    act()
    {
        this.framesPassed++;
        
        //start in the tunnel
        if(this.framesPassed == 1)
        {
            this.startingTunnel(this.tunnelAlternate, "#ff0000", 100, "#000000", 10);
        }
        
        //start the shockers after first 5 seconds (run until end of first minute)
        if(this.framesPassed < secondsToFrames(30))
        {
            this.sendShockers(1, 5);
            
            if(this.tunnel.length == 0 || this.tunnel[this.tunnel.length - 1].active)
            {
                let newTunnelParts = this.tunnelAlternate("#ff0000", 100, "#000000", 10);
                
                for(let i = 0; i < newTunnelParts.length; i++)
                {
                    this.tunnel.push(newTunnelParts[i]);
                }
            }
        }
        
        if(this.framesPassed == secondsToFrames(30))
        {
            this.tunnel.push(this.tunnelClear());
        }
    }
}