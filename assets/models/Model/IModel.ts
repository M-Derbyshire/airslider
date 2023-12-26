import ITextContent from "../../../engines/GraphicEn/ITextContent";
import IHitBox from "./IHitBox";
import IModelAnimationsManager from "./ModelAnimationsManager/IModelAnimationsManager";

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
     * Loads and sets up the model 
     * @param animationManager The animation manager for the model
     */
    load(animationManager:IModelAnimationsManager):void;
    
    /**
     * Prepares the model, before the gameplay starts
     */
    prepare():void;
    
    /**
     * Unloads any assets used by the model
     */
    unload():void;
    
    /**
     * Draws the model's sprite
     */
    draw():void;
    
    /**
     * Runs any extra events specific to this model. The checks for these events should be ran by the extraEvents() method
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
    moveLeft(speed:number):void;
    
    /**
     * Moves the model to the right
     * @param speed the speed of the movement
     */
    moveRight(speed:number):void;
    
    /**
     * Moves the model up
     * @param speed the speed of the movement
     */
    moveUp(speed:number):void;
    
    /**
     * Moves the model down
     * @param speed the speed of the movement
     */
    moveDown(speed:number):void;
    
    /**
     * Moves the model further into the distance
     * @param speed the speed of the movement
     */
    moveIn(speed:number):void;
    
    /**
     * Moves the model closer to the camera
     * @param speed the speed of the movement
     */
    moveOut(speed:number):void;
};