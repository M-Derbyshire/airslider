import ISoundEngine, { SoundStatus } from './ISoundEngine';

/**
 * The engine that controls the sound/music of the game
 */
export default class SoundEngine implements ISoundEngine {
    private _sounds:Map<string, ISound>;
    
    private _onErrorCallback:(err:any)=>void;
    
    /**
     * Constructor
     * @param onErrorCallback a callback to trigger if an error occurs
     */
    constructor(onErrorCallback:(err:any)=>void)
    {
        this._onErrorCallback = onErrorCallback;
        
        this._sounds = new Map<string, ISound>();
    }
    
    /**
     * Adds a sound to the engine's library (or replaces an existing sound)
     * @param key a unique key, used to identify the sound
     * @param asset the sound asset to add to the library
     */
    addSound(key:string, asset:HTMLAudioElement):void
    {
        const sound:ISound = {
            asset,
            status: SoundStatus.Stopped
        };
        
        this._sounds.set(key, sound);
        this._resetSound(sound);
        this._addEventListenersToSound(sound);
    }
    
    /**
     * Gets the current status of a sound
     * @param key the key used to identify the sound
     * @returns the current status of the sound, or null if 
     * the sound doesn't exist in the engine's library
     */
    getSoundStatus(key:string):SoundStatus|null
    {
        const sound = this._sounds.get(key);
        if(!sound)
            return null;
        
        return sound.status;
    }
    
    /**
     * Gets the current volume of a sound
     * @param key the key used to identify the sound
     * @returns the volume of the sound (a number between 0 and 1), or null if 
     * the sound doesn't exist in the engine's library
     */
    getSoundVolume(key:string):number|null
    {
        const sound = this._sounds.get(key);
        if(!sound)
            return null;
        
        return sound.asset.volume;
    }

    /**
     * Changes the volume of a sound
     * @param key the key used to identify the sound
     * @param volume a number between 0 and 1, (1 being the top volume, and 0
     * being no volume)
     */
    setSoundVolume(key:string, volume:number):void
    {
        const sound = this._sounds.get(key);
        if(!sound)
            return;
        
        sound.asset.volume = volume;
    }

    /**
     * Starts (or unpauses) a sound. If the sound is already playing, this 
     * will restart it
     * @param key the key used to identify the sound
     * @param loop should the sound be looped?
     */
    playSound(key:string, loop:boolean = false):void
    {
        const sound = this._sounds.get(key);
        if(!sound)
            return;
        
        let newLoopValue = loop;
        
        if(sound.status === SoundStatus.Paused)
            newLoopValue = sound.asset.loop;
        else if(sound.status !== SoundStatus.Stopped)
            this._resetSound(sound);
        
        sound.asset.loop = newLoopValue;
        sound.asset.play()
            .catch(err => {
                // If pause is called on the asset before this promise
                // has resolved, an "AbortError" will be thrown. We just
                // want to catch and swallow it here.
                if(err.name !== "AbortError")
                    this._onErrorCallback(err);
            });
        
        sound.status = SoundStatus.Playing;
    }

    /**
     * Pauses a sound
     * @param key the key used to identify the sound
     */
    pauseSound(key:string):void
    {
        const sound = this._sounds.get(key);
        if(!sound)
            return;
        
        sound.asset.pause();
        
        sound.status = SoundStatus.Paused;
    }

    /**
     * Stops a sound
     * @param key the key used to identify the sound
     */
    stopSound(key:string):void
    {
        const sound = this._sounds.get(key);
        if(!sound)
            return;
        
        this._resetSound(sound);
    }

    /**
     * Stops and resets all of the current sounds
     */
    reset():void
    {
        for (const sound of this._sounds.values())
            this._resetSound(sound);
    }

    /**
     * Forces a sound to be loaded (so it's definitely ready to be played)
     * @param key the key used to identify the sound
     */
    forceSoundToLoad(key:string):void
    {
        const sound = this._sounds.get(key);
        if(!sound)
            return;
        
        sound.asset.currentTime = 0;
        sound.asset.muted = true;
        sound.asset.play();
        
        sound.status = SoundStatus.ForceLoading;
    }

    /**
     * Generates an array that contains the keys of all of the sounds 
     * in the engine's library
     * @returns the keys for all of the sounds in the engine's library
     */
    getSoundKeys():string[]
    {
        return [...this._sounds.keys()];
    }
    
    /**
     * Generates an array that contains the keys of the currently 
     * playing sounds
     * @returns the keys of the currently playing sounds
     */
    getPlayingSoundKeys():string[]
    {
        return this.getSoundKeys().filter(key => {
            const status = this._sounds.get(key)!.status;
            return status === SoundStatus.Playing;
        });
    }
    
    /**
     * Resets a sound, placing it in the Stopped state
     * @param sound the sound to reset
     */
    private _resetSound(sound:ISound):void
    {
        sound.status = SoundStatus.Stopped;
        
        sound.asset.pause();
        sound.asset.muted = false;
        sound.asset.currentTime = 0;
        sound.asset.loop = false;
    }
    
    /**
     * Sets up the required event listeners on the given sound
     * @param sound the sound that needs the event listeners
     */
    private _addEventListenersToSound(sound:ISound):void
    {
        sound.asset.addEventListener("ended", () => this._resetSound(sound));
    }
}

/**
 * A sound asset, and information related to it 
 */
interface ISound {
    asset:HTMLAudioElement;
    status:SoundStatus;
}