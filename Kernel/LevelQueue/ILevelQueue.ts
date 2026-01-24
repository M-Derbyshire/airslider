import ISettings from "../../settings/ISettings";
import ILevel from "../entities/Level/ILevel";
import IModel from "../entities/Model/IModel";
import { ILevelEngines } from "../IKernel";

/**
 * Manages the current level, and the levels that are queued up to be ran
 */
export default interface ILevelQueue
{
    /**
     * The level that is currently being ran. If there are no levels in the queue, this
     * will be undefined
     */
    readonly currentLevel?:ILevel;
    
    /**
     * The models used by the current level. If there are no levels in the queue, this
     * will be an empty array
     */
    readonly currentModels?:IModel[];
    
    /**
     * The engines that are running the current level. If there are no levels in the
     * queue, this will be undefined
     */
    readonly currentEngines?:ILevelEngines;
    
    /**
     * Has the current level been prepared? If there are no levels in the queue, this
     * will be false
     */
    readonly currentLevelHasBeenPrepared:boolean;
    
    /**
     * Loads the given level, and adds it to the level queue
     * @param level the level to load
     * @param settings the game's settings
     * @param canvasContext the 2D context from the HTML canvas element
     * @param onError a callback that will need to be called if there is any error during gameplay
     */
    loadLevel(level:ILevel, settings:ISettings, canvasContext:CanvasRenderingContext2D, onError:(err:any)=>void):void;
    
    /**
     * Unloads the current level, and removes it from the queue
     */
    unloadCurrentLevel():void;
    
    /**
     * Marks the current level as being unprepared
     */
    markCurrentLevelAsUnprepared():void;
    
    /**
     * Triggers the preparation of the current level, and its models
     */
    prepareCurrentLevelAndModels():void;
};

/**
 * A level that has been loaded, along with the other elements it requires
 */
export interface ILoadedLevel {
    /**
     * The loaded level
     */
    level:ILevel;
    
    /**
     * Has this level been prepared?
     */
    hasBeenPrepared:boolean;
    
    /**
     * The models used by the level
     */
    models:IModel[];
    
    /**
     * The engines that will run this level
     */
    engines:ILevelEngines;
};