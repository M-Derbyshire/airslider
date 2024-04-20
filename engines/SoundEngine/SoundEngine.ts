import IKernel from '../../Kernel/IKernel';
import Kernel from '../../Kernel/Kernel';
import { KernelStatus } from '../../Kernel/KernelStatus';
import ISoundEngine from './ISoundEngine';

/**
 * The engine that controls the sound/music of the game
 */
export default class SoundEngine implements ISoundEngine {
    
    private _kernel:IKernel;
    
    private _music:HTMLAudioElement; // The level's music
    
    // The sounds we're currently playing (not including music, or sounds that are force-loading)
    private _currentSounds:Map<string, HTMLAudioElement>;
    
    private _audioContextClass:new()=>AudioContext; // The class to use for the audio context
    private _audioContext:AudioContext; // Manages the audio processing
    private _trackMap:Map<string, MediaElementAudioSourceNode>; // A map of tracks from the AudioContext
    
    /**
     * Constructor
     * @param audioContextClass The class to use to instantiate an AudioContext (Which manages the audio processing). We 
     * don't want to create an AudioContext before the user has interacted with the tab, as the browser will not allow 
     * it to trigger any sound. This will be used to instantiate the AudioContext at a later time.
     */
    constructor(audioContextClass:new()=>AudioContext)
    {
        this._kernel = Kernel.getInstance();
        
        this._currentSounds = new Map<string, HTMLAudioElement>();
        this._trackMap = new Map<string, MediaElementAudioSourceNode>();
        
        this._audioContextClass = audioContextClass;
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
        this._setupAudioContextTrack(newValue);
        this._music = newValue;
    }
    
    /**
     * Should the music be played on repeat? (The music must be set before this can be set, and 
     * this will need to be set again whenever changing the music)
     */
    get musicRepeat()
    {
        return (this._music) ? this._music.loop : false 
    }
    set musicRepeat(newValue:boolean)
    {
        if(this._music)
            this._music.loop = newValue;
    }
    
    /**
     * Is the level's music currently playing?
     */
    get musicIsPlaying()
    {
        return !this._music.paused && !this._music.muted;
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
            this._music.play();
    }
    
    /**
     * Pauses the level's music
     */
    pauseMusic():void
    {
        if(this._music)
            this._music.pause();
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
    }
    
    /**
     * Plays the given sound
     * @param sound The sound effect to be played
     * @param loop Should this sound effect be played on repeat?
     */
    playSound(sound:HTMLAudioElement, loop:boolean = false):void
    {
        this._setupAudioContextTrack(sound);
        
        sound.currentTime = 0; // Position needs to be reset so sounds will restart if they're triggered mid-way through playing
        sound.muted = false; // Sound may be muted, if it was in the middle of being force-loaded
        sound.loop = loop;
        
        this._currentSounds.set(sound.src, sound);
        
        if(this._kernel.status === KernelStatus.Active)
            sound.play();
    }
    
    /**
     * Stops the playing of the given sound
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
     * Forces a sound to be loaded by playing it while muted
     * @param sound The sound to be forced to load
     */
    forceLoad(sound:HTMLAudioElement):void
    {
        this._setupAudioContextTrack(sound);
        
        const eventListenerType = "ended";
        
        const unmute = () => {
            sound.muted = false;
            sound.removeEventListener(eventListenerType, unmute);
        };
        
        sound.loop = false;
        sound.muted = true;
        sound.addEventListener(eventListenerType, unmute);
        sound.play();
    }
    
    /**
     * Release any resources the engine is using (to be used when unloading the level)
     */
    teardown():void
    {
        if(this._audioContext)
            this._audioContext.close();
        
        this._trackMap.forEach(track => track.disconnect());
    }
    
    /**
     * Sets up an audio source in the AudioContext (if it has not been done already for the given audio)
     * @param audio the audio source
     */
    private _setupAudioContextTrack(audio:HTMLAudioElement)
    {
        if(!this._trackMap.has(audio.src))
        {
            if(!this._audioContext)
                this._instantiateAudioContext();
            
            const track = this._audioContext.createMediaElementSource(audio);
            track.connect(this._audioContext.destination);
            this._trackMap.set(audio.src, track);
        }
    }
    
    /**
     * This instantiates and stores a new AudioContext object
     */
    private _instantiateAudioContext()
    {
        this._audioContext = new this._audioContextClass();
        
        if (this._audioContext.state === "suspended") 
            this._audioContext.resume();
    }
}