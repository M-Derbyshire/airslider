import { IDrawDimensions, IDrawPositions, ITextContent } from "../../engines/GraphicEngine/IGraphicEngine";

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
     * The index of this model in the Kernel's array of models
     */
    loadedIndex:number;
    
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
     */
    load():void;
    
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
     */
    unload():void;
    
    /**
     * Calculates and stores the positions/dimensions to use when drawing the model (these can be accessed via the
     * calculatedDrawPositions and calculatedDrawDimensions properties)
     */
    precalculateDrawPositionsAndDimensions():void;
    
    /**
     * Draws the model's sprite, using the precalculated pixel positions/dimensions
     */
    draw():void;
    
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
    
    /**
     * Moves the model to the left
     * @param speed the speed of the movement
     */
    moveLeft(speed?:number):void;
    
    /**
     * Moves the model to the right
     * @param speed the speed of the movement
     */
    moveRight(speed?:number):void;
    
    /**
     * Moves the model up
     * @param speed the speed of the movement
     */
    moveUp(speed?:number):void;
    
    /**
     * Moves the model down
     * @param speed the speed of the movement
     */
    moveDown(speed?:number):void;
    
    /**
     * Moves the model further into the distance
     * @param speed the speed of the movement
     */
    moveIn(speed?:number):void;
    
    /**
     * Moves the model closer to the camera
     * @param speed the speed of the movement
     */
    moveOut(speed?:number):void;
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