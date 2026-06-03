import AssetHandler from './AssetHandler/AssetHandler';
import fonts from '../src/fonts/fonts';
import IKernel from './IKernel';
import ISettings, { SettingsWithDefaults } from '../settings/ISettings';
import IAssetHandler from './AssetHandler/IAssetHandler';
import ILevel from './entities/Level/ILevel';
import { IErrorHandler } from './ErrorHandler/IErrorHandler';
import ErrorHandler from './ErrorHandler/ErrorHandler';
import ILevelQueue from './LevelQueue/ILevelQueue';
import LevelQueue from './LevelQueue/LevelQueue';
import IGameLoopManager from './GameLoopManager/IGameLoopManager';
import GameLoopManager from './GameLoopManager/GameLoopManager';

/**
 * This is a singleton that controls the running of the game, and provides other entities with 
 * access to certain functionality and data.
 */
export default class Kernel implements IKernel
{
    // *********************** Static Methods/Properties **********************************
    private static _instance:Kernel; // The singleton instance of Kernel
    
    /**
     * Gets the singleton instance of the kernel
     * @param canvas The Canvas element that the game should be drawn onto
     * @param settings The game's settings
     * @returns the singleton instance of the kernel
     */
    static getInstance(canvas?:HTMLCanvasElement, settings?:any):IKernel
    {
        if(!Kernel._instance)
            Kernel._instance = new Kernel(canvas, settings);
        
        return Kernel._instance;
    }
    
    /**
     * Triggers the starting of the game
     * @param canvas The Canvas element that the game should be drawn onto
     * @param settings The game's settings
     */
    static init(canvas:HTMLCanvasElement, settings:any)
    {
        const instance = this.getInstance(canvas, settings) as Kernel;
        
        if(instance.level) // If we've already initiated the game
            return;
        
        try {
            instance._load();
        } catch (err:any) {
            instance.handleError(err);
        }
        
        if(!instance._hasError)
            instance._run(); // Runs the first frame. This is then re-called by the browser for every other frame
    }
    // ************************************************************************************
    
    private _settings:SettingsWithDefaults; // The settings for the game
    private _canvasContext:CanvasRenderingContext2D; // The 2D context from the HTML canvas element
    
    private _levelQueue:ILevelQueue; // Manages the queue of levels
    private _gameLoopManager:IGameLoopManager; // Manages the "Game Loop"
    private _assetHandler:IAssetHandler; // Loads and manages assets
    
    private _hasError:boolean; // Has an error been caught and passed to the error handler?
    private _errorHandler:IErrorHandler; // Manages error-handling for the game
    
    private _centralState:Map<string, any>; // A map to store any state that needs to be accessible to all levels.
    
    // If this is true, the current level will get unloaded after the current frame has been drawn
    private _currentLevelShouldBeUnloaded:boolean;
    
    /**
     * Constructor
     * @param canvas The Canvas element that the game should be drawn onto
     * @param settings The game's settings
     * @returns The singleton instance of the kernel
     */
    private constructor(canvas?:HTMLCanvasElement, settings?:ISettings)
    {
        // While we want the canvas/settings parameters to be optional for the constructor/getInstance() methods (so they're 
        // not needed when we're getting the pre-existing kernel instance), they are still a requirement when initially 
        // constructing the singleton instance.
        if(!canvas)
            throw new Error("Cannot initialise the game's Kernel without a canvas element");
        if(!settings)
            throw new Error("Cannot initialise the game's Kernel without a settings object");
        
        this._canvasContext = canvas.getContext("2d")!;
        this._settings = this._getSettingsWithDefaults(settings);
        
        this._hasError = false;
        this._errorHandler = new ErrorHandler(this._canvasContext);
        this._centralState = new Map<string, any>();
        
        this._assetHandler = new AssetHandler(
            (err:any) => this.handleError(err),
            this._settings.assetsDirUrl
        );
        
        this._levelQueue = new LevelQueue(this._assetHandler);
        this._gameLoopManager = new GameLoopManager(
            this._levelQueue,
            this._assetHandler,
            (err:any) => this.handleError(err),
            this._settings.fpsLimit,
            this._settings.fpsDisplayColor
        );
        
        this._currentLevelShouldBeUnloaded = false;
    }
    
    /**
     * A map to store any state that needs to be accessible to all levels.
     */
    get centralState()
    {
        return this._centralState;
    }
    
    /**
     * The current status of the game loop (e.g. is it playing, or in another state)
     */
    get status()
    {
        return this._gameLoopManager.status;
    }
    
    /**
     * The settings for the game
     */
    get settings()
    {
        return this._settings;
    }
    
