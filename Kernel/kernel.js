import AssetHandler from './AssetHandler';
import GameEn from '/engines/GameEn/GameEn';
import GraphicEn from '/engines/GraphicEn/GraphicEn';
import SoundEn from '/engines/SoundEn/SoundEn';
import TimeHelper from '/Kernel/helpers/TimeHelper';
import UnitHelper from '/Kernel/helpers/UnitHelper';
import ZCalc from '/Kernel/helpers/ZCalc';
import Camera from '/engines/GraphicEn/Camera';
import FrameManager from '/engines/GraphicEn/FrameManager';
import devSettings from '/settings/settings.development';
import prodSettings from '/settings/settings.production';
import fonts from '/assets/fonts/fonts';

/**
 * Controls the entire game (this will be a singleton)
 */
export default class Kernel {
    
    static _instance = null; //The single instance of Kernel
    
    /**
     * Returns the singleton instance of the kernel
     * @returns The singleton instance of the kernel
     */
    static getInstance()
    {
        //The Kernel constructor will return the single instance
        //if it has already been created, and if not then it will create
        //it. We want the same behaviour for this method. The only
        //actual reason for this method is language -- it's better
        //that people know you're "getting" the "instance", then thinking
        //you are truly making something "new".
        return new Kernel();
    }
    
    /**
     * Constructor
     * @returns The singleton instance of the kernel
     */
    constructor()
    {
        if(Kernel._instance !== null)
        {
            return Kernel._instance;
        }
        Kernel._instance = this;
        
        const settings = (process.env.GAME_ENV === "development") ? devSettings : prodSettings;
        this._settings:ISettings = settings;
        
        this._isOnMobile = !!settings.isOnMobile; //is this a mobile app (such as through Cordova)?
        
        this._fps = (!isNaN(settings.initialFPS)) ? settings.initialFPS : 60;
        this._highestFpsReached = 0;
        this._fpsLimit = (!isNaN(settings.fpsLimit)) ? settings.fpsLimit : 70;
        this._lastTime = new Date(); //used when calculating fps and enforcing fps limit
        
        this._totalLevelActiveMilliseconds = 0; //total ms that the game has not been paused or stopped for any reason
        this._active = true;
        
        const filePath = window.location.pathname;
        this._rootPath = filePath.substring(0, filePath.lastIndexOf('/'));
        
        this._assetHandler = new AssetHandler(this._rootPath);
        
        this._levelQueue:ILoadedLevel[] = [];
        
        this._helpers:IHelpers;
		
		this._gameCanvasElementID = settings.gameCanvasElementID;
		this._gameCanvas = document.getElementById(this.gameCanvasElementID);
		this._gameContext = this.gameCanvas.getContext("2d");
        this._correctCanvasStyleAndDevicePixelRatio = settings.correctCanvasStyleAndDevicePixelRatio;
        
        this._controlInitialiser = new settings.controlsInitialiserClass();
        
        /**
         * Should the current FPS counter be displayed on the canvas?
         */
        this.displayFps = settings.displayFps;
        
        /**
         * If we're displaying the FPS counter, what color should the text be?
         */
        this.fpsDisplayColor = settings.fpsDisplayColor;
        
        /**
         * How many drawSpace x/y units are there within the camera's size?
         */
        this.unitsWithinCamera = (!isNaN(settings.unitsWithinCamera)) ? settings.unitsWithinCamera : 1000;
    }
    
    //getters and setters ----------------------------------------------------------------------
    
    /**
     * Is the level currently active (e.g. not paused)?
     */
    get active(){return this._active;}
    
    /**
     * The different settings for the game
     */
    get settings(){return this._settings;}
    
    /**
     * Is this a mobile app (such as through Cordova)?
     */
    get isOnMobile(){return this._isOnMobile;}
    
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
    get level(){return (this._levelQueue.length > 0) ? this._levelQueue[0].level : undefined;}
    
    /**
     * The models loaded by the current level
     */
    get loadedModels(){return (this._levelQueue.length > 0) ? this._levelQueue[0].loadedModels : [];}
    
    /**
     * Has the current level been prepared? (using the Level.prepare method)
     */
    get levelHasBeenPrepared(){return (this._levelQueue.length > 0) ? this._levelQueue[0].hasBeenPrepared : undefined}
    
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
    get assetsStillLoading(){return this.assetHandler._assetsStillLoading;}
    
    /**
     * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
     */
    get gameEn(){return this._levelQueue[0].preparedEngines.gameEn;}
    
    /**
     * The engine that controls the drawing to the screen
     */
    get graphicEn(){return this._levelQueue[0].preparedEngines.graphicEn;}
    
    /**
     * The engine that controls the sound/music of the game
     */
    get soundEn(){return this._levelQueue[0].preparedEngines.soundEn;}
	
    /**
     * The ID of the HTML canvas element
     */
	get gameCanvasElementID(){return this._gameCanvasElementID;}
    
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
    get correctCanvasStyleAndDevicePixelRatio(){return this._correctCanvasStyleAndDevicePixelRatio;}
    
    
    // loading/unloading methods --------------------------------------------------------------------------
    
    /**
     * Loads the elements needed for the kernel, and the initial level
     */
    load()
    {
        this._helpers = {
            zCalc: new ZCalc(),
            time: new TimeHelper(),
            unit: new UnitHelper(this.unitsWithinCamera)
        };
        
        Object.keys(fonts).forEach(key => this.loadFont(key, fonts[key]));
        
        this._loadLevel(new this.settings.initialLevelClass(...this.settings.initialLevelConstructorParameters));
    }
    
