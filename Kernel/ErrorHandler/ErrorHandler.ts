import Kernel from "../Kernel";
import { IErrorHandler } from "./IErrorHandler";

/**
 * Manages error-handling for the game
 */
export default class ErrorHandler implements IErrorHandler {
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
     * A font size (between 0 and 100) for the error display
     */
    private _relativeFontSize:number;
    
    /**
     * Which font to use for the error display
     */
    private _fontFamily:string;
    
    constructor() {
        const kernel = Kernel.getInstance();
        this._canvas = kernel.gameCanvas;
        this._canvasCtx = kernel.gameContext;
        
        this._backgroundColor = "#330000";
        this._fontColor = "#fbb";
        
        this._fontFamily = "Arial";
        this._relativeFontSize = 20;
    }
    
    /**
     * Handles the given error
     * @param err the error to handle (this doesn't have to be an instance of Error)
     */
    handleError(err: any): void {
        if(err instanceof Error) 
        {
            console.error(err);
        } 
        else
        {
            let errorText:string;
            
            if(err.message)
                errorText = err.message;
            else if (typeof err === "string")
                errorText = err;
            else
                errorText = err.toString();
            
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
        
        const baseFontSize = this._getRealFontSize();
        const titleFontSize = baseFontSize * 2;
        
        const canvasXCenter = this._canvas.width / 2;
        const canvasYCenter = this._canvas.height / 2;
        const titleYPos = canvasYCenter * 0.5;
        const messageYPos = canvasYCenter * 1.5;
        
        this._canvasCtx.fillStyle = this._fontColor;
        this._canvasCtx.textAlign = "center";
        
        this._canvasCtx.font = `bolder ${titleFontSize}px ${this._fontFamily}`;
        this._canvasCtx.fillText(titleText, canvasXCenter, titleYPos);
        
        this._canvasCtx.font = `normal ${baseFontSize}px ${this._fontFamily}`;
        this._canvasCtx.fillText(messageText, canvasXCenter, messageYPos);
    }
    
    /**
     * Calculates the desired font size, based on the canvas size
     */
    private _getRealFontSize():number {
        return this._relativeFontSize * (this._canvas.width / 1000);
    }
};