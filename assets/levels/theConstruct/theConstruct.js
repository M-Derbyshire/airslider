class TheConstruct extends Level
{
    constructor()
    {
        super(Level);
        
        this.shockerCounts = 5;
        this.shockerIndexes = {
            from: 0,
            to: 0
        };
        
    }
    
    getModels()
    {
        let models = [];
        
        models.push(new Tarian()); //add main character (has to be 0)
        
        //shockers
        this.shockerIndexes.from = models.length;
        for(let i = 0; i < this.shockerCounts; i++)
        {
            models.push(new Shocker());
        }
        this.shockerIndexes.to = this.shockerIndexes.from + this.shockerCounts - 1;
        
        return models;
    }
    
    act()
    {
        this.framesPassed++;
        
        //start the shockers after first 5 seconds (run until end of first minute)
        if(this.framesPassed > secondsToFrames(5) && this.framesPassed < minutesToFrames(1))
        {
            this.sendShockers();
        }
    }
    
}