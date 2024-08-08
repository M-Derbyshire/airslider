import Kernel from '../../Kernel/Kernel';
import IGameEngine from './IGameEngine';

/**
 * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
 */
export default class GameEngine implements IGameEngine {    
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
        Kernel.getInstance().level.act();
    }
    
    /**
     * Runs the actions of all the level's models
     */
    private _runModelActions():void
    {
        Kernel.getInstance().loadedModels.forEach(model => {
            if(model.active)
                model.act();
        });
    }
    
    /**
     * Triggers the level's event checks
     */
    private _runEventChecks():void
    {
        Kernel.getInstance().level.checkForEvents();
    }
}