/**
 * These methods are used to determine where to actually draw something on the canvas (based on camera position)
 */
export default interface ICameraDrawPositionsCalc {
    /**
     * Calculates the correct unit value for the given x position, based on the camera's
     * position in the level's total space.
     * @param xUnit the unit value of the x position
     * @returns the correct unit value for the given x position
     */
    x(xUnit:number):number;
        
    /**
     * Calculates the correct unit value for the given y position, based on the camera's
     * position in the level's total space.
     * @param yUnit the unit value of the y position
     * @returns the correct unit value for the given y position
     */
    y(yUnit:number):number;
};