import Kernel from '/Kernel/kernel';

/**
 * The engine that controls the sound/music of the game
 */
export default class SoundEn{
    
    /**
     * Constructor
     */
    constructor()
    {
        this._kernel = Kernel.getInstance();
        
        this._music;
        this._musicIsPlaying = false;
    }
    
    /**
     * The level's music
     */
    get music() { return this._music; }
    set music(ref)
    {
        this._music = this._kernel.loadedAssets[ref].asset;
    }
    
    /**
     * Should the music be played on repeat?
     */
    get musicRepeat() { return this._music.loop; }
    set musicRepeat(repeat)
    {
        this._music.loop = repeat;
    }
    
    /**
     * Is the level's music currently playing?
     */
    get musicIsPlaying() {return this._musicIsPlaying;}
    
    /**
     * Triggers the playing of the level's music
     */
    playMusic()
    {
        this._music.play();
        this._musicIsPlaying = true;
    }
    
    /**
     * Pauses the level's music
     */
    pauseMusic()
    {
        this._music.pause();
        this._musicIsPlaying = false;
    }
    
    /**
     * Stops the level's music (and sets it back to the start of the audio track)
     */
    stopMusic()
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
    playSound(ref, loop = false)
    {
        //position needs to be reset so sounds will restart
        //if they're triggered mid-way through playing
        this._kernel.loadedAssets[ref].asset.currentTime = 0;
        this._kernel.loadedAssets[ref].asset.loop = loop;
        this._kernel.loadedAssets[ref].asset.play();
    }
    
    /**
     * Stops the playing of the given sound
     * @param ref The sound effect to be stopped
     */
    stopSound(ref)
    {
        //sound position will be reset in playSound() method
        this._kernel.loadedAssets[ref].asset.pause();
    }
}