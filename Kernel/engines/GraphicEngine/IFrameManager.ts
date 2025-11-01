import IFrame from "./IFrame";
import IGraphicEngine from "./IGraphicEngine";

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
     * @param canvasCtx The context used to draw on the game's canvas
     * @param graphicEngine The graphic engine for the level
     */
    drawFramesBack(canvasCtx:CanvasRenderingContext2D, graphicEngine:IGraphicEngine):void;
    
    /**
     * Draws the foreground-related elements of all of the frames that need to be drawn
     * @param canvasCtx The context used to draw on the game's canvas
     * @param graphicEngine The graphic engine for the level
     */
    drawFramesFront(canvasCtx:CanvasRenderingContext2D, graphicEngine:IGraphicEngine):void;
};