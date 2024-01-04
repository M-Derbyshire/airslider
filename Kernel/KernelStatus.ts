/**
 * Represents the possible statuses of the game's Kernel
 */
export enum KernelStatus {
    /**
     * The game is playing
     */
    Active,
    
    /**
     * The game is about to pause.
     * If the game is paused, it may need to draw things to the screen to 
     * tell the player (such as changing the "pause" button to a "play" 
     * button). This status allows that to happen.
     */
    PrePaused,
    
    /**
     * The game is paused
     */
    Paused
};