import Kernel from '../Kernel';
import IUnitHelper from './IUnitHelper';

/**
 * Contains methods that perform calculations to convert "unit" values into actual canvas positions/dimensions. Also provides 
 * methods for keeping speeds consistent when the FPS changes
 */
export default class UnitHelper implements IUnitHelper
{
    private _unitsWithinCamera:number; // The amount of draw-space x/y units there are within the camera's size
    private _cameraWidth:number; // The height of the camera (not in units)
    private _cameraHeight:number; // The width of the camera (not in units)
    
    /**
     * Constructor
     * @param unitsWithinCamera the amount of draw-space x/y units there are within the camera's size
     */
    constructor(unitsWithinCamera:number)
    {
        this._unitsWithinCamera = unitsWithinCamera;
        this._cameraHeight = 0;
        this._cameraWidth = 0;
    }
    
    /**
     * Passes the camera's dimensions (not in units) into the helper's internal state
     * @param cameraCanvasWidth the width of the camera on the canvas
     * @param cameraCanvasHeight the height of the camera on the canvas
     */
    setDimensions(cameraCanvasWidth:number, cameraCanvasHeight:number):void
    {
        this._cameraWidth = cameraCanvasWidth;
        this._cameraHeight = cameraCanvasHeight;
    }
    
    /**
     * Converts an x value (in units) into the correct pixel value
     * @param unitVal the x position in units
     * @returns the correct x position on canvas
     */
    xUnit(unitValue:number):number
    {
        return this._unitValueToPixelValue(unitValue, this._cameraWidth);
    }
    
    /**
     * Converts a y value (in units) into the correct pixel value
     * @param unitVal the y position in units
     * @returns the correct y position on canvas
     */
    yUnit(unitValue:number):number
    {
        return this._unitValueToPixelValue(unitValue, this._cameraHeight);
    }
    
    /**
     * Converts a "unit" position/dimension value into a pixel value, based on the size of the camera
     * @param unitValue the position/dimension value, in "units"
     * @param cameraAxisSize the size of the camera on the given axis (not in units)
     * @returns the actual value to use when drawing to the canvas
     */
    private _unitValueToPixelValue(unitValue:number, cameraAxisSize:number):number
    {
        return (cameraAxisSize / this._unitsWithinCamera) * unitValue;
    }
    
    /**
     * Converts a speed on the x axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the speed to convert into a consistent value
     * @returns a more consistent value to be used as the actual speed
     */
    xSpeed(speed:number):number
    {
        return this._consistentSpeed(speed);
    }

    /**
     * Converts a speed on the y axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the speed to convert into a consistent value
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
        return speed / Kernel.getInstance().fps; 
    }
};