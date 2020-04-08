class GameEn{
    
    constructor()
    {
        this.kernel = Kernel.getInstance();
    }
    
    run()
    {
        this.kernel.level.act();
        
        for (let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            if(this.kernel.loadedModels[i].active)
            {
                this.kernel.loadedModels[i].act();
            }
        }
        
        //needs to be seperate from the for loop above.
        //as both/all models involved in an event need to
        //know it
        for (let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            if(this.kernel.loadedModels[i].active)
            {
                this.kernel.loadedModels[i].checkEvents();
            }
        }
    }
}