import Kernel from '../../Kernel/Kernel';
import IKernel from '../../Kernel/IKernel';
import ICamera from './ICamera';
import IHelpers from '../../Kernel/helpers/IHelpers';
import ICameraPositions from './ICameraPositions';
import ICameraDrawPositionsCalc from './ICameraDrawPositionsCalc';

/**
 * A level's camera
 */
export default class Camera implements ICamera {
    private _kernel:IKernel;
    private _helpers:IHelpers;
    
    private _canvas:HTMLCanvasElement;
    private _canvasCtx:CanvasRenderingContext2D;
    private _aspectRatioHorizontal:number; // The horizontal aspect ratio value (e.g. the "16" in "16:9")
    private _aspectRatioVertical:number; // The vertical aspect ratio value (e.g. the "9" in "16:9")
    
    private _positions:ICameraPositions; // The canvas and draw-space positions/dimensions
    
    private _emptySpaceColor:string; // The color of any empty space (not covered by the frame's background, or other elements)
    private _letterBoxColor:string; // The color of the letterboxing that surrounds the game (depending on the aspect ratio)
    
    // These functions are used to determine where to actually draw something on the canvas (based on camera position)
    unitCameraPositionCalc:ICameraDrawPositionsCalc; 
    
    /**
     * Constructor
     * @param aspectRatioHorizontal The horizontal aspect ratio value (e.g. the "16" in "16:9")
     * @param aspectRatioVertical The vertical aspect ratio value (e.g. the "9" in "16:9")
     */
    constructor(aspectRatioHorizontal:number = 17, aspectRatioVertical:number = 9)
    {
        this._kernel = Kernel.getInstance();
        this._helpers = this._kernel.helpers;
        
        this._canvas = this._kernel.gameCanvas;
        this._canvasCtx = this._kernel.gameContext;
        this._aspectRatioHorizontal = aspectRatioHorizontal;
        this._aspectRatioVertical = aspectRatioVertical;
        
        this._positions = {
            canvas: { x: 0, y: 0, width: 0, height: 0 },
            drawSpace: { x: 0, y: 0 }
        };
        
        this._emptySpaceColor = "#000000";
        this._letterBoxColor = "#000000";
        
        this.unitCameraPositionCalc = {
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
     * The x position of the camera in the level's draw space
     */
    get drawSpacePositionX()
    {
        return this._positions.drawSpace.x;
    }
    
    /**
     * The y position of the camera in the level's draw space
     */
    get drawSpacePositionY()
    {
        return this._positions.drawSpace.y;
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
     * Based on the given details, is an object currently on camera?
     * (The draw-space is the total space within the level. These coordinates are given in units)
     * @param drawSpaceX The x position (in units) of the object
     * @param drawSpaceY The y position (in units) of the object
     * @param widthUnits The width (in units) of the object
     * @param heightUnits The height (in units) of the object
     * @param zPosition The z position of the object
     * @returns true if the object is on camera, false if not
     */
    isOnCamera(drawSpaceX:number, drawSpaceY:number, widthUnits:number, heightUnits:number, zPosition:number = 0):boolean
    {
        const unscaledX = this._helpers.unit.xUnit(this.unitCameraPositionCalc.x(drawSpaceX)) + this._positions.canvas.x;
        const unscaledY = this._helpers.unit.yUnit(this.unitCameraPositionCalc.y(drawSpaceY)) + this._positions.canvas.y;
        const unscaledWidth = this._helpers.unit.xUnit(widthUnits);
        const unscaledHeight = this._helpers.unit.yUnit(heightUnits);
        
        const scaledX = this._helpers.zCalc.x(unscaledX, zPosition);
        const scaledY = this._helpers.zCalc.y(unscaledY, zPosition);
        const scaledWidth = this._helpers.zCalc.width(unscaledWidth, zPosition);
        const scaledHeight = this._helpers.zCalc.height(unscaledHeight, zPosition);
        
        return (
            (scaledX + scaledWidth >= this._positions.canvas.x &&
                scaledX <= this._positions.canvas.x + this._positions.canvas.width) &&
            (scaledY + scaledHeight >= this._positions.canvas.y &&
                scaledY <= this._positions.canvas.y + this._positions.canvas.height)
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
        this._canvasCtx.fillStyle = this._emptySpaceColor;
        this._canvasCtx.rect(0, 0, this._canvas.width, this._canvas.height);
        this._canvasCtx.fill();
    }
    
    /**
     * Draws the letterbox around the game (the color is set with the setColors() method)
     */
    drawLetterbox():void
    {
        this._canvasCtx.fillStyle = this._letterBoxColor;
        this._canvasCtx.beginPath();
        
        if(this._positions.canvas.y > 0) // Draw the letterboxes on top and bottom
        {
            //Top letterbox bar
            this._canvasCtx.rect(0, 0, this._canvas.width, this._positions.canvas.y);
            
            //Bottom letterbox bar
            this._canvasCtx.rect(
                0, 
                this._positions.canvas.y + this._positions.canvas.height,
                this._canvas.width, 
                this._positions.canvas.y
            );
        }
        else // Draw the letterboxes on left and right
        {
            //Left letterbox bar
            this._canvasCtx.rect(0, 0, this._positions.canvas.x, this._canvas.height);
            
            //Right letterbox bar
            this._canvasCtx.rect( 
                this._positions.canvas.x + this._positions.canvas.width,
                0,
                this._positions.canvas.x,
                this._canvas.height
            );
        }
        
        this._canvasCtx.fill();
    }
    
    /**
     * Moves the camera's position to the left, within the level's space
     * @param speed the speed of the movement
     */
    moveLeft(speed:number):void
    {
        this._positions.drawSpace.x -= this._helpers.unit.xSpeed(speed);
    }
    
    /**
     * Moves the camera's position to the right, within the level's space
     * @param speed the speed of the movement
     */
    moveRight(speed:number):void
    {
        this._positions.drawSpace.x += this._helpers.unit.xSpeed(speed);
    }
    
    /**
     * Moves the camera's position up, within the level's space
     * @param speed the speed of the movement
     */
    moveUp(speed:number):void
    {
        this._positions.drawSpace.y -= this._helpers.unit.ySpeed(speed);
    }
    
    /**
     * Moves the camera's position down, within the level's space
     * @param speed the speed of the movement
     */
    moveDown(speed:number):void
    {
        this._positions.drawSpace.y += this._helpers.unit.ySpeed(speed);
    }
};