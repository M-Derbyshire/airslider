import IFrameManager from './IFrameManager';
import IFrame from './IFrame';
import IGraphicEngine from './IGraphicEngine';

/**
 * Manages the frames of a level
 */
export default class FrameManager implements IFrameManager {
    private _frames:IFrame[]; // All of the frames that are managed by this manager
    private _framesToBeDrawn:IFrame[]; // All of the frames that should currently be drawn (all of the frames currently on screen)
    
    /**
     * Constructor
     */
    constructor()
    {
        this._frames = [];
        this._framesToBeDrawn = [];
    }
    
    /**
     * Sets the frames for the level
     * @param frames The frames to use
     */
    setFrames(frames:IFrame[]):void
    {
        this._framesToBeDrawn = [];
        this._frames = frames;
    }
    
    /**
     * Gets the frames ready to be drawn
     * @param graphicEngine The graphic engine for the level
     */
    prepareFramesForDrawing(graphicEngine:IGraphicEngine):void
    {
        this._frames.forEach((frame) => frame.calculateDrawPositionsAndDimensions(graphicEngine));
        this._determineFramesToDraw(graphicEngine);
    }
    
    /**
     * Draws the background-related elements of all of the frames that need to be drawn
     * @param canvasCtx The context used to draw on the game's canvas
     */
    drawFramesBack(canvasCtx:CanvasRenderingContext2D):void
    {
        this._framesToBeDrawn.forEach((frame) => frame.drawBack(canvasCtx));
    }
    
    /**
     * Draws the foreground-related elements of all of the frames that need to be drawn
     * @param canvasCtx The context used to draw on the game's canvas
     */
    drawFramesFront(canvasCtx:CanvasRenderingContext2D):void
    {
        this._framesToBeDrawn.forEach((frame) => frame.drawFront(canvasCtx));
    }
    
    /**
     * Determines which frames should be drawn, and stores that info in the manager's internal 
     * state
     * @param graphicEngine The graphic engine for the level
     */
    private _determineFramesToDraw(graphicEngine:IGraphicEngine):void
    {
        this._framesToBeDrawn = this._frames.filter((frame) => graphicEngine.camera.isOnCamera(
            frame.precalculatedDrawPositions.x,
            frame.precalculatedDrawPositions.y,
            frame.precalculatedDrawDimensions.width,
            frame.precalculatedDrawDimensions.height
        ));
    }
}