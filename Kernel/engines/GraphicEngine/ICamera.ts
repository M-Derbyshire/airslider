import ICameraDrawPositionsCalc from "./ICameraDrawPositionsCalc";

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
    unitCameraPositionCalc:ICameraDrawPositionsCalc;
    
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
     * Based on the given details, is an object currently on camera?
     * (The draw-space is the total space within the level. These coordinates are given in units)
     * @param drawSpaceX The x position (in units) of the object
     * @param drawSpaceY The y position (in units) of the object
     * @param widthUnits The width (in units) of the object
     * @param heightUnits The height (in units) of the object
     * @param zPosition The z position of the object
     * @returns true if the object is on camera, false if not
     */
    isOnCamera(drawSpaceX:number, drawSpaceY:number, widthUnits:number, heightUnits:number, zPosition?:number):boolean;
    
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