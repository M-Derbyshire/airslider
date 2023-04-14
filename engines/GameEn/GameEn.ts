import Kernel from '../../Kernel/Kernel';
import IKernel from '../../Kernel/IKernel';
import IGameEn from './IGameEn';

/**
 * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
 */
export default class GameEn implements IGameEn {
    
    private _kernel:IKernel;
    
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
    run():void
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