import Kernel from "../Kernel";
import { IErrorHandler } from "./IErrorHandler";

/**
 * Manages error-handling for the game
 */
export default class ErrorHandler implements IErrorHandler {
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
        const kernel = Kernel.getInstance();
        const ctx = kernel.gameContext;
        const canvas = kernel.gameCanvas;
        
        ctx.fillStyle = this._backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    /**
     * Draws the text for the error display
     */
    private _drawText():void {
        const kernel = Kernel.getInstance();
        const ctx = kernel.gameContext;
        const canvas = kernel.gameCanvas;
        
        const titleText = "An Error has Occurred";
        const messageText = "Please see the developer console for more details";
        
        const baseFontSize = this._getRealFontSize();
        const titleFontSize = baseFontSize * 2;
        
        const canvasXCenter = canvas.width / 2;
        const canvasYCenter = canvas.height / 2;
        const titleYPos = canvasYCenter * 0.5;
        const messageYPos = canvasYCenter * 1.5;
        
        ctx.fillStyle = this._fontColor;
        ctx.textAlign = "center";
        
        ctx.font = `bolder ${titleFontSize}px ${this._fontFamily}`;
        ctx.fillText(titleText, canvasXCenter, titleYPos);
        
        ctx.font = `normal ${baseFontSize}px ${this._fontFamily}`;
        ctx.fillText(messageText, canvasXCenter, messageYPos);
    }
    
    /**
     * Calculates the desired font size, based on the canvas size
     */
    private _getRealFontSize():number {
        const canvas = Kernel.getInstance().gameCanvas;
        return this._relativeFontSize * (canvas.width / 1000);
    }
};