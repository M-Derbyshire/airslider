class TheConstruct extends Level
{
    constructor()
    {
        super(Level);
        
        this.shockerCount = 3;
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
        
        return models;
    }
    
    act()
    {
        this.framesPassed++;
        
        //start the shockers after first 5 seconds (run until end of first minute)
        if(this.framesPassed > secondsToFrames(5) && this.framesPassed < minutesToFrames(1))
        {
            if(this.tunnel.length == 0 || this.tunnel[this.tunnel.length - 1].active)
            {
                let newTunnelParts = this.tunnelAlternate("#ff0000", "#000000");
                
                for(let i = 0; i < newTunnelParts.length; i++)
                {
                    this.tunnel.push(newTunnelParts[i]);
                }
            }
        }
        
        if(this.framesPassed == minutesToFrames(1))
        {
            this.tunnel.push(this.tunnelClear());
        }
    }
    
}