    /**
     * Loads the given level, and adds it to the kernel's internal level queue
     * @param level the level to load
     */
    _loadLevel(level)
    {
		this._initialiseControls();
        
		const aspectRatioHorizontal = (!isNaN(this.settings.aspectRatioHorizontal)) ? this.settings.aspectRatioHorizontal : 17;
		const aspectRatioVertical = (!isNaN(this.settings.aspectRatioVertical)) ? this.settings.aspectRatioVertical : 9;
		const camera = new Camera(this.gameCanvas, this.gameContext, aspectRatioHorizontal, aspectRatioVertical);
		const frameManager = new FrameManager(camera);
		
        const preparedEngines = this._initialiseAllEngines(camera, frameManager); // new engines, aimed at this level
        
        //do any extra setup
        level.load(this.gameCanvas, this.gameContext, camera, frameManager);
        
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
    unloadCurrentLevel()
    {
        this.loadedModels.forEach(model => model.unload());
        this.level.unload();
        this._totalLevelActiveMilliseconds = 0;
        this._controlInitialiser.unregisterEventListeners();
        this._levelQueue.shift();
    }
    
    /**
     * Loads the given models
     * @param models the models to be loaded
     * @param engines the engines used by the level that provided these models
     */
    _loadModels(models, engines)
	{
        models.forEach((model, idx) => {
            model.loadedIndex = idx;
            model.load();
            model.loadAnimationsManager(this.gameContext, engines.graphicEn.camera);
        });
	}
    
    /**
     * Triggers the preparation of the level, and all models
     */
    _prepareCurrentLevelAndModels()
    {
        this.level.prepare();
        this.loadedModels.forEach(model => model.prepare());
        
        this._levelQueue[0].hasBeenPrepared = true;
    }
    
	/**
     * Returns a new instances of all engines
     * @param camera The level's camera
     * @param frameManager Manages the frames of a level
     * @returns The new instances of all engines
     */
	_initialiseAllEngines(camera, frameManager)
	{
		const gameEn = new GameEn();
        const graphicEn = new GraphicEn(this.gameCanvas, this.gameContext, camera, frameManager);
        const soundEn = new SoundEn();
        
        return { gameEn, graphicEn, soundEn };
	}
    
    /**
     * Triggers the initialisation of the game's controls
     */
	_initialiseControls()
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
    loadImage(path, callback = this._assetHandler.getDefaultAssetCallback())
    {
        return this._assetHandler.loadAsset(new Image, path, callback);
    }
    
    /**
     * Loads an audio file (if not already loaded) with the asset handler
     * @param path the file path to the audio file
     * @param callback a callback function, to run when the asset has finished loading (this function should still call the asset handler's default asset callback)
     * @returns the audio object
     */
    loadAudio(path, callback = this._assetHandler.getDefaultAssetCallback())
    {
        return this._assetHandler.loadAsset(new Audio, path, callback);
    }
    
    /**
     * Starts the loading of a font file into the HTML document
     * @param name the name of the font
     * @param path the path to the font file
     * @param callback a callback function, to run when the font has finished loading (this function should still call the asset handler's default asset callback)
     */
    loadFont(name, path, callback = this._assetHandler.getDefaultAssetCallback())
    {
        this._assetHandler.loadFont(name, path, callback);
    }
    
    /**
     * Finds the loaded asset with the given file path, and reduces the usage count against it. The asset should stay 
     * loaded if there are still entities using it, but if the usage count goes down to 0, this will remove it. (fonts 
     * cannot be unloaded)
     * @param path the file path of the asset
     */
    releaseAsset(path)
    {
        this._assetHandler.releaseAsset(path);
    }
    
    
    //running the game ---------------------------------------------------------------
    
    /**
     * Runs the game
     */
    run()
    {
        requestAnimationFrame(this.run.bind(this));
        
        //don't run unless it's time for next frame
        let dt = new Date();
        if((dt.getTime() - this._lastTime.getTime()) < (1000 / this._fpsLimit) || (!this.levelHasBeenPrepared && this.assetsStillLoading > 0))
        {
            return;
        }
        
        if(!this.levelHasBeenPrepared)
        {
            this._prepareCurrentLevelAndModels();
        }
        
        this._fps = this._getNewFps(dt);
        
        this._updateTotalTime(dt);
        this._lastTime = dt;
        
        if(this.active)
        {
            this.gameEn.run();
            this.graphicEn.run();
        }
    }
    
    /**
     * Paues/unpauses the game
     */
    toggleGamePause()
    {
        if(this._active)
        {
            this._soundEn.pauseMusic();
        } else {
            this._soundEn.playMusic();
        }
        
        this._active = !this._active;
    }
    
    /**
     * Calculates an estimate of the game's current FPS
     * @param currentDateTime The current date/time
     * @returns the current (estimated) FPS
     */
    _getNewFps(currentDateTime)
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
    _updateTotalTime(currentDateTime)
    {
        let timePassed = Math.floor(currentDateTime.getMilliseconds()) - Math.floor(this._lastTime.getMilliseconds());
        
        if(this._active && timePassed >= 1)
        {
            this._totalLevelActiveMilliseconds += timePassed;
        }
    }
    
    // Initiating the game -----------------------------------------------------------------
    
    /**
     * Loads the kernel, and starts the game running
     */
    initiate()
    {
        this.load();
        this.run();
    }
}