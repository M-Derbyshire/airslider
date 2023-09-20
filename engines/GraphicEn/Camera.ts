import Kernel from '../../Kernel/Kernel';
import IKernel from '../../Kernel/IKernel';
import ICamera from './ICamera';
import IHelpers from '../../Kernel/helpers/IHelpers';

/**
 * A level's camera
 */
export default class Camera implements ICamera {
    
    private _kernel:IKernel;
    private _helpers:IHelpers;
    
    private _canvas:HTMLCanvasElement;
    private _canvasCtx:CanvasRenderingContext2D;
    private _aspectRatioHorizontal:number;
    private _aspectRatioVertical:number;
    
    private _positions:ICameraPositions;
    
    private _emptySpaceColor:string;
    private _letterBoxColor:string;
    
    unitCameraPositionCalc:{
        x(xUnit:number):number;
        y(yUnit:number):number;
    };
    
    
    /**
     * Constructor
     * @param canvas The canvas element that the game is displayed on
     * @param canvasCtx The 2D canvas context
     * @param aspectRatioHorizontal The horizontal aspect ratio value (e.g. the "16" in "16:9")
     * @param aspectRatioVertical The vertical aspect ratio value (e.g. the "9" in "16:9")
     */
    constructor(canvas:HTMLCanvasElement, canvasCtx:CanvasRenderingContext2D, aspectRatioHorizontal:number = 17, aspectRatioVertical:number = 9)
    {
        this._kernel = Kernel.getInstance();
        this._helpers = this._kernel.helpers;
        
        this._canvas = canvas;
        this._canvasCtx = canvasCtx;
        this._aspectRatioHorizontal = aspectRatioHorizontal;
        this._aspectRatioVertical = aspectRatioVertical;
        
        
        this._positions = {
            //The canvas positions/dimensions are the positions/sizes of the camera on the canvas
            //(any canvas space outside of this will be filled in by the drawLetterbox() method).
            //These are stored as actual canvas position values (not in game units)
            canvas: { x: 0, y: 0, width: 0, height: 0 },
            
            //The drawSpace positions define where the camera exists within the level's available space.
            //These values are in units, not actual canvas drawing positions.
            drawSpace: { x: 0, y: 0 }
        };
        
        this._emptySpaceColor = "#000000"; // The color of any empty space (not covered by the frame's background, or other elements)
        this._letterBoxColor = "#000000"; // The color of the letterboxing that surrounds the game (depending on the aspect ratio)
        
        
        
        
        // Used by frames/models to determine where to actually draw on canvas (based on camera position)
        this.unitCameraPositionCalc = {
            /**
             * Calculates the correct unit value for the given x position, based on the camera's
             * position in the level's total space.
             * @param xUnit the unit value of the x position
             * @returns the correct unit value for the given x position
             */
            x: (xUnit) => (xUnit - this._positions.drawSpace.x),
            
            /**
             * Calculates the correct unit value for the given y position, based on the camera's
             * position in the level's total space.
             * @param yUnit the unit value of the y position
             * @returns the correct unit value for the given y position
             */
            y: (yUnit) => (yUnit - this._positions.drawSpace.y)
        };
        
        
        this.setCameraSize();
    }
    
    /**
     * The x position of the camera on the canvas
     */
    get canvasPositionX() { return this._positions.canvas.x; }
    
    /**
     * The y position of the camera on the canvas
     */
    get canvasPositionY() { return this._positions.canvas.y; }
    
    /**
     * The width of the camera on the canvas
     */
    get canvasPositionWidth() { return this._positions.canvas.width; }
    
    /**
     * The height of the camera on the canvas
     */
    get canvasPositionHeight() { return this._positions.canvas.height; }
    
    /**
     * The x position of the camera in the level's draw space
     */
    get drawSpacePositionX() { return this._positions.drawSpace.x; }
    
    /**
     * The y position of the camera in the level's draw space
     */
    get drawSpacePositionY() { return this._positions.drawSpace.y; }
    
    /**
     * Sets the camera's width and height to match the game's aspect ratio values
     */
    setCameraSize():void
    {
        let width;
        let height;
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
     * (The drawspace is the total space within the level. These coordinates are given in units)
     * @param drawSpaceX The x position (in units) of the object
     * @param drawSpaceY The y position (in units) of the object
     * @param widthUnits The width (in units) of the object
     * @param heightUnits The height (in units) of the object
     * @param zPosition The z position of the object
     * @returns true if the object is on camera, false if not
     */
    isOnCamera(drawSpaceX:number, drawSpaceY:number, widthUnits:number, heightUnits:number, zPosition:number = 0):boolean
    {
        const objectRealX = this._helpers.zCalc.x(this._helpers.unit.xUnit(this.unitCameraPositionCalc.x(drawSpaceX)) + this._positions.canvas.x, zPosition);
        const objectRealY = this._helpers.zCalc.y(this._helpers.unit.yUnit(this.unitCameraPositionCalc.y(drawSpaceY)) + this._positions.canvas.y, zPosition);
        const objectRealWidth = this._helpers.zCalc.width(this._helpers.unit.xUnit(widthUnits), zPosition);
        const objectRealHeight = this._helpers.zCalc.height(this._helpers.unit.yUnit(heightUnits), zPosition);
        
        return (
            (objectRealX + objectRealWidth >= this._positions.canvas.x &&
                objectRealX <= this._positions.canvas.x + this._positions.canvas.width) &&
            (objectRealY + objectRealHeight >= this._positions.canvas.y &&
                objectRealY <= this._positions.canvas.y + this._positions.canvas.height)
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
        
        if(this._positions.canvas.y > 0)
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
        else
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
}


/**
 * Position data used by a camera
 */
export interface ICameraPositions {
    
    /**
     * The canvas positions/dimensions are the positions/sizes of the camera on the canvas
     * (any canvas space outside of this will be filled in by the drawLetterbox() method).
     * These are stored as actual canvas position values (not in game units)
     */
    canvas:{
        x:number;
        y:number;
        width:number;
        height:number;
    };
    
    /**
     * The drawSpace positions define where the camera exists within the level's available space.
     * These values are in units, not actual canvas drawing positions.
     */
    drawSpace:{
        x:number;
        y:number;
    };
    
};