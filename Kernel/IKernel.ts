import ILevel from "./entities/Level/ILevel";
import IModel from "./entities/Model/IModel";
import IGameEngine from "./engines/GameEngine/IGameEngine";
import IGraphicEngine from "./engines/GraphicEngine/IGraphicEngine";
import ISoundEngine from "./engines/SoundEngine/ISoundEngine";
import { SettingsWithDefaults } from "./settings/ISettings";
import IAssetHandler from "./AssetHandler/IAssetHandler";
import { GameLoopStatus } from "./GameLoopManager/IGameLoopManager";

/**
 * This is a singleton that controls the running of the game, and provides other entities with 
 * access to certain functionality and data.
 */
export default interface IKernel {
    /**
     * A map to store any state that needs to be accessible to all levels.
     */
    readonly centralState:Map<string, any>;
    
    /**
     * The current status of the game (e.g. is it playing, or in another state)
     */
    readonly status:GameLoopStatus;
    
    /**
     * The settings for the game
     */
    readonly settings:SettingsWithDefaults;
    
    /**
     * The current Frames Per Second of the game
     */
    readonly fps:number;
    
    /**
     * The total amount of milliseconds that the level has not been paused or stopped for any reason
     */
    readonly totalLevelActiveMilliseconds:number;
    
    /**
     * The current level that is being ran
     */
    readonly level:ILevel;
    
    /**
     * The models loaded by the current level
     */
    readonly loadedModels:IModel[];
    
    /**
     * Loads and manages assets
     */
    readonly assetHandler:IAssetHandler
    
    /**
     * The engine (for the current level) that triggers the actions of levels/models. It 
     * also triggers the checking for in-game events
     */
    readonly gameEngine:Omit<IGameEngine, "run">;
    
    /**
     * The engine (for the current level) that controls the drawing to the screen
     */
    readonly graphicEngine:Omit<IGraphicEngine, "run">;
    
    /**
     * The engine (for the current level) that controls the sound/music of the game
     */
    readonly soundEngine:Omit<ISoundEngine, "run">;
    
    /**
     * The 2D context from the HTML canvas element
     */
    readonly canvasContext:CanvasRenderingContext2D;
    
    /**
     * Loads the given level, and adds it to the level queue
     * @param level the level to load
     */
    loadLevel(level:ILevel):void;
    
    /**
     * Marks the current level as ready to be unloaded
     */
    unloadCurrentLevel():void;
    
    /**
     * Restarts the current level
     */
    restartCurrentLevel():void;
    
    /**
     * Pauses/unpauses the game (if the current level is pauseable)
     */
    toggleGamePause():void;
    
    /**
     * Handles errors
     * @param error the error to handle (this doesn't have to be an instance of Error)
     */
    handleError(error:any):void
};