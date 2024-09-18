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
        this.reset();
    }
    
    /**
     * Resets the frame manager, removing all the frames currently held
     */
    reset():void
    {
        this._frames = [];
        this._framesToBeDrawn = [];
    }
    
    /**
     * Adds a frame to the level
     * @param frame The frame to add
     * @returns The index of the frame, in the manager's internal array
     */
    addFrame(frame:IFrame):number
    {
        return this._frames.push(frame) - 1;
    }
    
    /**
     * Gets a frame from the manager's internal state
     * @param index The index of the frame, in the manager's internal state
     * @returns The requested frame
     */
    getFrameByIndex(index:number):IFrame
    {
        return this._frames[index];
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