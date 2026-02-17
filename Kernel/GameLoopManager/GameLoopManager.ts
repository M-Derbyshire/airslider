import IAssetHandler from "../AssetHandler/IAssetHandler";
import ILevelQueue from "../LevelQueue/ILevelQueue";
import IGameLoopManager, { GameLoopStatus } from "./IGameLoopManager";

/**
 * Manages the "Game Loop" (the game loop is the processing of entities in the game, followed by the
 * redrawing of the screen, that happens continuously while the game is running)
 */
export default class GameLoopManager implements IGameLoopManager
{
    private _levelQueue:ILevelQueue; // Manages the queue of levels
    private _assetHandler:IAssetHandler; // Loads and manages assets
    
    private _fpsLimit:number; // The maximum FPS that the game should run at
    private _fps:number; // The current Frames Per Second of the game
    private _fpsDisplayColor?:string; // If we want to display the FPS counter, what color should the text be?
    private _highestFpsReached:number; // The highest FPS the game has reached
    private _lastTime:Date; // The date/time that the last frame ran
    
    // The total amount of milliseconds that the level has not been paused or stopped for any reason
    private _totalLevelActiveMilliseconds!:number;
    
    private _status!:GameLoopStatus; // The current status of the game (e.g. is it playing, paused, or in another state)
    private _soundKeysPlayingBeforeLastPause!:string[]; // The keys of the sounds that were playing when the game was last paused
    
    private _onError:(err:any)=>void; // A callback that should be called if there is an error 
    
    /**
     * Constructor
     * @param levelQueue manages the queue of levels
     * @param assetHandler loads and manages assets
     * @param onError a callback that should be called if there is an error
     * @param fpsLimit the maximum FPS that the game should run at
     * @param fpsDisplayColor if we want to display the FPS counter, what color should the text be?
     */
    constructor(
        levelQueue:ILevelQueue,
        assetHandler:IAssetHandler,
        onError:(err:any)=>void,
        fpsLimit:number,
        fpsDisplayColor?:string
    )
    {
        this._levelQueue = levelQueue;
        this._assetHandler = assetHandler;
        this._onError = onError;
        this._fpsLimit = fpsLimit;
        this._fpsDisplayColor = fpsDisplayColor;
        
        this._fps = this._fpsLimit;
        this._highestFpsReached = 0;
        this._lastTime = new Date();
        
        this._prepareForLevelStart();
        this._setupAutoPause();
    }
    
    /**
     * The current status of the game loop (e.g. is it playing, or in another state)
     */
    get status():GameLoopStatus {
        return this._status;
    }
    
    /**
     * The current Frames Per Second of the game
     */
    get fps():number {
        return this._fps;
    }
    
    /**
     * The total amount of milliseconds that the level has not been paused or stopped for any reason
     */
    get totalLevelActiveMilliseconds():number {
        return this._totalLevelActiveMilliseconds;
    }
    
    /**
     * Runs a single iteration of the game loop
     */
    runFrame():void
    {
        const currentDateTime = new Date();
        
        if(!this._shouldFrameRun(currentDateTime))
            return;
        
        try {
            const level = this._levelQueue.currentLevel!;
            
            if(!this._levelQueue.currentLevelHasBeenPrepared)
            {
                this._prepareForLevelStart();
                this._levelQueue.prepareCurrentLevelAndModels();
            }
            
            this._fps = this._getNewFps(currentDateTime);
            this._updateTotalTime(currentDateTime);
            
            this._runEnginesForFrame();
            
            if(this._status === GameLoopStatus.PrePaused)
                this._status = GameLoopStatus.Paused;
            
            // This should always be ran, even if the game is paused
            level.checkForHoverEvents();
            
            this._lastTime = currentDateTime;
        } catch (err:any) 
        {
            this._onError(err);
        }
    }
    
    /**
     * Pauses/unpauses the game (if the current level is pauseable)
     */
    toggleGamePause():void
    {
        const level = this._levelQueue.currentLevel!;
        const soundEngine = this._levelQueue.currentEngines!.soundEngine;
        
        if(level.isPauseable)
        {
            if(this._status === GameLoopStatus.Active)
            {
                this._soundKeysPlayingBeforeLastPause = soundEngine.getPlayingSoundKeys();
                this._soundKeysPlayingBeforeLastPause.forEach(key => soundEngine.pauseSound(key));
                
                this._status = GameLoopStatus.PrePaused;
            }
            else
            {
                this._soundKeysPlayingBeforeLastPause.forEach(key => soundEngine.playSound(key));
                this._status = GameLoopStatus.Active;
            }
        }
    }
    
    /**
     * Sets up any event listeners to pause/unpause the game automatically (e.g. when the user switches tabs)
     */
    private _setupAutoPause():void
    {
        // If the player switches tabs/windows, pause the game
        document.addEventListener("visibilitychange", () => {
            if(document.visibilityState === "hidden" && this._status === GameLoopStatus.Active)
                this.toggleGamePause();
        });
        
        // Unfortunately, if the window is resized we need to unpause the game so that everything can be 
        // redrawn with the new size settings.
        window.addEventListener("resize", () => {
            if(this._status === GameLoopStatus.Paused)
                this.toggleGamePause();
        });
    }
    
    /**
     * Determines if the next frame should be ran
     * @param currentDateTime the current date/time
     * @returns true if the next frame should be ran, false if not
     */
    private _shouldFrameRun(currentDateTime:Date):boolean
    {
        const timeSinceLastFrame = currentDateTime.getTime() - this._lastTime.getTime();
        const currentLevelHasBeenPrepared = this._levelQueue.currentLevelHasBeenPrepared;
        
        const overMaxFpsLimit = timeSinceLastFrame < (1000 / this._fpsLimit);
        const levelStillLoadingAssets = (!currentLevelHasBeenPrepared && this._assetHandler.assetsStillLoading > 0);
        
        return !(overMaxFpsLimit || levelStillLoadingAssets);
    }
    
    /**
     * Runs the necessary engines for the frame
     */
    private _runEnginesForFrame():void
    {
        const { gameEngine, graphicEngine } = this._levelQueue.currentEngines!;
        
        if(this._status !== GameLoopStatus.Paused)
        {
            if(this._status !== GameLoopStatus.PrePaused)
                gameEngine.run();
            
            // This will need to run if we're in the pre-pause state, so we 
            // can re-draw the UI to match (e.g. drawing a play button 
            // instead of a pause button)
            graphicEngine.run(
                this._levelQueue.currentLevel!,
                this._levelQueue.currentModels,
                this._fps,
                this._fpsDisplayColor
            );
        }
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
        
        return (currentFps < (this._highestFpsReached - 20)) ? this._highestFpsReached : currentFps;
    }
    
    /**
     * Updates the count of how long the current level has been active (in milliseconds). This
     * does not include the time that the level is paused
     * @param currentDateTime The current date/time
     */
    private _updateTotalTime(currentDateTime:Date):void
    {
        const timePassed = currentDateTime.getMilliseconds() - this._lastTime.getMilliseconds();
        
        if(this._status !== GameLoopStatus.Paused && timePassed > 0)
            this._totalLevelActiveMilliseconds += timePassed;
    }
    
    /**
     * Gets the manager ready when a new level is about to start
     */
    private _prepareForLevelStart():void
    {
        this._totalLevelActiveMilliseconds = 0;
        this._status = GameLoopStatus.Active;
        this._soundKeysPlayingBeforeLastPause = [];
    }
};