
/**
 * A single area of a level
 */
export default interface IFrame {
    
    /**
     * the x position (in units) of the frame in the level
     */
    x:number;
    
    /**
     * the y position (in units) of the frame in the level
     */
    y:number;
    
    /**
     * the width (in units) of the frame
     */
    width:number;
    
    /**
     * the height (in units) of the frame
     */
    height:number;
    
    /**
     * Loads the background image at the given path, and returns the index to that image in the Frame's 
     * internal state
     * @param path the path of the background image file
     * @returns the index number of the image in the Frame's internal array
     */
    loadBackground(path:string):number;
    
    /**
     * Loads the light mask image at the given path, and returns the index to that image in the Frame's 
     * internal state
     * @param path the path of the light mask's image file
     * @param luminosity a number that represents the light mask's luminosity (0 is the darkest, 1 is the lightest)
     * @returns the index number of the image in the Frame's internal array
     */
    loadLightMask(path:string, luminosity:number):number;
    
    /**
     * Sets the background image for the frame
     * @param index the index number (returned from the loadBackground method) for the required image
     */
    setBackgroundImage(index:number):void;
    
    /**
     * Sets the light mask image for the frame
     * @param index the index number (returned from the loadLightMask method) for the required image
     */
    setLightMaskImage(index:number):void;
    
    /**
     * Draws the foreground-related elements of the frame (such as the light mask)
     * @param xUnitPos The x position (in units) to draw the frame at
     * @param yUnitPos The y position (in units) to draw the frame at
     */
    drawFront(xUnitPos:number, yUnitPos:number):void;
    
    /**
     * Draws the background-related elements of the frame (such as the background image)
     * @param xUnitPos The x position (in units) to draw the frame at
     * @param yUnitPos The y position (in units) to draw the frame at
     */
    drawBack(xUnitPos:number, yUnitPos:number):void;
    
};