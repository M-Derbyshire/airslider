import Kernel from '/Kernel/kernel';

export default class UnitHelper
{
    constructor(unitsWithinCamera)
    {
        this.kernel = Kernel.getInstance();
        this.unitsWithinCamera = unitsWithinCamera;
        
        //These will need to be set with setDimensions()
        this._camera = { 
            canvasHeight: 0, 
            canvasWidth: 0 
        };
    }
    
    setDimensions(cameraCanvasWidth, cameraCanvasHeight)
    {
        this._camera.canvasWidth = cameraCanvasWidth;
        this._camera.canvasHeight = cameraCanvasHeight;
    }
    
    
    //helpers to create relative positioning/sizings.
    //They give you a certain amount of units (both ways) 
    //within the camera size.
    
    //xUnit and yUnit will take a position/dimension unit value, and provide an actual canvas position/size
    
    xUnit(unitVal)
    {
        return this._unitValToCanvasVal(unitVal, this._camera.canvasWidth);
    }
    yUnit(unitVal)
    {
        return this._unitValToCanvasVal(unitVal, this._camera.canvasHeight);
    }
    
    _unitValToCanvasVal(unitVal, canvasAxisSize)
    {
        return ((canvasAxisSize / this.unitsWithinCamera) * unitVal);
    }
    
    
    //xSpeed and ySpeed will take a unit amount (to be used as a movement speed)
    //and return the actual amount of units that needs to be added to the axis to 
    //give the movement a consistent speed (so it won't be changed by the changing
    //fps)
    
    xSpeed(speed)
    {
        return this._consistentSpeed(speed);
    }

    ySpeed(speed)
    {
        return this._consistentSpeed(speed);
    }
    
    _consistentSpeed(speed)
    {
        return speed / this.kernel.fps; 
    }
}