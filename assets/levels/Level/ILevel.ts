import ICamera from "../../../engines/GraphicEn/ICamera";
import IHUD from "../../HUDs/HUD/IHUD";
import IModel from "../../models/Model/IModel";
import IFrameManager from "../../../engines/GraphicEn/IFrameManager";

/**
 * A level of the game
 */
export default interface ILevel {
    
    /**
     * The Heads Up Display for the level
     */
    readonly HUD:IHUD;
    
    /**
     * Loads and sets up the level
     * @param gameCanvas The canvas element that the game is displayed on
     * @param gameContext The 2D canvas context
     * @param camera The game's camera
     * @param frameManager The frame manager for the level
     */
    load(gameCanvas:HTMLCanvasElement, gameContext:CanvasRenderingContext2D, camera:ICamera, frameManager:IFrameManager):void;
    
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