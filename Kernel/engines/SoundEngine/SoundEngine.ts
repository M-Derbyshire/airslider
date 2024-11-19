import { KernelStatus } from '../../IKernel';
import Kernel from '../../Kernel';
import ISoundEngine from './ISoundEngine';

/**
 * The engine that controls the sound/music of the game
 */
export default class SoundEngine implements ISoundEngine {
    private _music:HTMLAudioElement; // The level's music
    private _musicIsPaused:boolean; // Has the level's music been explictly paused (not true if it has been stopped)
    private _musicIsLooped:boolean; // Is the level's music being looped?
    
    // The sounds we're currently playing (not including music, or sounds that are force-loading)
    private _currentSounds:Map<string, HTMLAudioElement>;
    
    /**
     * Constructor
     */
    constructor()
    {
        this._currentSounds = new Map<string, HTMLAudioElement>();
        this._musicIsPaused = false;
        this._musicIsLooped = false;
    }
    
    /**
     * The level's music
     */
    get music()
    {
        return this._music;
    }
    set music(newValue:HTMLAudioElement)
    {
        this._music = newValue;
        this._music.loop = this._musicIsLooped;
        this._musicIsPaused = false;
    }
    
    /**
     * Should the music be played on repeat?
     */
    get musicRepeat()
    {
        return this._musicIsLooped;
    }
    set musicRepeat(newValue:boolean)
    {
        this._musicIsLooped = newValue;
        
        if(this._music)
            this._music.loop = newValue;
    }
    
    /**
     * Is the level's music currently playing?
     */
    get musicIsPlaying()
    {
        return !!this._music && !this._music.paused && !this._music.muted;
    }
    
    /**
     * Has the level's music been explictly paused (not true if it has been stopped)
     */
    get musicIsPaused()
    {
        return this._musicIsPaused;
    }
    
    /**
     * Runs a check to see what playing sounds have now finished, and 
     * updates the engine's state accordingly
     */
    run():void
    {
        this._currentSounds.forEach((sound, key, map) => {
            if(sound.ended && !sound.loop) 
                map.delete(key);
        });
    }
    
    /**
     * Triggers the playing of the level's music
     */
    playMusic():void
    {
        if(this._music)
        {
            if(!this._musicIsPaused)
                this._music.currentTime = 0;
            
            this._music.muted = false; // The music may have been muted by the forceMusicLoad method
            this._musicIsPaused = false;
            
            this._music.play();
        }
    }
    
    /**
     * Pauses the level's music
     */
    pauseMusic():void
    {
        if(this._music)
        {
            this._music.pause();
            this._musicIsPaused = true;
        }
    }
    
    /**
     * Stops the level's music (and sets it back to the start of the audio track)
     */
    stopMusic():void
    {
        if(this._music)
        {
            this._music.pause();
            this._music.currentTime = 0;
        }
        
        this._musicIsPaused = false;
    }
    
    /**
     * Plays the given sound
     * @param sound The sound effect to be played
     * @param loop Should this sound effect be played on repeat?
     */
    playSound(sound:HTMLAudioElement, loop:boolean = false):void
    {
        const kernel = Kernel.getInstance();
        
        sound.currentTime = 0; // Position needs to be reset so sounds will restart if they're triggered mid-way through playing
        sound.muted = false; // Sound may be muted, if it was in the middle of being force-loaded
        sound.loop = loop;
        
        this._currentSounds.set(sound.src, sound);
        
        if(kernel.status === KernelStatus.Active)
            sound.play();
    }
    
    /**
     * Stops the playing of the given sound (and sets it back to the start of the audio track)
     * @param sound The sound effect to be stopped
     */
    stopSound(sound:HTMLAudioElement):void
    {
        this._currentSounds.delete(sound.src);
        sound.currentTime = 0;
        sound.pause();
    }
    
    /**
     * Pauses all sounds that the engine has triggered
     */
    pauseAllSounds():void
    {
        this._currentSounds.forEach(sound => sound.pause());
    }
    
    /**
     * Continues playing (after pausing) all sounds the engine has triggered
     */
    unpauseAllSounds():void
    {
        this._currentSounds.forEach(sound => {
            if(!sound.ended || sound.loop)
                sound.play();
        });
    }
    
    /**
     * Stops all sounds, and resets their current time back to 0
     */
    stopAllSounds():void
    {
        this._currentSounds.forEach(sound => this.stopSound(sound));
    }
    
    /**
     * Forces a sound to be loaded by playing it while muted
     * @param sound The sound to be forced to load
     */
    forceSoundLoad(sound:HTMLAudioElement):void
    {
        const eventListenerType = "ended";
        
        const unmute = () => {
            sound.muted = false;
            sound.removeEventListener(eventListenerType, unmute);
        };
        sound.addEventListener(eventListenerType, unmute);
        
        sound.currentTime = 0;
        sound.loop = false;
        sound.muted = true;
        
        sound.play();
    }
    
    /**
     * Forces the music to be loaded by playing it while muted
     */
    forceMusicLoad():void
    {
        if(this._music)
        {
            this._music.currentTime = 0;
            this._music.muted = true;
            this._musicIsPaused = false;
            this._music.play();
        }
    }
}