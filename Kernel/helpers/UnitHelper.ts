import IKernel from '../IKernel';
import Kernel from '../Kernel';
import IUnitHelper from './IUnitHelper';

/**
 * Contains methods that perform calculations to convert "unit" values into actual canvas positions/dimensions. Also provides 
 * methods for keeping speeds consistent when the FPS changes
 */
export default class UnitHelper implements IUnitHelper
{
    private _kernel:IKernel;
    private _unitsWithinCamera:number;
    private _canvasHeight:number;
    private _canvasWidth:number;
    
    /**
     * Constructor
     * @param unitsWithinCamera how many "units" are there within the camera's screen (for both axis')?
     */
    constructor(unitsWithinCamera:number)
    {
        this._kernel = Kernel.getInstance();
        this._unitsWithinCamera = unitsWithinCamera;
        
        // The width/height of the screen on the canvas (not in units)
        this._canvasHeight = 0;
        this._canvasWidth = 0;
    }
    
    /**
     * Passes the camera's dimensions (not in units) into the helper's internal state
     * @param cameraCanvasWidth the width of the camera's screen, on the canvas
     * @param cameraCanvasHeight the height of the camera's screen, on the canvas
     */
    setDimensions(cameraCanvasWidth:number, cameraCanvasHeight:number):void
    {
        this._canvasWidth = cameraCanvasWidth;
        this._canvasHeight = cameraCanvasHeight;
    }
    
    /**
     * Converts an x position (in units) into the correct position on canvas
     * @param unitVal the x position in units
     * @returns the correct x position on canvas
     */
    xUnit(unitVal:number):number
    {
        return this._unitValToCanvasVal(unitVal, this._canvasWidth);
    }
    
    /**
     * Converts a y position (in units) into the correct position on canvas
     * @param unitVal the y position in units
     * @returns the correct y position on canvas
     */
    yUnit(unitVal:number):number
    {
        return this._unitValToCanvasVal(unitVal, this._canvasHeight);
    }
    
    /**
     * Converts a "unit" position/dimension value into an actual value, based on the size of the canvas/camera
     * @param unitVal the position/dimension value, in "units"
     * @param cameraAxisSize the size of the camera on the given axis (in actual canvas dimensions)
     * @returns the actual value to use when drawing to the canvas
     */
    private _unitValToCanvasVal(unitVal:number, cameraAxisSize:number):number
    {
        return ((cameraAxisSize / this._unitsWithinCamera) * unitVal);
    }
    
    /**
     * Converts a speed on the x axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the x speed
     * @returns a more consistent value to be used as the actual speed
     */
    xSpeed(speed:number):number
    {
        return this._consistentSpeed(speed);
    }

    /**
     * Converts a speed on the y axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the y speed
     * @returns a more consistent value to be used as the actual speed
     */
    ySpeed(speed:number):number
    {
        return this._consistentSpeed(speed);
    }
    
    /**
     * Converts a given speed value into a value that will remain consistent, regardless of changes in the FPS
     * @param speed the speed to convert into a consistent value
     * @returns the consistent speed value
     */
    private _consistentSpeed(speed:number):number
    {
        return speed / this._kernel.fps; 
    }
}