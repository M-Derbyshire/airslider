import ICamera, { ICameraDrawPositionsCalc, ICameraPositions } from './ICamera';

/**
 * A level's camera
 */
export default class Camera implements ICamera {
    private _aspectRatioHorizontal:number; // The horizontal aspect ratio value (e.g. the "16" in "16:9")
    private _aspectRatioVertical:number; // The vertical aspect ratio value (e.g. the "9" in "16:9")
    
    private _canvas:HTMLCanvasElement; // The HTML canvas element where the game is being drawn
    
    private _positions:ICameraPositions; // The canvas and draw-space positions/dimensions
    
    private _emptySpaceColor:string; // The color of any empty space (not covered by the frame's background, or other elements)
    private _letterBoxColor:string; // The color of the letterboxing that surrounds the game (depending on the aspect ratio)
    
    // These functions are used to determine where to actually draw something on the canvas (based on camera position)
    private _unitCameraPositionCalc:ICameraDrawPositionsCalc;
    
    // How many draw-space units are there within the camera's size (on the x axis)? So, if this value was 1000, then
    // a model with a width of 1000 would take up the entire screen (assuming its z position was 0)
    private _unitsWithinCameraX:number;
    
    // How many draw-space units are there within the camera's size (on the y axis)? So, if this value was 1000, then
    // a model with a height of 1000 would take up the entire screen (assuming its z position was 0)
    private _unitsWithinCameraY:number;
    
    /**
     * These functions are used to determine where to actually draw something on the canvas (based on camera position)
     */
    get unitCameraPositionCalc() {
        return this._unitCameraPositionCalc;
    }
    
    /**
     * Constructor
     * @param aspectRatioHorizontal The horizontal aspect ratio value (e.g. the "16" in "16:9")
     * @param aspectRatioVertical The vertical aspect ratio value (e.g. the "9" in "16:9")
     * @param unitsWithinCameraX How many draw-space units are there within the camera's size (on the x axis)?
     * @param unitsWithinCameraY How many draw-space units are there within the camera's size (on the y axis)?
     * @param canvas The HTML canvas element where the game is being drawn
     */
    constructor(
        canvas:HTMLCanvasElement,
        aspectRatioHorizontal:number = 17,
        aspectRatioVertical:number = 9,
        unitsWithinCameraX:number = 1000,
        unitsWithinCameraY:number = 1000
    )
    {
        this._aspectRatioHorizontal = aspectRatioHorizontal;
        this._aspectRatioVertical = aspectRatioVertical;
        
        this._unitsWithinCameraX = unitsWithinCameraX;
        this._unitsWithinCameraY = unitsWithinCameraY;
        
        this._canvas = canvas;
        
        this._positions = {
            canvas: { x: 0, y: 0, width: 0, height: 0 },
            drawSpace: { x: 0, y: 0 }
        };
        
        this._emptySpaceColor = "#000000";
        this._letterBoxColor = "#000000";
        
        this._unitCameraPositionCalc = {
            x: (xUnit) => (xUnit - this._positions.drawSpace.x),
            y: (yUnit) => (yUnit - this._positions.drawSpace.y)
        };
        
        this.setCameraSize();
    }
    
    /**
     * The x position of the camera on the canvas
     */
    get canvasPositionX() 
    {
        return this._positions.canvas.x;
    }
    
    /**
     * The y position of the camera on the canvas
     */
    get canvasPositionY() 
    {
        return this._positions.canvas.y;
    }
    
    /**
     * The width of the camera on the canvas
     */
    get canvasPositionWidth() 
    {
        return this._positions.canvas.width;
    }
    
    /**
     * The height of the camera on the canvas
     */
    get canvasPositionHeight()
    {
        return this._positions.canvas.height;
    }
    
    /**
     * The x position of the camera in the level's draw space (in units)
     */
    get drawSpacePositionX()
    {
        return this._positions.drawSpace.x;
    }
    
    /**
     * The y position of the camera in the level's draw space (in units)
     */
    get drawSpacePositionY()
    {
        return this._positions.drawSpace.y;
    }
    
    /**
     * How many draw-space units are there within the camera's size (on the x axis)? So, if this value was 1000, then
     * a model with a width of 1000 would take up the entire screen (assuming its z position was 0)
     */
    get unitsWithinCameraX()
    {
        return this._unitsWithinCameraX;
    }
    
    /**
     * How many draw-space units are there within the camera's size (on the y axis)? So, if this value was 1000, then
     * a model with a height of 1000 would take up the entire screen (assuming its z position was 0)
     */
    get unitsWithinCameraY()
    {
        return this._unitsWithinCameraY;
    }
    
