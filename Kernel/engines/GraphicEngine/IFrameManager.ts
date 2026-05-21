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
     * Gets the frames ready to be drawn
     * @param graphicEngine The graphic engine for the level
     */
    prepareFramesForDrawing(graphicEngine:IGraphicEngine):void;
    
    /**
     * Draws the background-related elements of all of the frames that need to be drawn
     * @param canvasCtx The context used to draw on the game's canvas
     */
    drawFramesBack(canvasCtx:CanvasRenderingContext2D):void;
    
    /**
     * Draws the foreground-related elements of all of the frames that need to be drawn
     * @param canvasCtx The context used to draw on the game's canvas
     */
    drawFramesFront(canvasCtx:CanvasRenderingContext2D):void;
};