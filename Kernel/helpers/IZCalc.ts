/**
 * Provides methods to calculate the correct positions/dimensions for drawing an element, based on its position on the z axis.
 * Also provides methods relating to keeping a consistent speed (regardless of a changing FPS) on the z axis.
 */
export default interface IZCalc {
    /**
     * The x position (in units) of the vanishing point
     */
    readonly vanishingPointX:number;
    
    /**
     * The y position (in units) of the vanishing point
     */
    readonly vanishingPointY:number;
    
    /**
     * The amount of possible positions that there should be on the z axis
     */
    readonly vanishingPointDepth:number;
    
    /**
     * Used to set the vanishing point.
     * @param x the x position (in units) of the vanishing point
     * @param y the y position (in units) of the vanishing point
     * @param depth the amount of possible positions that there should be on the z axis
     */
    setVanishPoint(x:number, y:number, depth?:number):void;
    
    /**
     * Converts a speed on the z axis into a value that remains consistent, regardless of a changing FPS
     * @param speed the z speed
     * @param fps the game's current Frames Per Second
     * @returns a more consistent value to be used as the actual speed
     */
    speed(speed:number, fps:number):number;
    
    /**
     * Takes an x position (not in units), and calculates the correct x position to draw with, based on the given z position
     * @param xPosition the original x position (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected x position will be returned
     */
    x(xPosition:number, zPosition:number, showNegative?:boolean):number;
    
    /**
     * Takes an y position (not in units), and calculates the correct y position to draw with, based on the given z position
     * @param yPosition the original y position (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected y position will be returned
     */
    y(yPosition:number, zPosition:number, showNegative?:boolean):number;
    
    /**
     * Takes a width value (not in units) and calculates the correct value to draw with, based on the given z position
     * @param width the original width (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected width will be returned
     */
    width(width:number, zPosition:number, showNegative?:boolean):number;
    
    /**
     * Takes a height value (not in units) and calculates the correct value to draw with, based on the given z position
     * @param height the original height (not in units)
     * @param zPosition the z position of the element being drawn
     * @param showNegative should the element still be drawn if the z position is negative?
     * @returns If the z position is "out of view", 0 will be returned. Otherwise, the corrected height will be returned
     */
    height(height:number, zPosition:number, showNegative?:boolean):number;
};