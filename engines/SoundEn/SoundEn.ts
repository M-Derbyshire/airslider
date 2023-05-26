import ISoundEn from './ISoundEn';

/**
 * The engine that controls the sound/music of the game
 */
export default class SoundEn implements ISoundEn {
    
    private _music:HTMLAudioElement;
    private _musicIsPlaying:boolean;
    
    /**
     * Constructor
     */
    constructor()
    {
        this._musicIsPlaying = false;
    }
    
    /**
     * The level's music
     */
    get music() { return this._music; }
    set music(ref:HTMLAudioElement)
    {
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
     * Triggers the playing of the level's music
     */
    playMusic():void
    {
        this._music.play();
        this._musicIsPlaying = true;
    }
    
    /**
     * Pauses the level's music
     */
    pauseMusic():void
    {
        this._music.pause();
        this._musicIsPlaying = false;
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
        ref.currentTime = 0; // Position needs to be reset so sounds will restart if they're triggered mid-way through playing
        ref.muted = false; // Sound may be muted, if it was in the middle of being force-loaded
        ref.loop = loop;
        ref.play();
    }
    
    /**
     * Stops the playing of the given sound
     * @param ref The sound effect to be stopped
     */
    stopSound(ref:HTMLAudioElement):void
    {
        ref.currentTime = 0;
        ref.pause();
    }
    
    /**
     * Forces a sound to be loaded by playing it while muted
     * @param ref The sound to be forced to load
     */
    forceLoad(ref:HTMLAudioElement):void
    {
        const unmute = () => {
            ref.muted = false;
            ref.removeEventListener("ended", unmute);
        };
        
        ref.loop = false;
        ref.muted = true;
        ref.addEventListener("ended", unmute);
        ref.play();
    }
}