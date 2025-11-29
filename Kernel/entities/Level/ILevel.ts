import IModel from "../Model/IModel";
import PointerEventManager from "./PointerEventManager";
import IModelEventManager from "./IModelEventManager";
import IHUD from "../HUD/IHUD";
import IFrameManager from "../../engines/GraphicEngine/IFrameManager";
import IPointerEventManager from "./IPointerEventManager";

/**
 * A level of the game
 */
export default interface ILevel {
    /**
     * Manages any events relating to mouse clicks or screen touches
     */
    pointerEventManager:IPointerEventManager;
    
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
     */
    load(
        frameManager:IFrameManager, 
        modelEventManager:IModelEventManager,
        pointerEventManager:PointerEventManager
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
     * Runs the registered event checks
     */
    checkForEvents():void;
    
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