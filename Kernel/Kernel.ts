import AssetHandler from './AssetHandler/AssetHandler';
import GameEngine from '../engines/GameEngine/GameEngine';
import GraphicEngine from '../engines/GraphicEngine/GraphicEngine';
import SoundEngine from '../engines/SoundEngine/SoundEngine';
import TimeHelper from './helpers/TimeHelper';
import UnitHelper from './helpers/UnitHelper';
import ZCalc from './helpers/ZCalc';
import Camera from '../engines/GraphicEngine/Camera';
import FrameManager from '../engines/GraphicEngine/FrameManager';
import devSettings from '../settings/settings.development';
import prodSettings from '../settings/settings.production';
import fonts from '../assets/fonts/fonts';
import IKernel from './IKernel';
import ISettings from '../settings/ISettings';
import IAssetHandler from './AssetHandler/IAssetHandler';
import IControlsInitialiser from '../settings/ControlsInitialiser/IControlsInitialiser';
import IHelpers from './helpers/IHelpers';
import ILoadedLevel from './ILoadedLevel';
import ILevel from '../assets/levels/Level/ILevel';
import IModel from '../assets/models/Model/IModel';
import ILevelEngines from './ILevelEngines';
import ICamera from '../engines/GraphicEngine/ICamera';
import IFrameManager from '../engines/GraphicEngine/IFrameManager';
import { IErrorHandler } from './ErrorHandler/IErrorHandler';
import ErrorHandler from './ErrorHandler/ErrorHandler';
import { KernelStatus } from './KernelStatus';
import ModelAnimationsManager from '../assets/models/Model/ModelAnimationsManager/ModelAnimationsManager';
import EventManager from '../assets/levels/Level/EventManager';
import PointerEventManager from '../assets/levels/Level/PointerEventManager';

/**
 * This will be a singleton that controls the entire game, and provides other entities with 
 * access to certain functionality and data.
 */
export default class Kernel implements IKernel {

    // *********************** Static Methods/Properties **********************************
    static _instance:Kernel; // The singleton instance of Kernel
    
    /**
     * Gets the singleton instance of the kernel
     * @returns the singleton instance of the kernel
     */
    static getInstance(canvas?:HTMLCanvasElement):Kernel
    {
        // The Kernel constructor will return the singleton instance
        // if it has already been created, and if not then it will create
        // it. We want the same behaviour for this method. The only
        // actual reason for this method is language -- it's better
        // that people know you're "getting" the "instance", then thinking
        // you are truly making something "new".
        return new Kernel(canvas);
    }
    
    /**
     * Triggers the starting of the game
     */
    static init(canvas:HTMLCanvasElement)
    {
        const instance = this.getInstance(canvas);
        
        if(instance.level) // If we've already initiated the game
            return;
        
        try {
            instance.gameCanvas = canvas;
            instance._load();
        } catch (err:any) {
            instance.handleError(err);
        }
        
        if(!instance._hasError)
            instance.run(); // Runs the first frame. This is then re-called by the browser for every other frame
    }
    // ************************************************************************************
    
    
    private _settings:ISettings; // The settings for the game
    private _gameCanvas:HTMLCanvasElement; // The HTML canvas element that the game should be drawn on
    private _gameContext:CanvasRenderingContext2D; // The 2D context from the HTML canvas element
    
    private _fps:number; // The current Frames Per Second of the game
    private _highestFpsReached:number; // The highest FPS the game has reached
    private _fpsLimit:number; // The maximum FPS that the game should be allowed to run at
    private _lastTime:Date; // The date/time that the last frame ran
    
    private _levelQueue:ILoadedLevel[]; // The queue of levels that have been loaded (or are currently loading)
    private _totalLevelActiveMilliseconds:number; // The total amount of milliseconds that the level has not been paused or stopped for any reason
    private _timeSinceLastFrameMS:number; // The amount of milliseconds that passed between the last frame, and this one
    private _status:KernelStatus; // The current status of the game (e.g. is it playing, paused, or in another state)
    
    private _hasError:boolean; // Has an error been caught and passed to the error handler?
    private _errorHandler:IErrorHandler; // Manages error-handling for the game
    
    private _centralState:Map<string, any>; // A map to store any state that needs to be accessible to all levels.
    
    private _rootPath:string; // The root directory/path, added to the beginning of all file paths when loading assets
    private _assetHandler:IAssetHandler; // Loads and manages assets
    
    private _helpers:IHelpers; // Provides a number of "helper" objects, that each calculate and/or provide useful values
    private _controlInitialiser:IControlsInitialiser; // Handles the initialising of the game's controls
    
