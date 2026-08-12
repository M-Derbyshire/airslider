import { SoundStatus } from "../../../Kernel/engines/SoundEngine/ISoundEngine";
import Kernel from "../../../Kernel/Kernel";
import TimeHelper from "../../../Kernel/utils/TimeHelper";
import { CentralStateKey } from "../CentralStateKey";

/**
 * Manages the music for the level
 */
export default class MusicManager
{
    private _musicFilePath:string; // The filepath of the chosen music for the level
    private _musicAsset!:HTMLAudioElement; // The chosen music audio asset
    private _musicMaxVolume:number; // The volume of the music, when it's not fading in/out
    private _fadeInProcessStartedAtMS:number; // The time (milliseconds) that the fade in process started (negative if it hasn't started)
    private _fadeOutProcessStartedAtMS:number; // The time (milliseconds) that the fade out process started (negative if it hasn't started)
    private _musicStartDelayMS:number; // The delay between the level's movement starting, and the music fading in (in milliseconds)
    private _musicFadeSpeedSeconds:number; // The duration of the music's fade in/out (in seconds)
    
    /**
     * Constructor
     */
    constructor()
    {
        this._musicFadeSpeedSeconds = 2.5;
        this._musicStartDelayMS = 1500;
        this._fadeInProcessStartedAtMS = -1;
        this._fadeOutProcessStartedAtMS = -1;
        
        this._musicFilePath = "";
        this._musicMaxVolume = 0;
    }
    
    /**
     * Chooses the music for the level, and loads it
     * @param musicFilePaths File paths to the available music
     * @returns The file path of the selected music (or null, if one couldn't be selected)
     */
    load(musicFilePaths:string[]):string|null
    {
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const chosenPath = this._chooseMusicPath(musicFilePaths);
        if(chosenPath)
        {
            this._musicAsset = assetHandler.loadAudio(chosenPath);
            this._musicFilePath = chosenPath;
        }
        
        return chosenPath;
    }
    
    /**
     * Prepares the music, before the level starts
     * @param volume the maximum volume of the music
     */
    prepare(volume:number)
    {
        const soundEngine = Kernel.getInstance().soundEngine;
        
        this._fadeInProcessStartedAtMS = -1;
        this._fadeOutProcessStartedAtMS = -1;
        
        this._musicMaxVolume = volume;
        
        if(this._musicFilePath)
        {
            soundEngine.addSound(this._musicFilePath, this._musicAsset);
            soundEngine.setSoundVolume(this._musicFilePath, 0);
            soundEngine.forceSoundToLoad(this._musicFilePath);
        }
    }
    
    /**
     * Runs any actions that should occur every frame
     */
    act()
    {
        this._fadeMusic();
    }
    
    /**
     * Tells the manager that the fade-in process can start
     */
    startFadeInProcess()
    {
        this._fadeInProcessStartedAtMS = Kernel.getInstance().totalLevelActiveMilliseconds;
    }
    
    /**
     * Tells the manager that the fade-out process can start
     */
    startFadeOutProcess()
    {
        this._fadeOutProcessStartedAtMS = Kernel.getInstance().totalLevelActiveMilliseconds;
    }
    
    
    /**
     * Chooses the music filepath from the array of music filepaths, and returns it.
     * This will set the music filepath in the Kernel's centralState map, so it 
     * can ensure that the next level doesn't select the same music (if 
     * multiple paths are available).
     * If no filepaths are availble, this will return null.
     */
    private _chooseMusicPath(musicFilePaths:string[]):string|null
    {
        const kernel = Kernel.getInstance();

        if(!musicFilePaths.length)
            return null;
        
        if(musicFilePaths.length === 1) {
            kernel.centralState.set(CentralStateKey.LastMusicSelectedPath, musicFilePaths[0]);
            return musicFilePaths[0];
        }
        
        // We want to filter out the filepath used by the previous level
        const selectableFilePaths = musicFilePaths.filter(
            filepath => filepath !== kernel.centralState.get(CentralStateKey.LastMusicSelectedPath)
        );
        
        // Now choose a random path
        const lastIndex = selectableFilePaths.length - 1;
        const indexToSelect = Math.round(
            Math.random() * lastIndex
        );
        
        const chosenPath = selectableFilePaths[indexToSelect];

        kernel.centralState.set(CentralStateKey.LastMusicSelectedPath, chosenPath);
        return chosenPath;
    }
    
    /**
     * Fades the music in/out, depending on the status of the level
     */
    private _fadeMusic():void
    {
        if(!this._readyToPlayMusic())
            return;
        
        const soundEngine = Kernel.getInstance().soundEngine;
        
        const currentVolume = soundEngine.getSoundVolume(this._musicFilePath)!;
        const musicStatus = soundEngine.getSoundStatus(this._musicFilePath);
        const musicIsPlaying = musicStatus === SoundStatus.Playing;
        
        const shouldFadeOut = musicIsPlaying && this._fadeOutProcessStartedAtMS >= 0;
        const shouldFadeIn = !shouldFadeOut && currentVolume < this._musicMaxVolume;
        
        if(!shouldFadeIn && !shouldFadeOut)
            return;
        
        if(shouldFadeIn && !musicIsPlaying)
            soundEngine.playSound(this._musicFilePath, true);
        
        let volumeChange = this._calculateVolumeChange();
        if(shouldFadeOut)
            volumeChange = -volumeChange;
        
        this._changeVolume(volumeChange);
    }
    
    /**
     * Should the music be playing now?
     * @returns true if we should be playing the music, false if not
     */
    private _readyToPlayMusic():boolean
    {
        if(!this._musicFilePath || this._fadeInProcessStartedAtMS < 0)
            return false;
        
        const levelActiveMs = Kernel.getInstance().totalLevelActiveMilliseconds;
        
        const musicStartTimeMS = this._fadeInProcessStartedAtMS + this._musicStartDelayMS;
        
        return levelActiveMs > musicStartTimeMS;
    }
    
    /**
     * Calculates how much the volume should be changed by (based on the game's current 
     * FPS)
     * @returns the correct value to change the music's volume by
     */
    private _calculateVolumeChange():number
    {
        const frameCount = TimeHelper.secondsToFrames(this._musicFadeSpeedSeconds);
        return this._musicMaxVolume / frameCount;
    }
    
    /**
     * Changes the volume of the music
     * @param change the amount to change the volume by
     */
    private _changeVolume(change:number):void
    {
        const soundEngine = Kernel.getInstance().soundEngine;
        
        const currentVolume = soundEngine.getSoundVolume(this._musicFilePath)!;
        let newVolume = currentVolume + change;
        
        if(newVolume < 0)
        {
            soundEngine.stopSound(this._musicFilePath);
            return;
        }
        
        if(newVolume > this._musicMaxVolume)
            newVolume = this._musicMaxVolume;
        
        soundEngine.setSoundVolume(this._musicFilePath, newVolume);
    }
}