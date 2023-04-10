/**
 * The engine that controls the sound/music of the game
 */
export default interface ISoundEn {
    
    /**
     * The level's music
     */
    music:HTMLAudioElement;
    
    /**
     * Should the music be played on repeat?
     */
    musicRepeat:boolean;
    
    /**
     * Is the level's music currently playing?
     */
    readonly musicIsPlaying:boolean;
    
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
     * @param ref The sound effect to be played
     * @param loop Should this sound effect be played on repeat
     */
    playSound(ref:HTMLAudioElement, loop?:boolean):void;
    
    /**
     * Stops the playing of the given sound
     * @param ref The sound effect to be stopped
     */
    stopSound(ref:HTMLAudioElement):void;
    
};