    private _currentLevelShouldBeUnloaded:boolean; // If this is true, the current level will get unloaded after the current frame has been drawn
    
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
     * Constructor
     * @returns The singleton instance of the kernel
     */
    private constructor(canvas?:HTMLCanvasElement)
    {
        if(Kernel._instance)
        {
            return Kernel._instance;
        }
        Kernel._instance = this;
        
        // While we want the canvas parameter to be optional for the constructor/getInstance() methods (so it's 
        // not needed when we're getting the pre-existing kernel instance), it is still a requirement when 
        // initially constructing the singleton instance.
        if(!canvas)
            throw new Error("Cannot initialise the game's Kernel without a canvas element");
        
        this.gameCanvas = canvas;
        
        this._settings = (process.env.GAME_ENV === "development") ? devSettings : prodSettings;
        
        this._fps = 60;
        this._highestFpsReached = 0;
        this._fpsLimit = this._settings.fpsLimit ?? 70;
        this._lastTime = new Date();
        this._timeSinceLastFrameMS = 0;
        
        const filePath = window.location.pathname;
        this._rootPath = filePath.substring(0, filePath.lastIndexOf('/'));
        
        this._assetHandler = new AssetHandler();
        
        this._levelQueue = [];
        
        this._hasError = false;
        this._errorHandler = new ErrorHandler();
        this._centralState = new Map<string, any>();
        
        this._currentLevelShouldBeUnloaded = false;
        
        this.fpsDisplayColor = this._settings.fpsDisplayColor;
        this.unitsWithinCameraX = this._settings.unitsWithinCameraX;
        this.unitsWithinCameraY = this._settings.unitsWithinCameraY;
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
     * The maximum FPS that the game should be allowed to run at
     */
    get fpsLimit()
    {
        return this._fpsLimit;
    }
    
    /**
     * The total amount of milliseconds that the level has not been paused or stopped for any reason
     */
    get totalLevelActiveMilliseconds()
    {
        return this._totalLevelActiveMilliseconds;
    }
    
    /**
     * The amount of milliseconds that passed between the last frame, and this one
     */
    get timeSinceLastFrameMS()
    {
        return this._timeSinceLastFrameMS;
    }
    
    /**
     * The root directory/path, added to the beginning of all file paths when loading assets
     */
    get rootPath()
    {
        return this._rootPath;
    }
    
    /**
     * Provides a number of "helper" objects, that each calculate and/or provide useful values
     */
    get helpers() 
    {
        return this._helpers;
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
     * Has the current level been prepared? (using the Level.prepare method)
     */
    get levelHasBeenPrepared()
    {
        return (this._levelQueue.length > 0) ? this._levelQueue[0].hasBeenPrepared : false;
    }
    
    /**
     * The amount of assets that are still loading
     */
    get assetsStillLoading()
    {
        return this._assetHandler.assetsStillLoading;
    }
    
    /**
     * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
     * @returns the game engine, or undefined if there's no loaded levels
     */
    get gameEngine()
    {
        return this._levelQueue[0]?.engines.gameEngine;
    }
    
    /**
     * The engine that controls the drawing to the screen
     * @returns the graphic engine, or undefined if there's no loaded levels
     */
    get graphicEngine()
    {
        return this._levelQueue[0]?.engines.graphicEngine;
    }
    
    /**
     * The engine that controls the sound/music of the game
     * @returns the sound engine, or undefined if there's no loaded levels
     */
    get soundEngine()
    {
        return this._levelQueue[0]?.engines.soundEngine;
    }
    
    /**
     * The HTML canvas element that the game should be drawn on
     */
	get gameCanvas()
    {
        return this._gameCanvas;
    }
    
    private set gameCanvas(c:HTMLCanvasElement)
    {
        this._gameCanvas = c;
        this._gameContext = c.getContext("2d")!;
    }
    
    /**
     * The 2D context from the HTML canvas element
     */
	get gameContext()
    {
        return this._gameContext;
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
     * Loads an image with the asset handler
     * @param path the file path to the image
     * @returns the image object
     */
    loadImage(path:string):HTMLImageElement
    {
        return this._assetHandler.loadAsset(new Image, path) as HTMLImageElement;
    }
    
    /**
     * Loads an audio file with the asset handler
     * @param path the file path to the audio file
     * @returns the audio object
     */
    loadAudio(path:string):HTMLAudioElement
    {
        return this._assetHandler.loadAsset(new Audio, path) as HTMLAudioElement;
    }
    
    /**
     * Starts the loading of a font file into the HTML document
     * @param name the name of the font
     * @param path the path to the font file
     */
    loadFont(name:string, path:string):void
    {
        this._assetHandler.loadFont(name, path);
    }
    
    /**
     * Deletes the asset with the given file path (fonts cannot be released).
     * @param path the file path of the asset
     */
    releaseAsset(path:string):void
    {
        this._assetHandler.releaseAsset(path);
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
     * Runs the game loop
     */
    run():void
    {
        // Request that the browser re-runs this method for the next frame
        requestAnimationFrame(this.run.bind(this));
        
        // Don't run if there was an error
        if(this._hasError) 
            return;
        
        // Don't run unless it's time for the next frame
        const currentDateTime = new Date();
        const timeSinceLastFrame = currentDateTime.getTime() - this._lastTime.getTime();
        if (
            timeSinceLastFrame < (1000 / this._fpsLimit) || // Are we over the max FPS limit? OR
            (this.assetsStillLoading > 0 && !this.levelHasBeenPrepared) // Is the current level still loading assets?
        )
        {
            return;
        }
        
        this._timeSinceLastFrameMS = timeSinceLastFrame;
        
        try {
            if(!this.levelHasBeenPrepared)
                this._prepareCurrentLevelAndModels();
            
            this._fps = this._getNewFps(currentDateTime);
            this._updateTotalTime(currentDateTime);
            
            if(this._status !== KernelStatus.Paused)
            {
                this.gameEngine.run();
                this.graphicEngine.run();
                this.soundEngine.run();
            }
            
            if(this._status === KernelStatus.PrePaused)
                this._status = KernelStatus.Paused;
            
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
     * Pauses/unpauses the game (if the current level is pauseable)
     */
    toggleGamePause():void
    {
        if(this.level.isPauseable)
        {
            if(this._status === KernelStatus.Active)
            {
                this.soundEngine.pauseMusic();
                this.soundEngine.pauseAllSounds();
                this._status = KernelStatus.PrePaused;
            } else {
                this.soundEngine.playMusic();
                this.soundEngine.unpauseAllSounds();
                this._status = KernelStatus.Active
            }
        }
    }
    
    /**
     * Loads the given level, and adds it to the kernel's internal level queue
     * @param level the level to load
     */
    loadLevel(level:ILevel):void
    {
		const aspectRatioHorizontal = this.settings.aspectRatioHorizontal;
		const aspectRatioVertical = this.settings.aspectRatioVertical;
		const camera = new Camera(aspectRatioHorizontal, aspectRatioVertical);
		const frameManager = new FrameManager(camera);
		
        const engines = this._initialiseAllEngines(camera, frameManager); // New engines, setup for this level
        
        level.load(
            frameManager, 
            new EventManager(),
            new PointerEventManager()
        );
        
        const loadedModels = level.getModels();
        this._loadModels(loadedModels);
        
        this._levelQueue.push({ 
            level, 
            hasBeenPrepared: false, 
            loadedModels, 
            engines 
        });
    }
    
    
    
    
    /**
     * Loads the elements needed for the kernel, and the initial level
     */
    private _load():void
    {
        this._setupAutoPause();
        
        this._helpers = {
            zCalc: new ZCalc(),
            time: new TimeHelper(),
            unit: new UnitHelper(this.unitsWithinCameraX, this.unitsWithinCameraY)
        };
        
        // Load the fonts from the "fonts" object
        Object.keys(fonts).forEach((key:string) => {
            const fontPath = fonts[key as keyof typeof fonts];
            this.loadFont(key, fontPath);
        });
        
        const InitialLevelClass = this.settings.InitialLevelClass;
        this.loadLevel(new InitialLevelClass());
        
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
     * Loads the given models
     * @param models the models to be loaded
     * @param engines the engines used by the level that provided these models
     */
    private _loadModels(models:IModel[]):void
	{
        models.forEach((model, idx) => {
            const animationsManager = new ModelAnimationsManager(model);
            
            model.loadedIndex = idx;
            model.load(animationsManager);
        });
	}
    
    /**
     * Gets the kernel ready when a new level is about to start
     */
    private _prepareKernelForLevelStart():void
    {
        this._totalLevelActiveMilliseconds = 0;
        this._status = KernelStatus.Active;
        
        const ControlsInitialiserClass = this._settings.ControlsInitialiserClass;
        this._controlInitialiser = new ControlsInitialiserClass();
    }
    
    /**
     * Triggers the preparation of the current level, and all of its models
     */
    private _prepareCurrentLevelAndModels():void
    {
        if(this.level)
        {
            this.level.prepare();
            this.loadedModels.forEach(model => model.prepare());
            this._initialiseControls();
            
            this._levelQueue[0].hasBeenPrepared = true;
        }
    }
    
	/**
     * Returns new instances of all engines
     * @param camera The level's camera
     * @param frameManager Manages the frames of a level
     * @returns The new instances of all engines
     */
	private _initialiseAllEngines(camera:ICamera, frameManager:IFrameManager):ILevelEngines
	{
		const gameEngine = new GameEngine();
        const graphicEngine = new GraphicEngine(camera, frameManager);
        const soundEngine = new SoundEngine();
        
        return { gameEngine, graphicEngine, soundEngine };
	}
    
    /**
     * Triggers the initialisation of the game's controls
     */
	private _initialiseControls():void
	{
		this._controlInitialiser.initialiseControls();
	}
    
    /**
     * Unloads the current level, triggering the release of any assets that need releasing
     */
    private _unloadCurrentLevel():void
    {
        this.loadedModels.forEach(model => model.unload());
        this.level.unload();
        
        this._totalLevelActiveMilliseconds = 0;
        this._controlInitialiser.unregisterEventListeners();
        
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
        const timePassed = Math.floor(currentDateTime.getMilliseconds()) - Math.floor(this._lastTime.getMilliseconds());
        
        if(this._status !== KernelStatus.Paused && timePassed >= 1)
            this._totalLevelActiveMilliseconds += timePassed;
    }
};