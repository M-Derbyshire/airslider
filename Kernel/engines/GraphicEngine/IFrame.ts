import IGraphicEngine, { IDrawDimensions, IDrawPositions } from "./IGraphicEngine";

/**
 * A single area of a level
 */
export default interface IFrame {
    /**
     * The x position (in units) of the frame in the level
     */
    x:number;
    
    /**
     * The y position (in units) of the frame in the level
     */
    y:number;
    
    /**
     * The width (in units) of the frame
     */
    width:number;
    
    /**
     * The height (in units) of the frame
     */
    height:number;
    
    /**
     * The precalculated positions that will be used when drawing the frame
     */
    readonly precalculatedDrawPositions:IDrawPositions;
    
    /**
     * The precalculated dimensions that will be used when drawing the frame
     */
    readonly precalculatedDrawDimensions:IDrawDimensions;
    
    /**
     * Sets the background color for the frame
     * @param color the color (e.g. "red"/"#ff0000") to use as the background of the frame (this will be drawn 
     * underneath the background image, if an image is set)
     */
    setBackgroundColor(color:string):void;
    
    /**
     * Sets the background image for the frame
     * @param image the image to use as the background of the frame
     */
    setBackgroundImage(image:HTMLImageElement):void;
    
    /**
     * Sets the light mask image for the frame
     * @param image the image to use as the light mask of the frame
     * @param luminosity a number that represents the light mask's luminosity (1 is the lightest, 0 is the darkest)
     */
    setLightMaskImage(image:HTMLImageElement, luminosity:number):void;
    
    /**
     * Calculates and stores the positions/dimensions to draw the frame with
     * @param graphicEngine The graphic engine for the level
     */
    calculateDrawPositionsAndDimensions(graphicEngine:IGraphicEngine):void;
    
    /**
     * Draws the foreground-related elements of the frame (such as the light mask)
     * @param canvasCtx The context used to draw on the game's canvas
     */
    drawFront(canvasCtx:CanvasRenderingContext2D):void;
    
    /**
     * Draws the background-related elements of the frame (such as the background image)
     * @param canvasCtx The context used to draw on the game's canvas
     */
    drawBack(canvasCtx:CanvasRenderingContext2D):void;
};