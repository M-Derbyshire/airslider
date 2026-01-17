import AssetHandler from './AssetHandler/AssetHandler';
import GameEngine from './engines/GameEngine/GameEngine';
import GraphicEngine from './engines/GraphicEngine/GraphicEngine';
import SoundEngine from './engines/SoundEngine/SoundEngine';
import Camera from './engines/GraphicEngine/Camera';
import fonts from '../src/fonts/fonts';
import IKernel, { KernelStatus, ILoadedLevel, ILevelEngines } from './IKernel';
import ISettings from '../settings/ISettings';
import IAssetHandler from './AssetHandler/IAssetHandler';
import ILevel from './entities/Level/ILevel';
import IModel from './entities/Model/IModel';
import ICamera from './engines/GraphicEngine/ICamera';
import { IErrorHandler } from './ErrorHandler/IErrorHandler';
import ErrorHandler from './ErrorHandler/ErrorHandler';

/**
 * This is a singleton that controls the running of the game, and provides other entities with 
 * access to certain functionality and data.
 */
export default class Kernel implements IKernel {

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
        // The Kernel constructor will return the singleton instance
        // if it has already been created, and if not then it will create it.
        return new Kernel(canvas, settings);
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
    
    
    private _settings:ISettings; // The settings for the game
    private _canvasContext:CanvasRenderingContext2D; // The 2D context from the HTML canvas element
    
    private _fps:number; // The current Frames Per Second of the game
    private _highestFpsReached:number; // The highest FPS the game has reached
    private _lastTime:Date; // The date/time that the last frame ran
    
    private _levelQueue:ILoadedLevel[]; // The queue of levels that have been loaded (or are currently loading)
    private _totalLevelActiveMilliseconds:number; // The total amount of milliseconds that the level has not been paused or stopped for any reason
    private _status:KernelStatus; // The current status of the game (e.g. is it playing, paused, or in another state)
    private _soundKeysPlayingBeforeLastPause:string[]; // The sounds that were playing when the game was last paused
    
    private _hasError:boolean; // Has an error been caught and passed to the error handler?
    private _errorHandler:IErrorHandler; // Manages error-handling for the game
    
    private _centralState:Map<string, any>; // A map to store any state that needs to be accessible to all levels.
    
    private _assetHandler:IAssetHandler; // Loads and manages assets
    
