import Kernel from "../Kernel";
import { IErrorHandler } from "./IErrorHandler";

/**
 * Manages error-handling for the entire game
 */
class ErrorHandler implements IErrorHandler {
    
    /**
     * The game's canvas
     */
    private _canvas:HTMLCanvasElement;
    
    /**
     * The context from the game's canvas
     */
    private _canvasCtx:CanvasRenderingContext2D;
    
    /**
     * The color of the background for the error display
     */
    private _backgroundColor:string;
    
    /**
     * The color of the font for the error display
     */
    private _fontColor:string;
    
    /**
     * A base font size (between 0 and 100) for the error display
     */
    private _baseFontSize:number;
    
    /**
     * Constructor
     * @returns An ErrorHandler
     */
    constructor() {
        const kernel = Kernel.getInstance();
        this._canvas = kernel.gameCanvas;
        this._canvasCtx = kernel.gameContext;
        
        this._backgroundColor = "#330000";
        this._fontColor = "#fbb";
        
        this._baseFontSize = 20;
    }
    
    /**
     * Handles errors
     * @param err the error to handle (doesn't have to be an instance of Error)
     */
    handleError(err: any): void {
        
        if(err instanceof Error) {
            console.error(err);
        } else {
            let errorText:string;
            
            if(err.message) {
                errorText = err.message;
            } else if (typeof err === "string") {
                errorText = err;
            } else {
                errorText = err.toString();
            }
            
            console.error(errorText);
        }
        
        // Now print an error display to the canvas
        this._drawBackground();
        this._drawText();
    }
    
    /**
     * Draws the background for the error display
     */
    private _drawBackground():void {
        this._canvasCtx.fillStyle = this._backgroundColor;
        this._canvasCtx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
    
    /**
     * Draws the text for the error display
     */
    private _drawText():void {
        const titleText = "An Error has Occurred";
        const messageText = "Please see the developer console for more details";
        
        const font = "Arial";
        const baseFontSize = this._getRealFontSize();
        const titleFontSize = baseFontSize * 2;
        
        const canvasHalfWidth = this._canvas.width / 2;
        const canvasHalfHeight = this._canvas.height / 2;
        const titleYPos = canvasHalfHeight * 0.5;
        const messageYPos = canvasHalfHeight * 1.5;
        
        this._canvasCtx.fillStyle = this._fontColor;
        this._canvasCtx.textAlign = "center";
        
        this._canvasCtx.font = `bolder ${titleFontSize}px ${font}`;
        this._canvasCtx.fillText(titleText, canvasHalfWidth, titleYPos);
        
        this._canvasCtx.font = `normal ${baseFontSize}px ${font}`;
        this._canvasCtx.fillText(messageText, canvasHalfWidth, messageYPos);
    }
    
    /**
     * Calculates the desired font size, based on the canvas size
     */
    private _getRealFontSize():number {
        const drawUnit = this._canvas.width / 100;
        return (this._baseFontSize * drawUnit) / 10; // dividing by another 10 gets the desired effect
    }
}

export default ErrorHandler;