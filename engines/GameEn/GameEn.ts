import Kernel from '../../Kernel/Kernel';
import IKernel from '../../Kernel/IKernel';
import IGameEn from './IGameEn';

/**
 * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
 */
export default class GameEn implements IGameEn {
    private _kernel:IKernel;
    
    constructor()
    {
        this._kernel = Kernel.getInstance();
    }
    
    /**
     * Triggers the actions of levels/models, and then triggers the event checking/handling
     */
    run():void
    {
        this._runLevelActions();
        this._runModelActions();
        this._runEventChecks();
    }
    
    /**
     * Runs the level's actions
     */
    private _runLevelActions():void
    {
        this._kernel.level.act();
    }
    
    /**
     * Runs the actions of all the level's models
     */
    private _runModelActions():void
    {
        this._kernel.loadedModels.forEach(model => {
            if(model.active)
                model.act();
        });
    }
    
    /**
     * Triggers the level's event checks
     */
    private _runEventChecks():void
    {
        this._kernel.level.checkForEvents();
    }
}