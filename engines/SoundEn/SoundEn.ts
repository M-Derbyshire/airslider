import IKernel from '../../Kernel/IKernel';
import Kernel from '../../Kernel/Kernel';
import { KernelStatus } from '../../Kernel/KernelStatus';
import ISoundEn from './ISoundEn';

/**
 * The engine that controls the sound/music of the game
 */
export default class SoundEn implements ISoundEn {
    
    private _kernel:IKernel;
    
    private _music:HTMLAudioElement;
    private _musicIsPlaying:boolean;
    
    // The sounds we're currently playing (not including music, or sounds that are force-loading)
    private _currentSounds:Map<string, HTMLAudioElement>;
    
    private _audioContext:AudioContext;
    private _trackMap:Map<string, MediaElementAudioSourceNode>; // A map of tracks from the AudioContext
    
    /**
     * Constructor
     */
    constructor()
    {
        this._kernel = Kernel.getInstance();
        
        this._musicIsPlaying = false;
        
        this._currentSounds = new Map<string, HTMLAudioElement>();
        this._trackMap = new Map<string, MediaElementAudioSourceNode>();
        
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this._audioContext = new AudioContext();
        
        if (this._audioContext.state === "suspended") this._audioContext.resume();
    }
    
    /**
     * The level's music
     */
    get music() { return this._music; }
    set music(ref:HTMLAudioElement)
    {
        this._setupContextTrack(ref);
        this._music = ref;
    }
    
    /**
     * Should the music be played on repeat? (music must be set before this can be set, and will need to be set whenever changing the music)
     */
    get musicRepeat() { return (this._music) ? this._music.loop : false }
    set musicRepeat(repeat)
    {
        if(this._music)
            this._music.loop = repeat;
    }
    
    /**
     * Is the level's music currently playing?
     */
    get musicIsPlaying() {return this._musicIsPlaying;}
    
    /**
     * Runs a check to see what playing sounds have now finished, and 
     * updates the engine's state accordingly
     */
    run():void
    {
        this._currentSounds.forEach((ref, key, map) => {
            if(ref.ended && !ref.loop) 
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
            this._music.play();
            this._musicIsPlaying = true;
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
            this._musicIsPlaying = false;
        }
    }
    
    /**
     * Pauses all sounds the engine has triggered
     */
    pauseAllSounds():void
    {
        this._currentSounds.forEach(ref => ref.pause());
    }
    
    /**
     * Continues playing (after pausing) all sounds the engine has triggered
     */
    unpauseAllSounds():void
    {
        this._currentSounds.forEach(ref => {
            if(!ref.ended || ref.loop)
                ref.play();
        });
    }
    
    /**
     * Stops the level's music (and sets it back to the start of the audio track)
     */
    stopMusic():void
    {
        this._music.pause();
        this._music.currentTime = 0;
        this._musicIsPlaying = false;
    }
    
    /**
     * Plays the given sound
     * @param ref The sound effect to be played
     * @param loop Should this sound effect be played on repeat
     */
    playSound(ref:HTMLAudioElement, loop:boolean = false):void
    {
        this._setupContextTrack(ref);
        
        ref.currentTime = 0; // Position needs to be reset so sounds will restart if they're triggered mid-way through playing
        ref.muted = false; // Sound may be muted, if it was in the middle of being force-loaded
        ref.loop = loop;
        
        this._currentSounds.set(ref.src, ref);
        
        if(this._kernel.status === KernelStatus.Active)
        {
            ref.play();
        }
    }
    
    /**
     * Stops the playing of the given sound
     * @param ref The sound effect to be stopped
     */
    stopSound(ref:HTMLAudioElement):void
    {
        this._currentSounds.delete(ref.src);
        ref.currentTime = 0;
        ref.pause();
    }
    
    /**
     * Forces a sound to be loaded by playing it while muted
     * @param ref The sound to be forced to load
     */
    forceLoad(ref:HTMLAudioElement):void
    {
        this._setupContextTrack(ref);
        
        const unmute = () => {
            ref.muted = false;
            ref.removeEventListener("ended", unmute);
        };
        
        ref.loop = false;
        ref.muted = true;
        ref.addEventListener("ended", unmute);
        ref.play();
    }
    
    
    private _setupContextTrack(ref:HTMLAudioElement)
    {
        if(!this._trackMap.has(ref.src))
        {
            const track = this._audioContext.createMediaElementSource(ref);
            track.connect(this._audioContext.destination);
            this._trackMap.set(ref.src, track);
        }
    }
}