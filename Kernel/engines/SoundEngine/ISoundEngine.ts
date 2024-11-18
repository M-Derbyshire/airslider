/**
 * The engine that controls the sound/music of the game
 */
export default interface ISoundEngine {
    /**
     * The level's music
     */
    music:HTMLAudioElement;
    
    /**
     * Should the music be played on repeat? (The music must be set before this can be set, and 
     * this will need to be set again whenever changing the music)
     */
    musicRepeat:boolean;
    
    /**
     * Is the level's music currently playing?
     */
    readonly musicIsPlaying:boolean;
    
    /**
     * Runs a check to see what playing sounds have now finished, and 
     * updates the engine's state accordingly
     */
    run():void;
    
    /**
     * Triggers the playing of the level's music
     */
    playMusic():void;
    
    /**
     * Pauses the level's music
     */
    pauseMusic():void;
    
    /**
     * Stops the level's music (and sets it back to the start of the audio track)
     */
    stopMusic():void;
    
    /**
     * Plays the given sound
     * @param sound The sound effect to be played
     * @param loop Should this sound effect be played on repeat?
     */
    playSound(sound:HTMLAudioElement, loop?:boolean):void;
    
    /**
     * Stops the playing of the given sound (and sets it back to the start of the audio track)
     * @param sound The sound effect to be stopped
     */
    stopSound(sound:HTMLAudioElement):void;
    
    /**
     * Pauses all sounds the engine has triggered
     */
    pauseAllSounds():void;
    
    /**
     * Continues playing (after pausing) all sounds the engine has triggered
     */
    unpauseAllSounds():void;
    
    /**
     * Stops all sounds, and resets their current time back to 0
     */
    stopAllSounds():void;
    
    /**
     * Forces a sound to be loaded by playing it while muted
     * @param sound The sound to be forced to load
     */
    forceLoad(sound:HTMLAudioElement):void;
};