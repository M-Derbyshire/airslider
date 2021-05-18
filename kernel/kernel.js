import AssetHandler from './AssetHandler';
import GameEn from '/engines/GameEn/GameEn';
import GraphicEn from '/engines/GraphicEn/GraphicEn';
import MenuEn from '/engines/MenuEn/MenuEn';
import SoundEn from '/engines/SoundEn/SoundEn';
import TimeHelper from '/helpers/TimeHelper';
import UnitHelper from '/helpers/UnitHelper';
import ZCalc from '/helpers/zCalc';
import Camera from '/engines/GraphicEn/Camera';
import FrameManager from '/engines/GraphicEn/FrameManager';
import settings from '/settings/settings';

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
        this._fpsLimit = (!isNaN(settings.fpsLimit)) ? settings.fpsLimit : 70;
        this._lastTime = new Date(); //used when calculating fps and enforcing fps limit
        
		//how many drawSpace x/y units are there within the camera's size
        this.unitsWithinCamera = (!isNaN(settings.unitsWithinCamera)) ? settings.unitsWithinCamera : 1000;
        
        this._totalActiveMilliseconds = 0; //total ms that the game has not been paused or stopped for any reason
        this._totalInactiveMilliseconds = 0;
        this._active = true;
        
        const filePath = window.location.pathname;
        this._rootPath = filePath.substring(0, filePath.lastIndexOf('/'));
        
        this.loadedModels = []; //will hold all models loaded during loading
        this._assetHandler = new AssetHandler(this._rootPath);
        
        this._level;
        this._gameEn;
        this._graphicEn;
        this._soundEn;
        this._menuEn;
        
        this._helpers;
		
		this._gameCanvasElementID = settings.gameCanvasElementID;
		this._gameCanvas = document.getElementById(this.gameCanvasElementID);
		this._gameContext = this.gameCanvas.getContext("2d");
    }
    
    //getters and setters ----------------------------------------------------------------------
    get isOnMobile(){return this._isOnMobile;}
    
    get fps(){return this._fps;}
    
    get fpsLimit(){return this._fpsLimit;}
    
    get totalActiveMilliseconds(){return this._totalActiveMilliseconds;}
    get totalInactiveMilliseconds(){return this._totalInactiveMilliseconds;}
    
    get active(){return this._active;}
    set active(newVal){this._active = newVal;}
    
    get rootPath(){return this._rootPath;}
    
    get helpers() {return this._helpers;}
    
    get level(){return this._level;}
    set level(newVal){this._level = newVal;}
    
    get loadedAssets(){return this._assetHandler.loadedAssets;}
    get assetHandler(){return this._assetHandler;}
    
    get gameEn(){return this._gameEn;}
    
    get graphicEn(){return this._graphicEn;}
    
    get soundEn(){return this._soundEn;}
    
    get menuEn(){return this._menuEn;}
	
	get gameCanvasElementID(){return this._gameCanvasElementID;}
	get gameCanvas(){return this._gameCanvas;}
	get gameContext(){return this._gameContext;}
    
    
    // loading methods --------------------------------------------------------------------------
    load()
    {
        this._helpers = {
            zCalc: new ZCalc(this.unitsWithinCamera),
            time: new TimeHelper(),
            unit: new UnitHelper(this.unitsWithinCamera)
        };
    }
    
    loadLevel(Level)
    {
        this.level = Level;
        
        //get models here so they can be picked up by the engines
        this.loadedModels = this.level.getModels();
		
		//setup controls
		const controlInitialiser = new settings.controlsInitialiserClass();
		controlInitialiser.initialiseControls();
		
		const aspectRatioHorizontal = (!isNaN(settings.aspectRatioHorizontal)) ? settings.aspectRatioHorizontal : 17;
		const aspectRatioVertical = (!isNaN(settings.aspectRatioVertical)) ? settings.aspectRatioVertical : 9;
		const camera = new Camera(this.gameCanvas, this.gameContext, aspectRatioHorizontal, aspectRatioVertical);
		const frameManager = new FrameManager(camera);
        
        this._gameEn = new GameEn();
        this._graphicEn = new GraphicEn(this.gameCanvas, this.gameContext, camera, frameManager);
        this._soundEn = new SoundEn();
        this._menuEn = new MenuEn();
        
        //do any extra setup that may need access to the engines
        this.level.load(this.gameCanvas, this.gameContext, this._graphicEn.camera, this._graphicEn.frameManager);
        this.level.loadHUD(this.gameContext, this._graphicEn.camera);
        for(let i = 0; i < this.loadedModels.length; i++)
        {
            this.loadedModels[i].loadedIndex = i;
            this.loadedModels[i].load(this.level.leftEdge, this.level.rightEdge);
            this.loadedModels[i].loadAnimationsManager(this.gameContext, this._graphicEn.camera);
        }
    }
    
    loadImage(path, callback = this._assetHandler.getDefaultAssetCallback())
    {
        return this._assetHandler.loadAsset(new Image, path, callback);
    }
    
    loadAudio(path, callback = this._assetHandler.getDefaultAssetCallback())
    {
        return this._assetHandler.loadAsset(new Audio, path, callback);
    }
    
    
    //running the game ---------------------------------------------------------------
    run()
    {
        requestAnimationFrame(this.run.bind(this));
        
        //don't run unless it's time for next frame
        let dt = new Date();
        if((dt.getTime() - this._lastTime.getTime()) < (1000 / this._fpsLimit) || this._assetHandler.assetsStillLoading > 0)
        {
            return;
        }
        
        this._fps = 1000 / (dt.getTime() - this._lastTime.getTime());
        
        this.updateTotalTime(dt);
        this._lastTime = dt;
        
        if(this.active)
        {
            this._gameEn.run();
            this._graphicEn.run();
            this._soundEn.run();
        }
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
        
        if(timePassed >= 1)
        {
            if(this._active)
            {
                this._totalActiveMilliseconds += timePassed;
            }
            else
            {
                this._totalInactiveMilliseconds += timePassed;
            }
        }
    }
}