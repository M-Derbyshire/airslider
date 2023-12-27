import IFrame from "./IFrame";

/**
 * Manages the frames of a level
 */
export default interface IFrameManager {
    /**
     * Adds a frame to the level
     * @param frame The frame to add
     * @returns The index of the frame, in the manager's internal array
     */
    addFrame(frame:IFrame):number;
    
    /**
     * Gets a frame from the manager's internal array
     * @param index The index of the frame, in the manager's internal array
     * @returns The requested frame
     */
    getFrameByIndex(index:number):IFrame;
    
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