class GameEn{
    run()
    {
        for (let i = 0; i < kernel.loadedModels.length; i++)
        {
            if(kernel.loadedModels[i].active)
            {
                kernel.loadedModels[i].act();
            }
        }
        
        kernel.level.act();
        
        //needs to be seperate from the for loop above.
        //as both/all models involved in an event need to
        //know it
        for (let i = 0; i < kernel.loadedModels.length; i++)
        {
            if(kernel.loadedModels[i].active)
            {
                kernel.loadedModels[i].checkEvents();
            }
        }
    }
}