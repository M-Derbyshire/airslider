import { SettingsWithDefaults } from "../../settings/ISettings";
import IAssetHandler from "../AssetHandler/IAssetHandler";
import GameEngine from "../engines/GameEngine/GameEngine";
import Camera from "../engines/GraphicEngine/Camera";
import GraphicEngine from "../engines/GraphicEngine/GraphicEngine";
import ICamera from "../engines/GraphicEngine/ICamera";
import SoundEngine from "../engines/SoundEngine/SoundEngine";
import ILevel from "../entities/Level/ILevel";
import IModel from "../entities/Model/IModel";
import ILevelQueue, { ILevelEngines, ILoadedLevel } from "./ILevelQueue";

/**
 * Manages the current level, and the levels that are queued up to be ran
 */
export default class LevelQueue implements ILevelQueue
{
    private _queue:ILoadedLevel[];
    private _assetHandler:IAssetHandler;
    
    /**
     * Constructor
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    constructor(assetHandler:IAssetHandler)
    {
        this._queue = [];
        this._assetHandler = assetHandler;
    }
    
    /**
     * The level that is currently being ran. If there are no levels in the queue, this
     * will be undefined
     */
    get currentLevel():ILevel {
         return this._queue[0]?.level;
    }
    
    /**
     * The models used by the current level. If there are no levels in the queue, this
     * will be an empty array
     */
    get currentModels():IModel[] {
        return this._queue[0]?.models ?? [];
    }
    
    /**
     * The engines that are running the current level. If there are no levels in the
     * queue, this will be undefined
     */
    get currentEngines():ILevelEngines {
        return this._queue[0]?.engines;
    }
    
    /**
     * Has the current level been prepared? If there are no levels in the queue, this
     * will be false
     */
    get currentLevelHasBeenPrepared():boolean {
        return this._queue[0]?.hasBeenPrepared ?? false;
    }
    
    /**
     * Loads the given level, and adds it to the level queue
     * @param level the level to load
     * @param settings the game's settings
     * @param canvasContext the 2D context from the HTML canvas element
     * @param onError a callback that will need to be called if there is any error during gameplay
     */
    loadLevel(level:ILevel, settings:SettingsWithDefaults, canvasContext:CanvasRenderingContext2D, onError:(err:any)=>void):void
    {
        level.load(this._assetHandler);
        
        const models = level.getModels();
        
        const {
            aspectRatioHorizontal,
            aspectRatioVertical,
            unitsWithinCameraX,
            unitsWithinCameraY
        } = settings;
        
        const camera = new Camera(
            canvasContext.canvas,
            aspectRatioHorizontal,
            aspectRatioVertical,
            unitsWithinCameraX,
            unitsWithinCameraY
        );
        
        const engines = this._initialiseNewEngines(
            level,
            models,
            camera,
            canvasContext,
            onError
        );
        
        level.registerSounds(engines.soundEngine);
        
        models.forEach((model) => {
            model.load(this._assetHandler);
            
            model.registerAnimations(); // Doing this here so the models have their width/height available before the level is prepared
            model.registerSounds(engines.soundEngine);
        });
        
        this._queue.push({ 
            level, 
            hasBeenPrepared: false, 
            models, 
            engines 
        });
    }
    
    /**
     * Unloads the current level, and removes it from the queue
     */
    unloadCurrentLevel():void
    {
        if(!this._queue.length)
            return;
        
        this._queue[0].engines.soundEngine.reset();
        
        this.currentModels.forEach(model => model.unload(this._assetHandler));
        this.currentLevel.unload(this._assetHandler);
        
        this._queue.shift();
    }
    
    /**
     * Marks the current level as being unprepared
     */
    markCurrentLevelAsUnprepared():void
    {
        if(!this._queue.length)
            return;
        
        this._queue[0].hasBeenPrepared = false;
    }
    
    /**
     * Triggers the preparation of the current level, and its models
     */
    prepareCurrentLevelAndModels():void
    {
        if(!this._queue.length)
            return;
        
        this.currentEngines.soundEngine.reset();
        
        this.currentLevel.prepare();
        this.currentModels.forEach(model => model.prepare());
        
        this._queue[0].hasBeenPrepared = true;
    }
    
    /**
     * Returns new instances of all engines
     * @param level the level
     * @param models the models created/used by the level
     * @param camera The level's camera
     * @param canvasContext the 2D context from the HTML canvas element
     * @param onError a callback that will need to be called if there is any error during gameplay
     * @returns The new instances of all engines
     */
    private _initialiseNewEngines(
        level:ILevel,
        models:IModel[],
        camera:ICamera,
        canvasContext:CanvasRenderingContext2D,
        onError:(err:any)=>void
    ):ILevelEngines
    {
        const gameEngine = new GameEngine(level, models);
        const graphicEngine = new GraphicEngine(camera, level.frameManager, canvasContext);
        const soundEngine = new SoundEngine(onError);
        
        return { gameEngine, graphicEngine, soundEngine };
    }
};