import { ITextContent } from "../../engines/GraphicEngine/IGraphicEngine";

/**
 * A component to be displayed by the Heads Up Display
 */
export default interface IHUDComponent {
    
    /**
     * The x coordinate of this component (in units)
     */
    x:number;
    
    /**
     * The y coordinate of this component (in units)
     */
    y:number;
    
    /**
     * The width of this component (in units)
     */
    width:number;
    
    /**
     * The height of this component (in units)
     */
    height:number;
    
    /**
     * Is this component active?
     */
    active:boolean;
    
    /**
     * The text content to be displayed with the component
     */
    text:ITextContent;
    
    /**
     * Loads the component
     */
    load():void; 
    
    /**
     * Unloads any assets that need to be unloaded by the component
     */
    unload():void;
    
    /**
     * Draws the text content setup within this component
     */
    drawText():void;
    
    /**
     * Draws the component
     */
    draw():void;
    
    /**
     * Prepares the component before the level starts
     */
    prepare():void;
    
    /**
     * Is the mouse pointer overlapping this component?
     * @param pointX the x position (within the canvas's space) of the mouse pointer 
     * @param pointY the y position (within the canvas's space) of the mouse pointer
     * @returns true if it is overlapping, false if not
     */
    isPointerOverlapping(pointX:number, pointY:number):boolean;
};