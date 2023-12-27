import ICamera from "../../../engines/GraphicEngine/ICamera";
import IHUD from "../../HUDs/HUD/IHUD";
import IModel from "../../models/Model/IModel";
import IFrameManager from "../../../engines/GraphicEngine/IFrameManager";
import PointerEventManager from "./PointerEventManager";
import EventManager from "./EventManager";

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
     * @param camera The level's camera
     * @param frameManager The frame manager for the level
     * @param eventManager Manages the event monitoring for a level (not including mouse clicks or screen touches)
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
    load(
        camera:ICamera, 
        frameManager:IFrameManager, 
        eventManager:EventManager,
        pointerEventManager:PointerEventManager
    ):void;
    
    /**
     * Unloads any assets used by the level
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