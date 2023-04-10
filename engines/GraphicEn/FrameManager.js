import Kernel from '/Kernel/kernel';

/**
 * Manages the frames of a level
 */
export default class FrameManager {
    
    /**
     * Constructor
     * @param camera The game's camera
     */
    constructor(camera:ICamera)
    {
        this.kernel = Kernel.getInstance();
        
        this._camera = camera;
        this._frames = [];
        this._framesToBeDrawn = [];
    }
    
    
    /**
     * Adds a frame to the level
     * @param frame The frame to add
     * @returns The index of the frame, in the manager's internal array
     */
    addFrame(frame)
    {
        return this._frames.push(frame) - 1;
    }
    
    /**
     * Gets a frame from the manager's internal array
     * @param index The index of the frame, in the manager's internal array
     * @returns The requested frame
     */
    getFrameByIndex(index)
    {
        return this._frames[index];
    }
    
    /**
     * Determines which frames should be drawn, and stores that info in the manager's internal 
     * state
     */
    determineFramesToDraw()
    {
        this._framesToBeDrawn = this._frames.filter((frame) => {
            return (this._camera.isOnCamera(frame.x, frame.y, frame.width, frame.height));
        });
    }
    
    /**
     * Draws the background-related elements of all of the frames that need to be drawn
     */
    drawFramesBack()
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
    drawFramesFront()
    {
        this._framesToBeDrawn.forEach((frame) => {
            frame.drawFront(
                this._camera.unitCameraPositionCalc.x(frame.x),
                this._camera.unitCameraPositionCalc.y(frame.y)
            );
        });
    }
}