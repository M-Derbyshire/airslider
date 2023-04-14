import IFrameManager from './IFrameManager';
import ICamera from './ICamera';
import IFrame from './IFrame';

/**
 * Manages the frames of a level
 */
export default class FrameManager implements IFrameManager {
    
    private _camera:ICamera;
    
    private _frames:IFrame[]; // All of the frames that are managed by this manager
    private _framesToBeDrawn:IFrame[]; // All of the frames that should currently be drawn (e.g. all of the frames currently on screen)
    
    /**
     * Constructor
     * @param camera The game's camera
     */
    constructor(camera:ICamera)
    {
        this._camera = camera;
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
     * Gets a frame from the manager's internal array
     * @param index The index of the frame, in the manager's internal array
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
        this._framesToBeDrawn = this._frames.filter((frame) => {
            return (this._camera.isOnCamera(frame.x, frame.y, frame.width, frame.height));
        });
    }
    
    /**
     * Draws the background-related elements of all of the frames that need to be drawn
     */
    drawFramesBack():void
    {
        this._framesToBeDrawn.forEach((frame) => {
            frame.drawBack(
                this._camera.unitCameraPositionCalc.x(frame.x),
                this._camera.unitCameraPositionCalc.y(frame.y)
            );
        });
    }
    
    /**
     * Draws the foreground-related elements of all of the frames that need to be drawn
     */
    drawFramesFront():void
    {
        this._framesToBeDrawn.forEach((frame) => {
            frame.drawFront(
                this._camera.unitCameraPositionCalc.x(frame.x),
                this._camera.unitCameraPositionCalc.y(frame.y)
            );
        });
    }
}