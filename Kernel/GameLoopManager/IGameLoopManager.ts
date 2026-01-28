/**
 * Manages the "Game Loop" (the game loop is the processing of entities in the game, followed by the
 * redrawing of the screen, that happens continuously while the game is running)
 */
export default interface IGameLoopManager
{
    /**
     * The current status of the game loop (e.g. is it playing, or in another state)
     */
    readonly status:GameLoopStatus;
    
    /**
     * The current Frames Per Second of the game
     */
    readonly fps:number;
    
    /**
     * The total amount of milliseconds that the level has not been paused or stopped for any reason
     */
    readonly totalLevelActiveMilliseconds:number;
    
    /**
     * Runs a single iteration of the game loop
     */
    runFrame():void;
    
    /**
     * Pauses/unpauses the game (if the current level is pauseable)
     */
    toggleGamePause():void;
};

/**
 * Represents the possible statuses of the game loop
 */
export enum GameLoopStatus {
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