    /**
     * Sets the camera's width and height to match the game's aspect ratio values
     */
    setCameraSize():void
    {
        let width:number;
        let height:number;
        let widthRatio = this._aspectRatioHorizontal / this._aspectRatioVertical;
        
        if((this._canvas.width / widthRatio) > this._canvas.height)
        {
            height = this._canvas.height
            width = height * widthRatio;
        } else {
            height = this._canvas.width / widthRatio;
            width = this._canvas.width;
        }
        
        const x = (this._canvas.width - width) / 2;
        const y = (this._canvas.height - height) / 2;
        
        this._positions.canvas = { x, y, width, height };
    }
    
    /**
     * Sets any configurable colors that the camera uses
     * @param emptySpaceColor the color of any empty space on the canvas
     * @param letterBoxColor the color of the letterbox around the game
     */
    setColors(emptySpaceColor:string, letterBoxColor:string):void
    {
        this._emptySpaceColor = emptySpaceColor;
        this._letterBoxColor = letterBoxColor;
    }
    
    /**
     * Based on the given coordinates, is an object currently on camera?
     * @param x The X-axis position (in pixels) that the object will be drawn at
     * @param y The Y-axis position (in pixels) that the object will be drawn at
     * @param width The width (in pixels) that the object will be drawn with
     * @param height The height (in pixels) that the object will be drawn with
     * @returns true if the object is on camera, false if not
     */
    isOnCamera(x:number, y:number, width:number, height:number):boolean
    {   
        return (
            (x + width >= this._positions.canvas.x &&
                x <= this._positions.canvas.x + this._positions.canvas.width) &&
            (y + height >= this._positions.canvas.y &&
                y <= this._positions.canvas.y + this._positions.canvas.height)
        );
    }
    
    /**
     * Draws anything that the camera needs to place in the background (such as the empty space color)
     */
    drawBack():void
    {
        this.drawEmptySpaceColor();
    }
    
    /**
     * Draws anthing that the camera needs to place over everything else (such as the letterbox)
     */
    drawFront():void
    {
        this.drawLetterbox();
    }
    
    /**
     * Draws the color of any empty space on the canvas (this color is set with the setColors() method)
     */
    drawEmptySpaceColor():void
    {
        const ctx = this._canvas.getContext("2d");
        
        ctx.fillStyle = this._emptySpaceColor;
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fill();
    }
    
    /**
     * Draws the letterbox around the game (the color is set with the setColors() method)
     */
    drawLetterbox():void
    {
        const ctx = this._canvas.getContext("2d");
        
        ctx.fillStyle = this._letterBoxColor;
        ctx.beginPath();
        
        if(this._positions.canvas.y > 0) // Draw the letterboxes on top and bottom
        {
            //Top letterbox bar
            ctx.rect(0, 0, ctx.canvas.width, this._positions.canvas.y);
            
            //Bottom letterbox bar
            ctx.rect(
                0, 
                this._positions.canvas.y + this._positions.canvas.height,
                ctx.canvas.width, 
                this._positions.canvas.y
            );
        }
        else // Draw the letterboxes on left and right
        {
            //Left letterbox bar
            ctx.rect(0, 0, this._positions.canvas.x, ctx.canvas.height);
            
            //Right letterbox bar
            ctx.rect( 
                this._positions.canvas.x + this._positions.canvas.width,
                0,
                this._positions.canvas.x,
                ctx.canvas.height
            );
        }
        
        ctx.fill();
    }
    
    /**
     * Sets the camera's position within the level's available space (centered on the given X/Y)
     * @param x The position (in units) on the X axis
     * @param y The position (in units) on the Y axis
     */
    setCameraPosition(x:number, y:number):void
    {
        const centerX = this.unitsWithinCameraX / 2;
        const centerY = this.unitsWithinCameraY / 2;
        
        this._positions.drawSpace.x = x - centerX;
        this._positions.drawSpace.y = y - centerY;
    }
    
    /**
     * Moves the camera's position to the left, within the level's space
     * @param speed the speed of the movement (in units)
     */
    moveLeft(speed:number):void
    {
        this._positions.drawSpace.x -= speed;
    }
    
    /**
     * Moves the camera's position to the right, within the level's space
     * @param speed the speed of the movement (in units)
     */
    moveRight(speed:number):void
    {
        this._positions.drawSpace.x += speed;
    }
    
    /**
     * Moves the camera's position up, within the level's space
     * @param speed the speed of the movement (in units)
     */
    moveUp(speed:number):void
    {
        this._positions.drawSpace.y -= speed;
    }
    
    /**
     * Moves the camera's position down, within the level's space
     * @param speed the speed of the movement (in units)
     */
    moveDown(speed:number):void
    {
        this._positions.drawSpace.y += speed;
    }
};