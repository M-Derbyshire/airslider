import IKernel from "../../../../Kernel/IKernel";
import Kernel from "../../../../Kernel/Kernel";
import NeonPidgeon from "./NeonPidgeon";

/**
 * Controls the sound effects for multiple NeonPidgeon objects at once, to make sure 
 * their sound effects don't flap over each other.
 */
export default class PidgeonSoundController {
    
    private _kernel:IKernel;
    
    private _pidgeon1:NeonPidgeon;
    private _pidgeon2:NeonPidgeon;
    
    private _lastFlappingAnimFrame:number; // The last frame of a flapping animation that we were on 
    
    /**
     * Constructor
     * @param pidgeon1 The first pidgeon instance
     * @param pidgeon2 The second pidgeon instance
     */
    constructor(pidgeon1:NeonPidgeon, pidgeon2:NeonPidgeon)
    {
        this._pidgeon1 = pidgeon1;
        this._pidgeon2 = pidgeon2;
        
        this._lastFlappingAnimFrame = 0;
        
        this._kernel = Kernel.getInstance();
    }
    
    /**
     * Should be called once per frame. Runs the sound effect(s)
     * @param flap the flapping sound effect
     */
    act(flapSound:HTMLAudioElement):void
    {
        // At the moment, we only want to play the sound once, regardless of the pidgeon count
        
        // First, determine if any pidgeons will be playing the sound. If so, which one are we basing the 
        // timing on?
        let flappingPidgeon = null;
        if(this._isPidgeonFlapping(this._pidgeon1)) 
            flappingPidgeon = this._pidgeon1;
        else if (this._isPidgeonFlapping(this._pidgeon2)) 
            flappingPidgeon = this._pidgeon2;
        
        // Now we need to play the flapping sound if the time is right
        if(flappingPidgeon)
        {
            const flappingAnimFrame = flappingPidgeon.getCurrentFlappingFrame();
            
            // The animation runs at a lower FPS to the rest of the game. We were having a buzzing sound because 
            // the current animation frame equaled 1 for quite a few game frames, so was being repeatedly restarted.
            // Therefore, we only want to run the sound when the animation frame has actually changed (and the change is  
            // to something larger -- a change of target pidgeon may cause another buzz if we don't).
            const animationChangedFrame = this._lastFlappingAnimFrame < flappingAnimFrame;
            
            // The frame index will always be 0 when off screen, as the animation won't be progressed (since the model won't be drawn),
            // so play the sound every time it's on the second frame
            if(animationChangedFrame && flappingAnimFrame === 1) 
                this._kernel.soundEn.playSound(flapSound);
                
            this._lastFlappingAnimFrame = flappingAnimFrame;
        }
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