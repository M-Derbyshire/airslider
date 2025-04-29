import IFrame from "./IFrame";

/**
 * Manages the frames of a level
 */
export default interface IFrameManager {
    /**
     * Sets the frames for the level
     * @param frames The frames to use
     */
    setFrames(frames:IFrame[]):void;
    
    /**
     * Determines which frames should be drawn, and stores that info in the manager's internal 
     * state
     */
    determineFramesToDraw():void;
    
    /**
     * Draws the background-related elements of all of the frames that need to be drawn
     */
    drawFramesBack():void;
    
    /**
     * Draws the foreground-related elements of all of the frames that need to be drawn
     */
    drawFramesFront():void;
};