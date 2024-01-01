/**
 * Provides methods to calculate the correct drawing position/dimensions for an element, based on its position on the z axis.
 * Also provides methods relating to consistent speed (regardless of a changing FPS) on the z axis
 */
export default interface IZCalc {
    
    /**
     * The x position (not in units) of the vanishing point
     */
    readonly vPointX:number;
    
    /**
     * The y position (not in units) of the vanishing point
     */
    readonly vPointY:number;
    
    /**
     * the "z unit" position of the vanishing point, on the z axis
     */
    readonly vPointDepth:number;
    
    /**
     * Used to set the vanishing point. The x and y positions are provided through callback functions, as they may need to change if 
     * the canvas element is resized
     * @param canvasXPosCalcFunction a function that returns the correct x position (not in units) of the vanishing point, on the canvas
     * @param canvasYPosCalcFunction a function that returns the correct y position (not in units) of the vanishing point, on the canvas
     * @param depth how many possible positions should there be on the z axis?
     */
    setVanishPoint(canvasXPosCalcFunction:()=>number, canvasYPosCalcFunction:()=>number, depth?:number):void;
    
    /**
     * Calls the callback functions (that were passed to the setVanishPoint method) for the x/y positions of the vanishing point, and 
     * resets the values in the internal state
     */
    resetVanishPointPosition():void;
    
    /**
     * Converts a speed on the z axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the z speed
     * @param fps the game's current Frames Per Second
     * @returns a more consistent value to be used as the actual speed
     */
    speed(speed:number, fps:number):number;
    
    /**
     * Takes an x position (not in units), and calculates the correct x position to use, based on the given z position
     * @param xPosition the original x position (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected x position will be returned
     */
    x(xPosition:number, zPosition:number, showNegative?:boolean):number;
    
    /**
     * Takes an y position (not in units), and calculates the correct y position to use, based on the given z position
     * @param yPosition the original y position (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected y position will be returned
     */
    y(yPosition:number, zPosition:number, showNegative?:boolean):number;
    
    /**
     * Takes a width value (not in units) and calculates the correct value to use, based on the given z position
     * @param width the original width (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected width will be returned
     */
    width(width:number, zPosition:number, showNegative?:boolean):number;
    
    /**
     * Takes a height value (not in units) and calculates the correct value to use, based on the given z position
     * @param height the original height (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected height will be returned
     */
    height(height:number, zPosition:number, showNegative?:boolean):number;
    
};