import ICamera from "../../../engines/GraphicEn/ICamera";
import IHUD from "../../HUDs/HUD/IHUD";
import IModel from "../../models/Model/IModel";
import IFrameManager from "../../../engines/GraphicEn/IFrameManager";
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
     * @param gameCanvas The canvas element that the game is displayed on
     * @param camera The game's camera
     * @param frameManager The frame manager for the level
     * @param eventManager Manages the event monitoring for a level
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
    load(
        gameCanvas:HTMLCanvasElement, 
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
     * Creates and returns any models that will be in the level
     * @returns the models that will be in the level
     */
    getModels():IModel[];
    
    /**
     * Runs the level's actions. This is ran on every frame.
     */
    act():void;
    
    /**
     * Draws anything that needs to be in the back (before the models) of the level
     */
    drawBack():void;
    
    /**
     * Draws anything that needs to be in the front (after the models) of the level
     */
    drawFront():void;
    
};