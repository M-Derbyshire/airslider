import IAssetHandler from "../../AssetHandler/IAssetHandler";
import IGraphicEngine, { IDrawDimensions, IDrawPositions, ITextContent } from "../../engines/GraphicEngine/IGraphicEngine";
import ISoundEngine from "../../engines/SoundEngine/ISoundEngine";

/**
 * An object in the game (such as a character, monster, power-up, etc)
 */
export default interface IModel {
    /**
     * Is the model currently active?
     */
    active:boolean;
    
    /**
     * Should this model be displayed?
     */
    display:boolean;
    
    /**
     * Details for displaying an entity's text content
     */
    text:ITextContent;
    
    /**
     * The current state of the model (the name of the state is the same as the name of the animation that should be drawn)
     */
    state:string;
    
    /**
     * The current width of the model
     */
    readonly width:number;
    
    /**
     * The current height of the model
     */
    readonly height:number;
    
    /**
     * The x position of the model (in units)
     */
    x:number;
    
    /**
     * The y position of the model (in units)
     */
    y:number;
    
    /**
     * The z position of the model
     */
    z:number;
    
    /**
     * The calculated X/Y pixel values to be used when drawing the model
     */
    readonly calculatedDrawPositions:IDrawPositions;
    
    /**
     * The calculated width/height pixel values to be used when drawing the model
     */
    readonly calculatedDrawDimensions:IDrawDimensions;
    
    /**
     * The speed of the model, on the x axis
     */
    xSpeed:number;
    
    /**
     * The speed of the model, on the y axis
     */
    ySpeed:number;
    
    /**
     * The speed of the model, on the z axis
     */
    zSpeed:number;
    
    /**
     * Runs the model's actions. This is ran on every frame.
     */
    act():void;
    
    /**
     * Loads the assets for the model
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void;
    
    /**
     * Registers the sounds used by the model (these should be added to the sounds array during loading)
     * @param soundEngine the sound engine for the level 
     */
    registerSounds(soundEngine:ISoundEngine):void;
    
    /**
     * Registers the animations for the model
     */
    registerAnimations():void;
    
    /**
     * Prepares the model, before the gameplay starts
     */
    prepare():void;
    
    /**
     * Unloads any assets used by the model
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    unload(assetHandler:IAssetHandler):void;
    
    /**
     * Calculates and stores the positions/dimensions to use when drawing the model (these can be accessed via the
     * calculatedDrawPositions and calculatedDrawDimensions properties)
     * @param graphicEngine the graphic engine used by the level
     */
    precalculateDrawPositionsAndDimensions(graphicEngine:IGraphicEngine):void;
    
    /**
     * Draws the model's sprite, using the precalculated pixel positions/dimensions
     * @param graphicEngine the graphic engine used by the level
     * @param canvasContext the 2D context from the HTML canvas element
     * @param currentFps the current FPS of the game
     */
    draw(
        graphicEngine:IGraphicEngine,
        canvasContext:CanvasRenderingContext2D,
        currentFps:number
    ):void;
    
    /**
     * Runs any extra event checks specific to this model
     */
    checkForExtraEvents():void;
    
    /**
    * Determines if the mouse pointer is overlapping this model.
    * @param pointX the x position (within the canvas's space) of the mouse pointer 
    * @param pointY the y position (within the canvas's space) of the mouse pointer
    * @returns true if it is overlapping, false if not
    */
    isPointerOverlapping(pointX:number, pointY:number):boolean;
    
    /**
     * Creates and returns the current array of hit boxes for the model.
     * @returns An array of box's that can be used for events (e.g. boxes covering a character, for use by collision events)
     */
    getHitBoxes():IHitBox[];
};

/**
 * Coordinates and dimensions for a model's hit box. A hit box will surround 
 * a part of the model, and can be used in events (such as collision detection). 
 * Multiple boxes could be used to cover the actual shape of the model's sprite.
 */
export interface IHitBox {
    /**
     * The x position (in units) of the box
     */
    x:number;
    
    /**
     * The y position (in units) of the box
     */
    y:number;
    
    /**
     * The z position (in units) of the box
     */
    z:number;
    
    /**
     * The width (in units) of the box
     */
    width:number;
    
    /**
     * The height (in units) of the box
     */
    height:number;
};