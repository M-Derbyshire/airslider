import IFrameManager from './IFrameManager';
import ICamera from './ICamera';
import IFrame from './IFrame';

/**
 * Manages the frames of a level
 */
export default class FrameManager implements IFrameManager {
    
    private _camera:ICamera; // The level's camera
    
    private _frames:IFrame[]; // All of the frames that are managed by this manager
    private _framesToBeDrawn:IFrame[]; // All of the frames that should currently be drawn (all of the frames currently on screen)
    
    /**
     * Constructor
     * @param camera The level's camera
     */
    constructor(camera:ICamera)
    {
        this._camera = camera;
        
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
     * Determines which frames should be drawn, and stores that info in the manager's internal 
     * state
     */
    determineFramesToDraw():void
    {
        this._framesToBeDrawn = this._frames.filter((frame) => this._camera.isOnCamera(
            frame.x, 
            frame.y, 
            frame.width, 
            frame.height
        ));
    }
    
    /**
     * Draws the background-related elements of all of the frames that need to be drawn
     */
    drawFramesBack():void
    {
        this._framesToBeDrawn.forEach((frame) => frame.drawBack());
    }
    
    /**
     * Draws the foreground-related elements of all of the frames that need to be drawn
     */
    drawFramesFront():void
    {
        this._framesToBeDrawn.forEach((frame) => frame.drawFront());
    }
}