    /**
     * The current Frames Per Second of the game
     */
    get fps()
    {
        return this._gameLoopManager.fps;
    }
    
    /**
     * The total amount of milliseconds that the level has not been paused or stopped for any reason
     */
    get totalLevelActiveMilliseconds()
    {
        return this._gameLoopManager.totalLevelActiveMilliseconds;
    }
    
    /**
     * The current level that is being ran
     * @returns the currently running level, or undefined
     */
    get level()
    {
        return this._levelQueue.currentLevel!;
    }
    
    /**
     * The models loaded by the current level
     */
    get loadedModels()
    {
        return this._levelQueue.currentModels;
    }
    
    /**
     * Loads and manages assets
     */
    get assetHandler()
    {
        return this._assetHandler;
    }
    
    /**
     * The engine (for the current level) that triggers the actions of levels/models. It 
     * also triggers the checking for in-game events
     */
    get gameEngine()
    {
        return this._levelQueue.currentEngines!.gameEngine;
    }
    
    /**
     * The engine (for the current level) that controls the drawing to the screen
     * @returns the graphic engine, or undefined if there's no loaded levels
     */
    get graphicEngine()
    {
        return this._levelQueue.currentEngines!.graphicEngine;
    }
    
    /**
     * The engine (for the current level) that controls the sound/music of the game
     * @returns the sound engine, or undefined if there's no loaded levels
     */
    get soundEngine()
    {
        return this._levelQueue.currentEngines!.soundEngine;
    }
    
    /**
     * The 2D context from the HTML canvas element
     */
	get canvasContext()
    {
        return this._canvasContext;
    }
    
    /**
     * Loads the given level, and adds it to the level queue
     * @param level the level to load
     */
    loadLevel(level:ILevel):void
    {
        this._levelQueue.loadLevel(
            level,
            this.settings,
            this.canvasContext,
            (err:any) => this.handleError(err)
        );
    }
    
    /**
     * Marks the current level as ready to be unloaded
     */
    unloadCurrentLevel():void
    {
        this._currentLevelShouldBeUnloaded = true;
    }
    
    /**
     * Restarts the current level
     */
    restartCurrentLevel():void
    {
        this._levelQueue.markCurrentLevelAsUnprepared();
    }
    
    /**
     * Handles errors
     * @param error the error to handle (this doesn't have to be an instance of Error)
     */
    handleError(error:any):void
    {
        this._hasError = true;
        this._errorHandler.handleError(error);
    }
    
    /**
     * Pauses/unpauses the game (if the current level is pauseable)
     */
    toggleGamePause():void
    {
        this._gameLoopManager.toggleGamePause();
    }
    
    /**
     * Runs the game loop
     */
    private _run():void
    {
        // Request that the browser re-runs this method for the next frame
        requestAnimationFrame(this._run.bind(this));
        
        if(!this._hasError) 
            this._gameLoopManager.runFrame();
        
        if(this._currentLevelShouldBeUnloaded)
        {
            this._unloadCurrentLevel();
            this._currentLevelShouldBeUnloaded = false;
        }
    }
    
    /**
     * Loads the elements needed for the kernel, and the initial level
     */
    private _load():void
    {
        // Load the fonts from the "fonts" object
        Object.keys(fonts).forEach((key:string) => {
            const fontPath = fonts[key as keyof typeof fonts];
            this._assetHandler.loadFont(key, fontPath);
        });
        
        const initialLevel = this.settings.getInitialLevel(this);
        this.loadLevel(initialLevel);
    }
    
    /**
     * Creates a new settings object (based on the given settings object) that has the default
     * values set for certain properties (assuming those properties were undefined)
     * @param settings the original settings object
     * @returns the new settings object, with default values set on certain properties
     */
    private _getSettingsWithDefaults(settings:ISettings):SettingsWithDefaults
    {
        const newSettings:SettingsWithDefaults = {
            ...settings,
            aspectRatioHorizontal: settings.aspectRatioHorizontal ?? 17,
            aspectRatioVertical: settings.aspectRatioVertical ?? 9,
            unitsWithinCameraX: settings.unitsWithinCameraX ?? 1000,
            unitsWithinCameraY: settings.unitsWithinCameraY ?? 1000,
            fpsLimit: settings.fpsLimit ?? 70,
            isFullscreenEnabled: settings.isFullscreenEnabled !== false // undefined/null or true === true
        };
        
        return newSettings;
    }
    
    /**
     * Unloads the current level, triggering the release of any assets that need releasing, and
     * clears up anything else
     */
    private _unloadCurrentLevel():void
    {
        this._levelQueue.unloadCurrentLevel();
    }
};