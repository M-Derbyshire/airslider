import ILevel from '../../entities/Level/ILevel';
import IModel from '../../entities/Model/IModel';
import IGameEngine from './IGameEngine';

/**
 * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
 */
export default class GameEngine implements IGameEngine {
    private _level:ILevel;
    private _loadedModels:IModel[];
    
    /**
     * Constructor
     * @param level the level that is currently running
     * @param loadedModels the models created/used by the current level
     */
    constructor(level:ILevel, loadedModels:IModel[])
    {
        this._level = level;
        this._loadedModels = loadedModels;
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
        this._level.act();
    }
    
    /**
     * Runs the actions of all the level's models
     */
    private _runModelActions():void
    {
        this._loadedModels.forEach(model => {
            if(model.active)
                model.act();
        });
    }
    
    /**
     * Triggers the level's event checks
     */
    private _runEventChecks():void
    {
        this._level.checkForEvents();
    }
}