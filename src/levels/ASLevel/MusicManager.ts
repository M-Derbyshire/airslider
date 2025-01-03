import Kernel from "../../../Kernel/Kernel";
import TimeHelper from "../../../Kernel/utils/TimeHelper";
import { CentralStateKey } from "../CentralStateKey";

/**
 * Manages the music for the level
 */
export default class MusicManager
{
    private _music:HTMLAudioElement; // The chosen music for the level
    private _musicMaxVolume:number; // The volume of the music, when it's not fading in/out
    private _fadeInProcessStartedAtMS:number; // The time (milliseconds) that the fade in process started (negative if it hasn't started)
    private _fadeOutProcessStartedAtMS:number; // The time (milliseconds) that the fade out process started (negative if it hasn't started)
    private _musicStartDelayMS:number; // The delay between the level's movement starting, and the music fading in (in milliseconds)
    private _musicFadeSpeedSeconds:number; // The duration of the music's fade in/out (in seconds)
    
    constructor()
    {
        this._musicFadeSpeedSeconds = 2.5;
        this._musicStartDelayMS = 1500;
    }
    
    /**
     * Chooses the music for the level, and loads it
     * @param musicFilePaths File paths to the available music
     * @returns The file path of the selected music (or null, if one couldn't be selected)
     */
    load(musicFilePaths:string[]):string|null
    {
        const chosenMusicFilePath = this._chooseMusicPath(musicFilePaths);
        if(chosenMusicFilePath)
            this._music = Kernel.getInstance().loadAudio(chosenMusicFilePath);
        
        return chosenMusicFilePath;
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
        
        if(this._music)
        {
            this._music.volume = 0;
            soundEngine.music = this._music;
            soundEngine.musicRepeat = true;
            soundEngine.forceMusicLoad();
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
        if(!musicFilePaths.length)
            return null;
        
        if(musicFilePaths.length === 1)
            return musicFilePaths[0];
        
        const kernel = Kernel.getInstance();
        
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
        // If the level hasn't started moving, we don't need to do anything
        if(!this._music || this._fadeInProcessStartedAtMS < 0)
            return;
        
        const kernel = Kernel.getInstance();
        const soundEngine = kernel.soundEngine;
        
        // Determine what action we need to take (if any)
        const fadeOutProcessStarted = (this._fadeOutProcessStartedAtMS >= 0);
        
        const shouldFadeIn = (
            !fadeOutProcessStarted &&
            this._music.volume < this._musicMaxVolume &&
            kernel.totalLevelActiveMilliseconds > this._fadeInProcessStartedAtMS + this._musicStartDelayMS
        );
        
        const shouldFadeOut = (fadeOutProcessStarted && soundEngine.musicIsPlaying);
        
        if(!shouldFadeIn && !shouldFadeOut)
            return;
        
        // We need to figure out how much to fade the volume by, based on the FPS, to 
        // make sure it's done at the speed we want (we recalculate this every frame, in
        // case the FPS changes).
        const frameCount = TimeHelper.secondsToFrames(this._musicFadeSpeedSeconds);
        const volumeChange = this._musicMaxVolume / frameCount;
        
        // Fade in after the opening + delay
        if(shouldFadeIn)
        {
            if(!soundEngine.musicIsPlaying)
                soundEngine.playMusic();
            
            if(this._music.volume + volumeChange > this._musicMaxVolume)
                this._music.volume = this._musicMaxVolume;
            else
                this._music.volume += volumeChange;
        }
        
        // Fade out on player loss/win
        if(shouldFadeOut)
        {
            if(this._music.volume - volumeChange < 0)
                soundEngine.stopMusic();
            else
                this._music.volume -= volumeChange;
        }
    }
}