    private _currentLevelShouldBeUnloaded:boolean; // If this is true, the current level will get unloaded after the current frame has been drawn
    
    
    
    
    /**
     * Constructor
     * @param canvas The Canvas element that the game should be drawn onto
     * @param settings The game's settings
     * @returns The singleton instance of the kernel
     */
    private constructor(canvas?:HTMLCanvasElement, settings?:ISettings)
    {
        if(Kernel._instance)
        {
            return Kernel._instance;
        }
        Kernel._instance = this;
        
        // While we want the canvas/settings parameters to be optional for the constructor/getInstance() methods (so they're 
        // not needed when we're getting the pre-existing kernel instance), they are still a requirement when initially 
        // constructing the singleton instance.
        if(!canvas)
            throw new Error("Cannot initialise the game's Kernel without a canvas element");
        if(!settings)
            throw new Error("Cannot initialise the game's Kernel without a settings object");
        
        this._canvasContext = canvas.getContext("2d");
        this._settings = settings;
        
        this._fps = 60;
        this._highestFpsReached = 0;
        this._lastTime = new Date();
        
        this._levelQueue = [];
        
        this._hasError = false;
        this._errorHandler = new ErrorHandler(this._canvasContext);
        this._centralState = new Map<string, any>();
        
        this._assetHandler = new AssetHandler(
            (err:any) => this.handleError(err),
            this._settings.assetsDirUrl
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
     * The current status of the game (e.g. is it playing, or in another state)
     */
    get status()
    {
        return this._status;
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
        return this._fps;
    }
    
    /**
     * The total amount of milliseconds that the level has not been paused or stopped for any reason
     */
    get totalLevelActiveMilliseconds()
    {
        return this._totalLevelActiveMilliseconds;
    }
    
    /**
     * The current level that is being ran
     * @returns the currently running level, or undefined
     */
    get level()
    {
        return this._levelQueue[0]?.level;
    }
    
    /**
     * The models loaded by the current level
     */
    get loadedModels()
    {
        return (this._levelQueue.length > 0) ? this._levelQueue[0].loadedModels : [];
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
        return this._levelQueue[0]?.engines.gameEngine;
    }
    
    /**
     * The engine (for the current level) that controls the drawing to the screen
     * @returns the graphic engine, or undefined if there's no loaded levels
     */
    get graphicEngine()
    {
        return this._levelQueue[0]?.engines.graphicEngine;
    }
    
    /**
     * The engine (for the current level) that controls the sound/music of the game
     * @returns the sound engine, or undefined if there's no loaded levels
     */
    get soundEngine()
    {
        return this._levelQueue[0]?.engines.soundEngine;
    }
    
    /**
     * The 2D context from the HTML canvas element
     */
	get canvasContext()
    {
        return this._canvasContext;
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
        this._prepareKernelForLevelStart();
        this._levelQueue[0].hasBeenPrepared = false;
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
        if(this.level.isPauseable)
        {
            if(this._status === KernelStatus.Active)
            {
                this._soundKeysPlayingBeforeLastPause = this.soundEngine.getPlayingSoundKeys();
                this._soundKeysPlayingBeforeLastPause.forEach(key => this.soundEngine.pauseSound(key));
                
                this._status = KernelStatus.PrePaused;
            }
            else
            {
                this._soundKeysPlayingBeforeLastPause.forEach(key => this.soundEngine.playSound(key));
                this._status = KernelStatus.Active;
            }
        }
    }
    
    /**
     * Loads the given level, and adds it to the kernel's internal level queue
     * @param level the level to load
     */
    loadLevel(level:ILevel):void
    {
        level.load(this._assetHandler);
        
        const loadedModels = level.getModels();
        
		const {
            aspectRatioHorizontal,
            aspectRatioVertical,
            unitsWithinCameraX,
            unitsWithinCameraY
        } = this.settings;
        
		const camera = new Camera(
            this._canvasContext.canvas,
            aspectRatioHorizontal,
            aspectRatioVertical,
            unitsWithinCameraX,
            unitsWithinCameraY
        );
        
        const engines = this._initialiseAllEngines(level, loadedModels, camera); // New engines, set up for this level
        
        loadedModels.forEach((model, idx) => {
            model.loadedIndex = idx;
            model.load(this._assetHandler);
            
            // Doing this here ensures the models have their width/height available before the level is prepared
            model.registerAnimations();
        });
        
        this._levelQueue.push({ 
            level, 
            hasBeenPrepared: false, 
            loadedModels, 
            engines 
        });
    }
    
    
    
    
    /**
     * Runs the game loop
     */
    private _run():void
    {
        // Request that the browser re-runs this method for the next frame
        requestAnimationFrame(this._run.bind(this));
        
        // Don't run if there was an error
        if(this._hasError) 
            return;
        
        // Don't run unless it's time for the next frame
        const currentDateTime = new Date();
        const timeSinceLastFrame = currentDateTime.getTime() - this._lastTime.getTime();
        const fpsLimit = this.settings.fpsLimit ?? 70;
        const levelHasBeenPrepared = (this._levelQueue.length > 0) ? this._levelQueue[0].hasBeenPrepared : false;
        if (
            timeSinceLastFrame < (1000 / fpsLimit) || // Are we over the max FPS limit? OR
            (this._assetHandler.assetsStillLoading > 0 && !levelHasBeenPrepared) // Is the current level still loading assets?
        )
        {
            return;
        }
        
        try {
            if(!levelHasBeenPrepared)
                this._prepareCurrentLevelAndModels();
            
            this._fps = this._getNewFps(currentDateTime);
            this._updateTotalTime(currentDateTime);
            
            if(this._status !== KernelStatus.Paused)
            {
                if(this._status !== KernelStatus.PrePaused)
                    this.gameEngine.run();
                
                // This will need to run if we're in the pre-pause state, so we 
                // can re-draw the UI to match (e.g. drawing a play button 
                // instead of a pause button)
                this.graphicEngine.run(this.level, this.loadedModels, this.fps, this.settings.fpsDisplayColor);
            }
            
            if(this._status === KernelStatus.PrePaused)
                this._status = KernelStatus.Paused;
            
            // This should always be ran, even if the game is paused
            this.level.checkForHoverEvents();
            
            if(this._currentLevelShouldBeUnloaded)
            {
                this._unloadCurrentLevel();
                this._currentLevelShouldBeUnloaded = false;
            }
            
            this._lastTime = currentDateTime;
        } catch (err:any) {
            this.handleError(err);
        }
    }
    
    /**
     * Loads the elements needed for the kernel, and the initial level
     */
    private _load():void
    {
        this._setupAutoPause();
        
        // Load the fonts from the "fonts" object
        Object.keys(fonts).forEach((key:string) => {
            const fontPath = fonts[key as keyof typeof fonts];
            this._assetHandler.loadFont(key, fontPath);
        });
        
        const initialLevel = this.settings.getInitialLevel(this);
        this.loadLevel(initialLevel);
        
        this._prepareKernelForLevelStart();
    }
    
    /**
     * Sets up any event listeners to pause/unpause the game automatically (e.g. when the user switches tabs)
     */
    private _setupAutoPause():void
    {
        // If the player switches tabs/windows, pause the game
        document.addEventListener("visibilitychange", () => {
            if(document.visibilityState === "hidden" && this.status === KernelStatus.Active)
                this.toggleGamePause();
        });
        
        // Unfortunately, if the window is resized we need to unpause the game so that everything can be 
        // redrawn with the new size settings.
        window.addEventListener("resize", () => {
            if(this.status === KernelStatus.Paused)
                this.toggleGamePause();
        });
    }
    
    /**
     * Gets the kernel ready when a new level is about to start
     */
    private _prepareKernelForLevelStart():void
    {
        this._totalLevelActiveMilliseconds = 0;
        this._status = KernelStatus.Active;
        this._soundKeysPlayingBeforeLastPause = [];
    }
    
    /**
     * Triggers the preparation for the current level
     */
    private _prepareCurrentLevelAndModels():void
    {
        if(this.level)
        {
            this.soundEngine.reset();
            
            this.level.prepare();
            this.loadedModels.forEach(model => model.prepare());
            
            this._levelQueue[0].hasBeenPrepared = true;
        }
    }
    
	/**
     * Returns new instances of all engines
     * @param level the level
     * @param loadedModels the models created/used by the level
     * @param camera The level's camera
     * @returns The new instances of all engines
     */
	private _initialiseAllEngines(level:ILevel, loadedModels:IModel[], camera:ICamera):ILevelEngines
	{
		const gameEngine = new GameEngine(level, loadedModels);
        const graphicEngine = new GraphicEngine(camera, level.frameManager, this._canvasContext);
        const soundEngine = new SoundEngine((err:any) => this.handleError(err));
        
        return { gameEngine, graphicEngine, soundEngine };
	}
    
    /**
     * Unloads the current level, triggering the release of any assets that need releasing, and
     * clears up anything else
     */
    private _unloadCurrentLevel():void
    {
        this.soundEngine.reset();
        
        this.loadedModels.forEach(model => model.unload(this._assetHandler));
        this.level.unload(this._assetHandler);
        
        this._levelQueue.shift();
        
        this._prepareKernelForLevelStart();
    }
    
    /**
     * Calculates an estimate of the game's current FPS
     * @param currentDateTime The current date/time
     * @returns the current (estimated) FPS
     */
    private _getNewFps(currentDateTime:Date):number
    {
        /*
            If the browser window/tab is not visible, the browser will stop calling the 
            run method until it is visible again.
            
            However, this can cause unexpected behaviour because the frame rate will drop for a single  
            frame when the player returns to the tab/window. 
            
            Therefore, we will store the highest frame rate achieved, and return that if the 
            current rate is unexpectably low.
        */
       
        const currentFps = 1000 / (currentDateTime.getTime() - this._lastTime.getTime());
        
        if(currentFps > this._highestFpsReached)
            this._highestFpsReached = currentFps;
        
        return (currentFps < (this._highestFpsReached - 10)) ? this._highestFpsReached : currentFps;
    }
    
    /**
     * Updates the kernel's internal count of how long the current level has been active (in milliseconds)
     * @param currentDateTime The current date/time
     */
    private _updateTotalTime(currentDateTime:Date):void
    {
        const timePassed = currentDateTime.getMilliseconds() - this._lastTime.getMilliseconds();
        
        if(this._status !== KernelStatus.Paused && timePassed > 0)
            this._totalLevelActiveMilliseconds += timePassed;
    }
};