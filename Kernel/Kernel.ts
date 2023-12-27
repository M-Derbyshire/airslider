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
import IPreparedEngines from './IPreparedEngines';
import ICamera from '../engines/GraphicEngine/ICamera';
import IFrameManager from '../engines/GraphicEngine/IFrameManager';
import { IErrorHandler } from './ErrorHandler/IErrorHandler';
import ErrorHandler from './ErrorHandler/ErrorHandler';
import { KernelStatus } from './KernelStatus';
import ModelAnimationsManager from '../assets/models/Model/ModelAnimationsManager/ModelAnimationsManager';
import EventManager from '../assets/levels/Level/EventManager';
import PointerEventManager from '../assets/levels/Level/PointerEventManager';

/**
 * Controls the entire game (this will be a singleton)
 */
export default class Kernel implements IKernel {
    
    static _instance:Kernel; //The single instance of Kernel
    
    /**
     * Returns the singleton instance of the kernel
     * @returns The singleton instance of the kernel
     */
    static getInstance():Kernel
    {
        //The Kernel constructor will return the single instance
        //if it has already been created, and if not then it will create
        //it. We want the same behaviour for this method. The only
        //actual reason for this method is language -- it's better
        //that people know you're "getting" the "instance", then thinking
        //you are truly making something "new".
        return new Kernel();
    }
    
    
    private _settings:ISettings;
    private _gameCanvas:HTMLCanvasElement;
    private _gameContext:CanvasRenderingContext2D;
    private _correctCanvasStyleToDevicePixelRatio:boolean;
    
    private _fps:number;
    private _highestFpsReached:number;
    private _fpsLimit:number;
    private _lastTime:Date;
    
    private _totalLevelActiveMilliseconds:number;
    private _status:KernelStatus;
    private _hasError:boolean;
    private _errorHandler:IErrorHandler;
    
    private _rootPath:string;
    private _assetHandler:IAssetHandler;
    
    private _levelQueue:ILoadedLevel[];
    
    private _helpers:IHelpers;
    
    private _controlInitialiser:IControlsInitialiser;
    
    /**
     * Should the current FPS counter be displayed on the canvas?
     */
    displayFps:boolean;
    
    /**
     * If we're displaying the FPS counter, what color should the text be?
     */
    fpsDisplayColor:string;
    
    /**
     * How many drawSpace x/y units are there within the camera's size?
     */
    unitsWithinCamera:number;
    
    
    /**
     * Constructor
     * @returns The singleton instance of the kernel
     */
    private constructor()
    {
        if(Kernel._instance)
        {
            return Kernel._instance;
        }
        Kernel._instance = this;
        
        const settings = (process.env.GAME_ENV === "development") ? devSettings : prodSettings;
        this._settings = settings;
        
        this._fps = 60;
        this._highestFpsReached = 0;
        this._fpsLimit = (!isNaN(settings.fpsLimit)) ? settings.fpsLimit : 70;
        this._lastTime = new Date(); //used when calculating fps and enforcing fps limit
        
        const filePath = window.location.pathname;
        this._rootPath = filePath.substring(0, filePath.lastIndexOf('/'));
        
        this._assetHandler = new AssetHandler(this._rootPath);
        
        this._levelQueue = [];
        
		this._gameCanvas = settings.gameCanvas;
		this._gameContext = this.gameCanvas.getContext("2d")!;
        this._correctCanvasStyleToDevicePixelRatio = settings.correctCanvasStyleToDevicePixelRatio;
        
        this._totalLevelActiveMilliseconds = 0; //total ms that the game has not been paused or stopped for any reason
        this._status = KernelStatus.Active;
        this._hasError = false; // Has an error been caught and passed to the error handler?
        this._errorHandler = new ErrorHandler();
        
        this._controlInitialiser = new settings.controlsInitialiserClass();
        
        this.displayFps = settings.displayFps;
        this.fpsDisplayColor = settings.fpsDisplayColor;
        this.unitsWithinCamera = (!isNaN(settings.unitsWithinCamera)) ? settings.unitsWithinCamera : 1000;
    }
    
    //getters and setters ----------------------------------------------------------------------
    
    /**
     * The current status of the level
     */
    get status(){return this._status;}
    
    /**
     * The different settings for the game
     */
    get settings(){return this._settings;}
    
    /**
     * The current Frames Per Second of the game
     */
    get fps(){return this._fps;}
    
    /**
     * The maximum FPS that the game should be allowed to run at
     */
    get fpsLimit(){return this._fpsLimit;}
    
    /**
     * The total milliseconds that the level has not been paused or stopped for any reason
     */
    get totalLevelActiveMilliseconds(){return this._totalLevelActiveMilliseconds;}
    
    /**
     * The root directory/path, added to the beginning of all asset file paths
     */
    get rootPath(){return this._rootPath;}
    
    /**
     * Provides a number of "helper" objects, that each calculate and/or provide useful values
     */
    get helpers() {return this._helpers;}
    
