import Kernel from "../../../../Kernel/Kernel";
import NeonPidgeon from "./NeonPidgeon";

/**
 * Controls the sound effects for 2 NeonPidgeon models at once, to make sure 
 * their sound effects don't flap over each other.
 */
export default class PidgeonSoundController {
    private _pidgeon1:NeonPidgeon; // The first pidgeon model
    private _pidgeon2:NeonPidgeon; // The second pidgeon model
    
    private _lastFlappingAnimFrameIdx:number; // The index of the previous frame of the flapping animation
    
    /**
     * Constructor
     * @param pidgeon1 The first pidgeon model
     * @param pidgeon2 The second pidgeon model
     */
    constructor(pidgeon1:NeonPidgeon, pidgeon2:NeonPidgeon)
    {
        this._pidgeon1 = pidgeon1;
        this._pidgeon2 = pidgeon2;
        
        this._lastFlappingAnimFrameIdx = 0;
    }
    
    /**
     * Runs the sound effects (Should be called once per frame)
     * @param flapSoundKey the key for the flapping sound effect
     */
    act(flapSoundKey:string):void
    {
        const flappingPidgeon = this._getCurrentlyFlappingPidgeon();
        
        if(flappingPidgeon)
        {
            const flappingAnimFrameIdx = flappingPidgeon.getFlappingAnimation().currentFrameIndex;
            
            // The animation runs at a lower FPS to the rest of the game. We were having a buzzing sound because 
            // the animation frame didn't change for quite a few game frames, so the sound was being repeatedly 
            // restarted.
            // Therefore, we only want to run the sound when the animation frame has actually changed (and the change needs  
            // to be to a larger index -- a change of target pidgeon may cause another buzz if it's smaller).
            const animationChangedFrame = flappingAnimFrameIdx > this._lastFlappingAnimFrameIdx;
            
            // The frame index will always be 0 when off screen, as the animation won't be progressed (since the model won't be drawn),
            // so instead we play the sound every time it's on the second frame
            if(animationChangedFrame && flappingAnimFrameIdx === 1)
                Kernel.getInstance().soundEngine.playSound(flapSoundKey);
            
            this._lastFlappingAnimFrameIdx = flappingAnimFrameIdx;
        }
    }
    
    /**
     * Gets the pidgeon that is currently flapping (or one of them, if both are). This 
     * will return null if none of them are flapping
     * @returns the pidgeon that is flapping (or one of them), or null if none are
     */
    private _getCurrentlyFlappingPidgeon():NeonPidgeon
    {
        if(this._isPidgeonFlapping(this._pidgeon1))
        {
            return this._pidgeon1;
        }
        else if (this._isPidgeonFlapping(this._pidgeon2))
        {
            return this._pidgeon2;
        }
        
        return null;
    }
    
    /**
     * Determines if a pidgeon should be considered "flapping"
     * @param pidgeon the pidgeon to check
     * @returns true if the pidgeon is considered flapping, false if not
     */
    private _isPidgeonFlapping(pidgeon:NeonPidgeon):boolean
    {
        return pidgeon.active && pidgeon.state === "flapping";
    }
};