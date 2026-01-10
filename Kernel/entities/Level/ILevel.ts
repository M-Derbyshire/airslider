import IModel from "../Model/IModel";
import IModelEventManager from "./IModelEventManager";
import IHUD from "../HUD/IHUD";
import IFrameManager from "../../engines/GraphicEngine/IFrameManager";
import IPointerEventManager from "./IPointerEventManager";
import IKeyboardEventManager from "./IKeyboardEventManager";

/**
 * A level of the game
 */
export default interface ILevel {
    /**
     * The Heads Up Display for the level
     */
    readonly HUD:IHUD;
    
    /**
     * Can this level be paused?
     */
    isPauseable:boolean;
    
    /**
     * Loads and sets up the level
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     * @param keyboardEventManager Manages any keyboard events
     */
    load(
        frameManager:IFrameManager, 
        modelEventManager:IModelEventManager,
        pointerEventManager:IPointerEventManager,
        keyboardEventManager:IKeyboardEventManager
    ):void;
    
    /**
     * Unloads any assets used by the level, and clears up anything else
     */
    unload():void;
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void;
    
    /**
     * Runs the registered model event checks
     */
    checkForModelEvents():void;
    
    /**
     * Triggers a check for any hover events
     */
    checkForHoverEvents():void
    
    /**
     * Creates and returns any models that will be used in the level
     * @returns the models that will be used in the level
     */
    getModels():IModel[];
    
    /**
     * Runs the level's actions. This is ran on every frame.
     */
    act():void;
    
    /**
     * Draws anything that needs to be in the back (behind the models) of the level
     */
    drawBack():void;
    
    /**
     * Draws anything that needs to be in the front (over the models) of the level
     */
    drawFront():void;
};