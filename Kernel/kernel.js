import AssetHandler from './AssetHandler';
import GameEn from '/engines/GameEn/GameEn';
import GraphicEn from '/engines/GraphicEn/GraphicEn';
import SoundEn from '/engines/SoundEn/SoundEn';
import TimeHelper from '/helpers/TimeHelper';
import UnitHelper from '/helpers/UnitHelper';
import ZCalc from '/helpers/zCalc';
import Camera from '/engines/GraphicEn/Camera';
import FrameManager from '/engines/GraphicEn/FrameManager';
import settings from '/settings/settings';
import fonts from '/assets/fonts/fonts';

// This class provides a Singleton instance
// So, other than the first time, you should use Kernel.getInstance()
export default class Kernel {
    
    static _instance = null; //The single instance of Kernel
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
    
    constructor()
    {
        if(Kernel._instance !== null)
        {
            return Kernel._instance;
        }
        Kernel._instance = this;
        
        
        this._isOnMobile = !!settings.isOnMobile; //is this a mobile app (such as through Cordova)?
        
        this._fps = (!isNaN(settings.initialFPS)) ? settings.initialFPS : 60;
        this._highestFpsReached = 0;
        this._fpsLimit = (!isNaN(settings.fpsLimit)) ? settings.fpsLimit : 70;
        this._lastTime = new Date(); //used when calculating fps and enforcing fps limit
        
		//how many drawSpace x/y units are there within the camera's size
        this.unitsWithinCamera = (!isNaN(settings.unitsWithinCamera)) ? settings.unitsWithinCamera : 1000;
        
        this._totalLevelActiveMilliseconds = 0; //total ms that the game has not been paused or stopped for any reason
        this._active = true;
        
        const filePath = window.location.pathname;
        this._rootPath = filePath.substring(0, filePath.lastIndexOf('/'));
        
        this._assetHandler = new AssetHandler(this._rootPath);
        
        this._levelQueue = []; // [{ level: Level, hasBeenPrepared: boolean, loadedModels: Model[], preparedEngines: { gameEn:GameEn, graphicEn:GraphicEn, soundEn:SoundEn } }]
        this._gameEn;
        this._graphicEn;
        this._soundEn;
        
        this._helpers;
		
		this._gameCanvasElementID = settings.gameCanvasElementID;
		this._gameCanvas = document.getElementById(this.gameCanvasElementID);
		this._gameContext = this.gameCanvas.getContext("2d");
        this._correctCanvasStyleAndDevicePixelRatio = settings.correctCanvasStyleAndDevicePixelRatio;
        
        this.displayFps = settings.displayFps;
        this.fpsDisplayColor = settings.fpsDisplayColor;
        
        this._controlInitialiser = new settings.controlsInitialiserClass();
    }
    
    //getters and setters ----------------------------------------------------------------------
    get isOnMobile(){return this._isOnMobile;}
    
    get fps(){return this._fps;}
    
    get fpsLimit(){return this._fpsLimit;}
    
    get totalLevelActiveMilliseconds(){return this._totalLevelActiveMilliseconds;}
    
    get active(){return this._active;}
    set active(newVal){this._active = newVal;}
    
    get rootPath(){return this._rootPath;}
    
    get helpers() {return this._helpers;}
    
    get level(){return (this._levelQueue.length > 0) ? this._levelQueue[0].level : undefined;}
    
    get loadedModels(){return (this._levelQueue.length > 0) ? this._levelQueue[0].loadedModels : [];}
    set loadedModels(newVal){if(this._levelQueue.length > 0) this._levelQueue[0].loadedModels = newVal;}
    
    get levelHasBeenPrepared(){return (this._levelQueue.length > 0) ? this._levelQueue[0].hasBeenPrepared : undefined}
    set levelHasBeenPrepared(newVal){if(this._levelQueue.length > 0) this._levelQueue[0].hasBeenPrepared = newVal;}
    
    get loadedAssets(){return this._assetHandler.loadedAssets;}
    get assetHandler(){return this._assetHandler;}
    get assetsStillLoading(){return this.assetHandler._assetsStillLoading;}
    
    get gameEn(){return this._gameEn;}
    
    get graphicEn(){return this._graphicEn;}
    
    get soundEn(){return this._soundEn;}
    
