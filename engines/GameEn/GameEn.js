import Kernel from '/Kernel/kernel';

/**
 * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
 */
export default class GameEn{
    
    /**
     * Constructor
     */
    constructor()
    {
        this._kernel = Kernel.getInstance();
    }
    
    /**
     * Triggers the actions of levels/models, and then triggers the event checking/handling
     */
    run()
    {
        this._kernel.level.act();
        
        for (let i = 0; i < this._kernel.loadedModels.length; i++)
        {
            if(this._kernel.loadedModels[i].active)
            {
                this._kernel.loadedModels[i].act();
            }
        }
        
        this._kernel.level.checkForEvents();
    }
}