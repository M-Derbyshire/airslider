import IAssetHandler from "../../AssetHandler/IAssetHandler";
import IGraphicEngine, { ITextContent } from "../../engines/GraphicEngine/IGraphicEngine";
import ISoundEngine from "../../engines/SoundEngine/ISoundEngine";

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
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void;
    
    /**
     * Registers the sounds used by the component (these should be added to the sounds array during loading)
     * @param soundEngine the sound engine for the level 
     */
    registerSounds(soundEngine:ISoundEngine):void;
    
    /**
     * Unloads any assets that need to be unloaded by the component
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    unload(assetHandler:IAssetHandler):void;
    
    /**
     * Draws the text content setup within this component
     * @param graphicEngine the graphic engine for the level
     */
    drawText(graphicEngine:IGraphicEngine):void;
    
    /**
     * Draws the component
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    draw(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void;
    
    /**
     * Prepares the component before the level starts
     */
    prepare():void;
    
    /**
     * Is the mouse pointer overlapping this component?
     * @param pointX the x position (within the canvas's space) of the mouse pointer 
     * @param pointY the y position (within the canvas's space) of the mouse pointer
     * @param graphicEngine the graphic engine for the level
     * @returns true if it is overlapping, false if not
     */
    isPointerOverlapping(pointX:number, pointY:number, graphicEngine:Omit<IGraphicEngine, "run">):boolean;
};