    /**
     * The current level that is being ran
     */
    get level(){return this._levelQueue[0]!.level}
    
    /**
     * The models loaded by the current level
     */
    get loadedModels(){return (this._levelQueue.length > 0) ? this._levelQueue[0].loadedModels : [];}
    
    /**
     * Has the current level been prepared? (using the Level.prepare method)
     */
    get levelHasBeenPrepared(){return (this._levelQueue.length > 0) ? this._levelQueue[0].hasBeenPrepared : false}
    
    /**
     * The loaded image/audio assets
     */
    get loadedAssets(){return this._assetHandler.loadedAssets.map(loadedAsset => loadedAsset.asset);}
    
    /**
     * Loads and handles assets
     */
    get assetHandler(){return this._assetHandler;}
    
    /**
     * How many assets are still loading?
     */
    get assetsStillLoading(){return this.assetHandler.assetsStillLoading;}
    
    /**
     * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
     */
    get gameEngine(){return this._levelQueue[0].preparedEngines.gameEngine;}
    
    /**
     * The engine that controls the drawing to the screen
     */
    get graphicEngine(){return this._levelQueue[0].preparedEngines.graphicEngine;}
    
    /**
     * The engine that controls the sound/music of the game
     */
    get soundEngine(){return this._levelQueue[0].preparedEngines.soundEngine;}
    
    /**
     * The canvas element that the game should be drawn on
     */
	get gameCanvas(){return this._gameCanvas;}
    
    /**
     * The 2D context from the HTML canvas element
     */
	get gameContext(){return this._gameContext;}
    
    /**
     * Should the canvas's styling width/height be corrected, based on the Device Pixel Ratio?
     */
    get correctCanvasStyleToDevicePixelRatio(){return this._correctCanvasStyleToDevicePixelRatio;}
    
    
    // loading/unloading methods --------------------------------------------------------------------------
    
    /**
     * Loads the elements needed for the kernel, and the initial level
     */
    load():void
    {
        this._setupAutoPause();
        
        this._helpers = {
            zCalc: new ZCalc(),
            time: new TimeHelper(),
            unit: new UnitHelper(this.unitsWithinCamera)
        };
        
        Object.keys(fonts).forEach((key:string) => this.loadFont(key, fonts[key as keyof typeof fonts]));
        
        const initialLevelClass = this.settings.initialLevelClass;
        const initialLevel = initialLevelClass.apply(Object.create(initialLevelClass.prototype), this.settings.initialLevelConstructorParameters) as ILevel;
        this._loadLevel(initialLevel);
    }
    
    /**
     * Sets up any event listeners to pause/unpause the game automatically (e.g. when the user switches tabs)
     */
    private _setupAutoPause():void
    {
        document.addEventListener("visibilitychange", () => {
            if(document.visibilityState === "hidden" && this.status === KernelStatus.Active)
                this.toggleGamePause();
        });
        
        // Unfortunately, if the window is resized, we need to unpause the game so everything can be 
        // redrawn, with the new size settings.
        window.addEventListener("resize", () => {
            if(this.status === KernelStatus.Paused)
                this.toggleGamePause();
        });
    }
    
    /**
     * Loads the given level, and adds it to the kernel's internal level queue
     * @param level the level to load
     */
    private _loadLevel(level:ILevel):void
    {
		const aspectRatioHorizontal = (!isNaN(this.settings.aspectRatioHorizontal)) ? this.settings.aspectRatioHorizontal : 17;
		const aspectRatioVertical = (!isNaN(this.settings.aspectRatioVertical)) ? this.settings.aspectRatioVertical : 9;
		const camera = new Camera(aspectRatioHorizontal, aspectRatioVertical);
		const frameManager = new FrameManager(camera);
		
        const preparedEngines = this._initialiseAllEngines(camera, frameManager); // new engines, aimed at this level
        
        //do any extra setup
        level.load(
            camera, 
            frameManager, 
            new EventManager(),
            new PointerEventManager()
        );
        
        //Get models here
        const loadedModels = level.getModels();
        
        //Now we can load the models
        this._loadModels(loadedModels, preparedEngines);
        
        //hasBeenPrepared should be set to true if the level (and it's models) have had the prepare() method called
        this._levelQueue.push({ level, hasBeenPrepared: false, loadedModels, preparedEngines });
    }
    
    /**
     * Unloads the current level, releasing any assets that need releasing
     */
    unloadCurrentLevel():void
    {
        this.loadedModels.forEach(model => model.unload());
        this.level.unload();
        
        this.assetHandler.resetAllUsageCounts();
        this._totalLevelActiveMilliseconds = 0;
        this._controlInitialiser.unregisterEventListeners();
        
        this._levelQueue.shift();
    }
    
    /**
     * Loads the given models
     * @param models the models to be loaded
     * @param engines the engines used by the level that provided these models
     */
    private _loadModels(models:IModel[], engines:IPreparedEngines):void
	{
        models.forEach((model, idx) => {
            const animManager = new ModelAnimationsManager(model, this.gameContext, engines.graphicEngine.camera);
            
            model.loadedIndex = idx;
            model.load(animManager);
        });
	}
    
