/**
 * A level's camera
 */
export default interface ICamera {
    
    /**
     * The canvas positions/dimensions are the positions/sizes of the camera on the canvas
     * (any canvas space outside of this will be filled in by the drawLetterbox() method).
     * These are stored as actual canvas position values (not in game units)
     */
    
    /**
     * The x position (in pixels) of the camera on the canvas
     */
    readonly canvasPositionX:number;
    
    /**
     * The y position (in pixels) of the camera on the canvas
     */
    readonly canvasPositionY:number;
    
    /**
     * The width (in pixels) of the camera on the canvas
     */
    readonly canvasPositionWidth:number;
    
    /**
     * The height (in pixels) of the camera on the canvas
     */
    readonly canvasPositionHeight:number;
    
    /**
     * How many draw-space units are there within the camera's size (on the x axis)? So, if this value was
     * 1000, then a model with a width of 1000 would take up the entire screen (assuming its z position was 0)
     */
    readonly unitsWithinCameraX:number;
    
    /**
     * How many draw-space units are there within the camera's size (on the y axis)? So, if this value was
     * 1000, then a model with a height of 1000 would take up the entire screen (assuming its z position was 0)
     */
    readonly unitsWithinCameraY:number;
    
    
    
    /**
     * The draw-space positions are where the camera exists within the level's available space.
     * These values are in units.
     */
    
    /**
     * The x position of the camera in the level's draw space (in units)
     */
    readonly drawSpacePositionX:number;
    
    /**
     * The y position of the camera in the level's draw space (in units)
     */
    readonly drawSpacePositionY:number;
    
    /**
     * These functions are used to determine where to actually draw something on the canvas (based on camera position)
     */
    readonly unitCameraPositionCalc:ICameraDrawPositionsCalc;
    
    /**
     * Sets the camera's width and height to match the game's aspect ratio values
     */
    setCameraSize():void;
    
    /**
     * Sets any configurable colors that the camera uses
     * @param emptySpaceColor the color of any empty space on the canvas
     * @param letterBoxColor the color of the letterbox around the game
     */
    setColors(emptySpaceColor:string, letterBoxColor:string):void
    
    /**
     * Based on the given coordinates, is an object currently on camera?
     * @param x The X-axis position (in pixels) that the object will be drawn at
     * @param y The Y-axis position (in pixels) that the object will be drawn at
     * @param width The width (in pixels) that the object will be drawn with
     * @param height The height (in pixels) that the object will be drawn with
     * @returns true if the object is on camera, false if not
     */
    isOnCamera(x:number, y:number, width:number, height:number):boolean;
    
    /**
     * Draws anything that the camera needs to place in the background (such as the empty space color)
     */
    drawBack():void;
    
    /**
     * Draws anthing that the camera needs to place over everything else (such as the letterbox)
     */
    drawFront():void;
    
    /**
     * Draws the color of any empty space on the canvas (this color is set with the setColors() method)
     */
    drawEmptySpaceColor():void;
    
    /**
     * Draws the letterbox around the game (the color is set with the setColors() method)
     */
    drawLetterbox():void;
    
    
    /**
     * Sets the camera's position within the level's available space (centered on the given X/Y)
     * @param x The position (in units) on the X axis
     * @param y The position (in units) on the Y axis
     */
    setCameraPosition(x:number, y:number):void;
    
    /**
     * Moves the camera's position to the left, within the level's space
     * @param speed the speed of the movement (in units)
     */
    moveLeft(speed:number):void;
    
    /**
     * Moves the camera's position to the right, within the level's space
     * @param speed the speed of the movement (in units)
     */
    moveRight(speed:number):void;
    
    /**
     * Moves the camera's position up, within the level's space
     * @param speed the speed of the movement (in units)
     */
    moveUp(speed:number):void;
    
    /**
     * Moves the camera's position down, within the level's space
     * @param speed the speed of the movement (in units)
     */
    moveDown(speed:number):void;
};

/**
 * These methods are used to determine where to actually draw something on the canvas (based on camera position)
 */
export interface ICameraDrawPositionsCalc {
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

/**
 * Position data used by a camera
 */
export interface ICameraPositions {
    /**
     * The canvas positions/dimensions are the positions/sizes of the camera on the canvas
     * (any canvas space outside of this will be filled in by the drawLetterbox() method).
     * These are stored as actual canvas position values (not in game units).
     */
    canvas:{
        x:number;
        y:number;
        width:number;
        height:number;
    };
    
    /**
     * The draw-space positions define where the camera exists within the level's available space.
     * These values are in units, not actual canvas drawing positions.
     */
    drawSpace:{
        x:number;
        y:number;
    };
};