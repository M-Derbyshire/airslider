import Kernel from '../Kernel';

/**
 * Contains methods that perform calculations to convert "unit" values into actual canvas positions/dimensions. Also provides 
 * a method for keeping speeds consistent when the FPS changes
 */
export default class UnitHelper
{
    /**
     * Converts an x value (in units) into the correct pixel value
     * @param unitVal the x position in units
     * @returns the correct x position on canvas
     */
    static xUnit(unitValue:number):number
    {
        const kernel = Kernel.getInstance();
        
        return this._unitValueToPixelValue(
            unitValue,
            kernel.unitsWithinCameraX,
            kernel.graphicEngine.camera.canvasPositionWidth
        );
    }
    
    /**
     * Converts a y value (in units) into the correct pixel value
     * @param unitVal the y position in units
     * @returns the correct y position on canvas
     */
    static yUnit(unitValue:number):number
    {
        const kernel = Kernel.getInstance();
        
        return this._unitValueToPixelValue(
            unitValue,
            kernel.unitsWithinCameraY,
            kernel.graphicEngine.camera.canvasPositionHeight
        );
    }
    
    /**
     * Converts a speed value into another value that remains consistent, regardless of a changing FPS
     * @param speed the original speed
     * @returns a more consistent value to be used as the actual speed
     */
    static speed(speed:number):number
    {
        return speed / Kernel.getInstance().fps;
    }
    
    /**
     * Converts a "unit" position/dimension value into a pixel value, based on the size of the camera
     * @param unitValue the position/dimension value, in "units"
     * @param unitsWithinCamera the total amount of units on the given axis
     * @param cameraAxisSize the size of the camera on the given axis (not in units)
     * @returns the actual value to use when drawing to the canvas
     */
    private static _unitValueToPixelValue(unitValue:number, unitsWithinCamera:number, cameraAxisSize:number):number
    {
        return (cameraAxisSize / unitsWithinCamera) * unitValue;
    }
};