/**
 * The engine that controls the sound/music of the game
 */
export default interface ISoundEngine {
    /**
     * Adds a sound to the engine's library (or replaces an existing sound)
     * @param key a unique key, used to identify the sound
     * @param asset the sound asset to add to the library
     */
    addSound(key:string, asset:HTMLAudioElement):void;

    /**
     * Gets the current status of a sound
     * @param key the key used to identify the sound
     * @returns the current status of the sound, or null if 
     * the sound doesn't exist in the engine's library
     */
    getSoundStatus(key:string):SoundStatus|null;
    
    /**
     * Gets the current volume of a sound
     * @param key the key used to identify the sound
     * @returns the volume of the sound (a number between 0 and 1), or null if 
     * the sound doesn't exist in the engine's library
     */
    getSoundVolume(key:string):number|null;
    
    /**
     * Changes the volume of a sound
     * @param key the key used to identify the sound
     * @param volume a number between 0 and 1, (1 being the top volume, and 0
     * being no volume)
     */
    setSoundVolume(key:string, volume:number):void;

    /**
     * Starts (or unpauses) a sound. If the sound is already playing, this 
     * will restart it
     * @param key the key used to identify the sound
     * @param loop should the sound be looped?
     */
    playSound(key:string, loop?:boolean):void

    /**
     * Pauses a sound
     * @param key the key used to identify the sound
     */
    pauseSound(key:string):void;

    /**
     * Stops a sound
     * @param key the key used to identify the sound
     */
    stopSound(key:string):void;

    /**
     * Stops and resets all of the current sounds
     */
    reset():void;

    /**
     * Forces a sound to be loaded (so it's definitely ready to be played)
     * @param key the key used to identify the sound
     */
    forceSoundToLoad(key:string):void;

    /**
     * Generates an array that contains the keys of all of the sounds 
     * in the engine's library
     * @returns the keys for all of the sounds in the engine's library
     */
    getSoundKeys():string[];
    
    /**
     * Generates an array that contains the keys of the currently 
     * playing sounds
     * @returns the keys of the currently playing sounds
     */
    getPlayingSoundKeys():string[];
};

/**
 * The possible statuses of a sound
 */
enum SoundStatus {
    Playing,
    Paused,
    Stopped,
    ForceLoading
}

export { SoundStatus };