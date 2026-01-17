import IModel from "../Model/IModel";
import IHUD from "../HUD/IHUD";
import IFrameManager from "../../engines/GraphicEngine/IFrameManager";
import IAssetHandler from "../../AssetHandler/IAssetHandler";
import ISoundEngine from "../../engines/SoundEngine/ISoundEngine";
import ICamera from "../../engines/GraphicEngine/ICamera";

/**
 * A level of the game
 */
export default interface ILevel {
    /**
     * The Heads Up Display for the level
     */
    readonly HUD:IHUD;
    
    /**
     * The frame manager for the level
     */
    readonly frameManager:IFrameManager;
    
    /**
     * Can this level be paused?
     */
    isPauseable:boolean;
    
    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void;
    
    /**
     * Unloads any assets used by the level, and clears up anything else
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    unload(assetHandler:IAssetHandler):void;
    
    /**
     * Prepares the level, before the gameplay starts
     * @param soundEngine the sound engine for the level
     * @param camera the camera for the level
     */
    prepare(soundEngine:ISoundEngine, camera:ICamera):void;
    
    /**
     * Runs the registered model event checks
     */
    checkForModelEvents():void;
    
    /**
     * Triggers a check for any pointer hover events
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