    /**
     * Triggers the preparation of the level, and all models
     */
    private _prepareCurrentLevelAndModels():void
    {
        this.level.prepare();
        this.loadedModels.forEach(model => model.prepare());
        this._initialiseControls();
        
        this._levelQueue[0].hasBeenPrepared = true;
    }
    
	/**
     * Returns a new instances of all engines
     * @param camera The level's camera
     * @param frameManager Manages the frames of a level
     * @returns The new instances of all engines
     */
	private _initialiseAllEngines(camera:ICamera, frameManager:IFrameManager):IPreparedEngines
	{
		const gameEngine = new GameEngine();
        const graphicEngine = new GraphicEngine(camera, frameManager);
        
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const soundEngine = new SoundEngine(new AudioContext());
        
        return { gameEngine, graphicEngine, soundEngine };
	}
    
    /**
     * Triggers the initialisation of the game's controls
     */
	private _initialiseControls():void
	{
		this._controlInitialiser.initialiseControls();
	}
    
    // Asset management
    
    /**
     * Loads an image (if not already loaded) with the asset handler
     * @param path the file path to the image
     * @param callback a callback function, to run when the asset has finished loading (this function should still call the asset handler's default asset callback)
     * @returns the image object
     */
    loadImage(path:string):HTMLImageElement
    {
        return this._assetHandler.loadAsset(new Image, path) as HTMLImageElement;
    }
    
    /**
     * Loads an audio file (if not already loaded) with the asset handler
     * @param path the file path to the audio file
     * @param callback a callback function, to run when the asset has finished loading (this function should still call the asset handler's default asset callback)
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
     * Finds the loaded asset with the given file path, and reduces the usage count against it. The asset should stay 
     * loaded if there are still entities using it, but if the usage count goes down to 0, this will remove it. (fonts 
     * cannot be unloaded)
     * @param path the file path of the asset
     */
    releaseAsset(path:string):void
    {
        this._assetHandler.releaseAsset(path);
    }
    
    
    //running the game ---------------------------------------------------------------
    
    /**
     * Runs the game
     */
    run():void
    {
        requestAnimationFrame(this.run.bind(this));
        
        try {
            // Don't run if there's been an error
            if(this._hasError) return;
            
            // Don't run unless it's time for next frame
            let dt = new Date();
            if((dt.getTime() - this._lastTime.getTime()) < (1000 / this._fpsLimit) || (!this.levelHasBeenPrepared && this.assetsStillLoading > 0))
                return;
            
            if(!this.levelHasBeenPrepared)
            {
                this._prepareCurrentLevelAndModels();
            }
            
            this._fps = this._getNewFps(dt);
            
            this._updateTotalTime(dt);
            this._lastTime = dt;
            
            if(this._status !== KernelStatus.Paused)
            {
                this.gameEngine.run();
                this.graphicEngine.run();
                this.soundEngine.run();
            }
            
            if(this._status === KernelStatus.PrePaused)
            {
                this._status = KernelStatus.Paused;
            }
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
     * Handles errors
     * @param err the error to handle (doesn't have to be an instance of Error)
     */
    handleError(err:any):void
    {
        this._hasError = true;
        this._errorHandler.handleError(err);
    }
    
    /**
     * Calculates an estimate of the game's current FPS
     * @param currentDateTime The current date/time
     * @returns the current (estimated) FPS
     */
    private _getNewFps(currentDateTime:Date):number
    {
        //If the browser window/tab is not open, requestAnimationFrame can pause.
        //However, this can cause unexpected behaviour because the frame rate will drop for one 
        //frame when the player returns to the tab/window. 
        //Therefore, we will store the highest frame rate achieved, and just return that if the 
        //current rate is unexpectably low
        const currentFps = 1000 / (currentDateTime.getTime() - this._lastTime.getTime());
        
        if(currentFps > this._highestFpsReached)
            this._highestFpsReached = currentFps;
        
        return (currentFps < (this._highestFpsReached - 10)) ? this._highestFpsReached : currentFps;
    }
    
    /**
     * Updates the kernel's internal count of the total time the current level has been active
     * @param currentDateTime The current date/time
     */
    private _updateTotalTime(currentDateTime:Date):void
    {
        let timePassed = Math.floor(currentDateTime.getMilliseconds()) - Math.floor(this._lastTime.getMilliseconds());
        
        if(this._status !== KernelStatus.Paused && timePassed >= 1)
        {
            this._totalLevelActiveMilliseconds += timePassed;
        }
    }
    
    // Initiating the game -----------------------------------------------------------------
    
    /**
     * Loads the kernel, and starts the game running
     */
    initiate():void
    {
        try {
            this.load();
        } catch (err:any) {
            this.handleError(err);
        }
        
        if(!this._hasError) {
            // Run is re-called by the browser for each frame, so it will need to handle any errors thrown by itself
            this.run();
        }
    }
}