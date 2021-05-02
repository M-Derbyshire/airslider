import Kernel from '../kernel/Kernel';

class FrameManager {
    
    constructor(camera)
    {
        this.kernel = Kernel.getInstance();
        
        this._camera = camera;
        this._frames = [];
        this._framesToBeDrawn = [];
    }
    
    
    
    addFrame(frame) //This returns the index number of this frame
    {
        return this._frames.push(frame) - 1;
    }
    
    removeFrame(index)
    {
        this._frames.splice(index, 1);
    }
    
    getFrameByIndex(index)
    {
        return this._frames[index];
    }
    
    
    
    determineFramesToDraw()
    {
        this._framesToBeDrawn = this._frames.filter((frame) => {
            return (this._camera.isOnCamera(frame.x, frame.y, frame.width, frame.height));
        });
    }
    
    drawFramesBack()
    {
        this._framesToBeDrawn.forEach((frame) => {
            frame.drawBack(
                this._camera.unitCameraPositionCalc.x(frame.x),
                this._camera.unitCameraPositionCalc.y(frame.y)
            );
        });
    }
    
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