    get menuEn(){return this._menuEn;}
	
	get gameCanvasElementID(){return this._gameCanvasElementID;}
	get gameCanvas(){return this._gameCanvas;}
	get gameContext(){return this._gameContext;}
    get correctCanvasStyleAndDevicePixelRatio(){return this._correctCanvasStyleAndDevicePixelRatio;}
    
    
    // loading/unloading methods --------------------------------------------------------------------------
    load()
    {
        this._helpers = {
            zCalc: new ZCalc(),
            time: new TimeHelper(),
            unit: new UnitHelper(this.unitsWithinCamera)
        };
        
        Object.keys(fonts).forEach(key => this.loadFont(key, fonts[key]));
        
        this.loadLevel(new settings.initialLevelClass(...settings.initialLevelConstructorParameters));
    }
    
    loadLevel(level)
    {
		this._initialiseControls();
        
		const aspectRatioHorizontal = (!isNaN(settings.aspectRatioHorizontal)) ? settings.aspectRatioHorizontal : 17;
		const aspectRatioVertical = (!isNaN(settings.aspectRatioVertical)) ? settings.aspectRatioVertical : 9;
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
    
    unloadCurrentLevel()
    {
        this.loadedModels.forEach(model => model.unload());
        this.level.unload();
        this._totalLevelActiveMilliseconds = 0;
        this._controlInitialiser.unregisterEventListeners();
        this._levelQueue.shift();
    }
	
	_loadModels(models, engines)
	{
        models.forEach((model, idx) => {
            model.loadedIndex = idx;
            model.load();
            model.loadAnimationsManager(this.gameContext, engines.graphicEn.camera);
        });
	}
    
    prepareCurrentLevelAndModels()
    {
        this.level.prepare();
        this.loadedModels.forEach(model => model.prepare());
        
        this.levelHasBeenPrepared = true;
    }
    
    
	// Returns new instances of all engines
	_initialiseAllEngines(camera, frameManager)
	{
		const gameEn = new GameEn();
        const graphicEn = new GraphicEn(this.gameCanvas, this.gameContext, camera, frameManager);
        const soundEn = new SoundEn();
        
        return { gameEn, graphicEn, soundEn };
	}
    
    replaceEngines()
    {
        this._gameEn = this._levelQueue[0].preparedEngines.gameEn;
        this._graphicEn = this._levelQueue[0].preparedEngines.graphicEn;
        this._soundEn = this._levelQueue[0].preparedEngines.soundEn;
    }
    
	
	_initialiseControls()
	{
		this._controlInitialiser.initialiseControls();
	}
    
    // Asset management
    loadImage(path, callback = this._assetHandler.getDefaultAssetCallback())
    {
        return this._assetHandler.loadAsset(new Image, path, callback);
    }
    
    loadAudio(path, callback = this._assetHandler.getDefaultAssetCallback())
    {
        return this._assetHandler.loadAsset(new Audio, path, callback);
    }
    
    loadFont(name, path, callback = this._assetHandler.getDefaultAssetCallback())
    {
        return this._assetHandler.loadFont(name, path, callback);
    }
    
    // Finds the loaded asset with the given file path, and reduces the usage count against it.
    // The asset should stay loaded if there are still entities using it, but if the usage count goes down to 0, this will remove it.
    // (fonts cannot be unloaded)
    releaseAsset(path)
    {
        this._assetHandler.releaseAsset(path);
    }
    
    
    //running the game ---------------------------------------------------------------
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
            this.replaceEngines();
            this.prepareCurrentLevelAndModels();
        }
        
        this._fps = this.getNewFps(dt);
        
        this.updateTotalTime(dt);
        this._lastTime = dt;
        
        if(this.active)
        {
            this._gameEn.run();
            this._graphicEn.run();
            this._soundEn.run();
        }
    }
    
    getNewFps(currentDateTime)
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
    
    updateTotalTime(currentDateTime)
    {
        let timePassed = Math.floor(currentDateTime.getMilliseconds()) - Math.floor(this._lastTime.getMilliseconds());
        
        if(this._active && timePassed >= 1)
        {
            this._totalLevelActiveMilliseconds += timePassed;
        }
    }
    
    // Initiating the game -----------------------------------------------------------------
    initiate()
    {
        this.load();
        this.run();
    }
}