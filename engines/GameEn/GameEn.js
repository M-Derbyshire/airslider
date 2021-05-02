import Kernel from '../kernel/Kernel';

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
        
        this.kernel.level.checkForEvents();
    }
}