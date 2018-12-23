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
        
        //shockers
        this.shockerIndexes.from = models.length;
        for(let i = 0; i < this.shockerCount; i++)
        {
            models.push(new Shocker("yellow", "sweep"));
        }
        this.shockerIndexes.to = models.length - 1;
        
        return models;
    }
    
    act()
    {
        this.framesPassed++;
        
        //start the shockers after first 5 seconds (run until end of first minute)
        if(this.framesPassed > secondsToFrames(5) && this.framesPassed < minutesToFrames(1))
        {
            this.sendShockers(this.shockerIndexes.from, this.shockerIndexes.to);
        }
    }
    
}