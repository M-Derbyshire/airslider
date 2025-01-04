import ILevel from "./entities/Level/ILevel";
import IModel from "./entities/Model/IModel";
import IGameEngine from "./engines/GameEngine/IGameEngine";
import IGraphicEngine from "./engines/GraphicEngine/IGraphicEngine";
import ISoundEngine from "./engines/SoundEngine/ISoundEngine";
import ISettings from "../settings/ISettings";
import IAssetHandler from "./AssetHandler/IAssetHandler";

/**
 * This will be a singleton that controls the entire game, and provides other entities with 
 * access to certain functionality and data.
 */
export default interface IKernel {
    /**
     * If we want to display the FPS counter, this is the color the text should be.
     * The FPS counter is only drawn if this value is truthy.
     */
    fpsDisplayColor:string;
    
    /**
     * The amount of draw-space units there are within the camera's size.
     * There are seperate amounts for both the X and Y axis.
     */
    unitsWithinCameraX:number;
    unitsWithinCameraY:number;
    
    /**
     * A map to store any state that needs to be accessible to all levels.
     */
    readonly centralState:Map<string, any>;
    
    /**
     * The current status of the game (e.g. is it playing, or in another state)
     */
    readonly status:KernelStatus;
    
    /**
     * The settings for the game
     */
    readonly settings:ISettings;
    
    /**
     * The current Frames Per Second of the game
     */
    readonly fps:number;
    
    /**
     * The maximum FPS that the game should be allowed to run at
     */
    readonly fpsLimit:number;
    
    /**
     * The total amount of milliseconds that the level has not been paused or stopped for any reason
     */
    readonly totalLevelActiveMilliseconds:number;
    
    /**
     * The amount of milliseconds that passed between the last frame, and this one
     */
    readonly timeSinceLastFrameMS:number;
    
    /**
     * The current level that is being ran
     */
    readonly level?:ILevel;
    
    /**
     * The models loaded by the current level
     */
    readonly loadedModels:IModel[];
    
    /**
     * Has the current level been prepared? (using the Level.prepare method)
     */
    readonly levelHasBeenPrepared:boolean;
    
    /**
     * Loads and manages assets
     */
    readonly assetHandler:IAssetHandler
    
    /**
     * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
     */
    readonly gameEngine?:IGameEngine;
    
    /**
     * The engine that controls the drawing to the screen
     */
    readonly graphicEngine?:IGraphicEngine;
    
    /**
     * The engine that controls the sound/music of the game
     */
    readonly soundEngine?:ISoundEngine;
    
    /**
     * The HTML canvas element that the game should be drawn on
     */
    readonly gameCanvas:HTMLCanvasElement;
    
    /**
     * The 2D context from the HTML canvas element
     */
    readonly gameContext:CanvasRenderingContext2D;
    
    /**
     * Loads the given level, and adds it to the kernel's internal level queue
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



/**
 * Represents the possible statuses of the game's Kernel
 */
export enum KernelStatus {
    /**
     * The game is playing
     */
    Active,
    
    /**
     * The game is about to pause.
     * If the game is paused, it may need to draw things to the screen to 
     * tell the player (such as changing the "pause" button to a "play" 
     * button). This status allows that to happen.
     */
    PrePaused,
    
    /**
     * The game is paused
     */
    Paused
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
     * Has this level been prepared? (using the Level.prepare method)
     */
    hasBeenPrepared:boolean;
    
    /**
     * The models loaded by the level
     */
    loadedModels:IModel[];
    
    /**
     * The engines that will run this level
     */
    engines:ILevelEngines;
};



/**
 * The engines that will be used to run a level
 */
export interface ILevelEngines {
    /**
     * The game engine
     */
    gameEngine:IGameEngine;
    
    /**
     * The graphic engine
     */
    graphicEngine:IGraphicEngine;
    
    /**
     * The sound engine
     */
    soundEngine:ISoundEngine;
};