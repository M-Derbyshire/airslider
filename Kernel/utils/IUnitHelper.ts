/**
 * Contains methods that perform calculations to convert "unit" values into actual canvas positions/dimensions. Also provides 
 * methods for keeping speeds consistent when the FPS changes
 */
export default interface IUnitHelper {
    /**
     * Passes the camera's dimensions (not in units) into the helper's internal state
     * @param cameraCanvasWidth the width of the camera's screen, on the canvas
     * @param cameraCanvasHeight the height of the camera's screen, on the canvas
     */
    setDimensions(cameraCanvasWidth:number, cameraCanvasHeight:number):void;
    
    /**
     * Converts an x value (in units) into the correct pixel value
     * @param unitVal the x position in units
     * @returns the correct x position on canvas
     */
    xUnit(unitVal:number):number;
    
    /**
     * Converts a y value (in units) into the correct pixel value
     * @param unitVal the y position in units
     * @returns the correct y position on canvas
     */
    yUnit(unitVal:number):number;
    
    /**
     * Converts a speed on the x axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the x speed
     * @returns a more consistent value to be used as the actual speed
     */
    xSpeed(speed:number):number;
    
    /**
     * Converts a speed on the y axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the y speed
     * @returns a more consistent value to be used as the actual speed
     */
    ySpeed(speed:number):number;
    
    /**
     * Converts a speed on the z axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the z speed
     * @returns a more consistent value to be used as the actual speed
     */
    zSpeed(speed:number):number;
};