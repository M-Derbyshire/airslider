import IEventManager from './IEventManager';
import IPointerEventManager from './IPointerEventManager';
import IModel from '../Model/IModel';
import ILevel from './ILevel';
import Kernel from '../../Kernel';
import IControlsInitialiser from './IControlsInitialiser';
import ControlsInitialiser from './ControlsInitialiser';
import IFrameManager from '../../engines/GraphicEngine/IFrameManager';
import IHUD from '../HUD/IHUD';
import { IEntitySound } from '../types';
import ICamera from '../../engines/GraphicEngine/ICamera';

/**
 * A level of the game
 */
export default class Level implements ILevel
{
    protected assetsToUnload:string[]; // File paths of assets that need to be released when this is unloaded
    protected sounds:IEntitySound[]; // Sounds that need to be added to the sound engine, during preparation
    
    protected frameManager:IFrameManager; // The frame manager for the level
    
    protected eventManager:IEventManager; // Manages the event monitoring for a level (not including mouse clicks or screen touches)
    protected pointerEventManager:IPointerEventManager; // Manages any events relating to mouse clicks or screen touches
    
    protected controlsInitialiser:IControlsInitialiser; // Handles the initialising of the game's controls
    
    /**
     * The Heads Up Display for the level
     */
    HUD:IHUD;
    
    /**
     * Can this level be paused?
     */
    isPauseable:boolean;
    
    constructor()
    {
        this.assetsToUnload = [];
        this.sounds = [];
        this.isPauseable = true;
        
        this.controlsInitialiser = new ControlsInitialiser();
    }
    
    /**
     * Loads and sets up the level
     * @param frameManager The frame manager for the level
     * @param eventManager Manages the event monitoring for a level (not including mouse clicks or screen touches)
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
    load(
        frameManager:IFrameManager,
        eventManager:IEventManager,
        pointerEventManager:IPointerEventManager
    ):void
    {   
        this.frameManager = frameManager;
        
        this.eventManager = eventManager;
        this.pointerEventManager = pointerEventManager;
        
        this.controlsInitialiser.initialiseControls();
        
        this._loadHUD();
    }
    
    /**
     * Unloads any assets used by the level, and clears up anything else
     */
    unload():void
    {
        const assetHandler = Kernel.getInstance().assetHandler;
        
        this.assetsToUnload.forEach(asset => assetHandler.releaseAsset(asset));
        this.pointerEventManager.removeEventHandlers();
        this.controlsInitialiser.unregisterEventListeners();
        this.HUD.unload();
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        const kernel = Kernel.getInstance();
        
        this.pointerEventManager.removePointerEventSubjects();
        
        this.eventManager.clearEvents();
        this.registerLevelEvents();
        
        this._resetCameraPosition(
            kernel.graphicEngine.camera,
            kernel.settings.unitsWithinCameraX,
            kernel.settings.unitsWithinCameraY
        );
        
        this.sounds.forEach(sound => kernel.soundEngine.addSound(sound.key, sound.asset));
        
        this.HUD.prepare();
    }
    
    /**
     * Runs the registered event checks
     */
    checkForEvents():void
    {
        this.eventManager.checkForEvents();
    }
    
    /**
     * Creates and returns any models that will be used in the level
     * @returns the models that will be used in the level
     */
    getModels():IModel[] 
    { 
        return []; 
    }
    
    /**
     * Runs the level's actions. This is ran on every frame.
     */
    act():void
    {
        this.pointerEventManager.checkForHoverEvents();
    }
    
    /**
     * Draws anything that needs to be in the back (behind the models) of the level
     */
    drawBack():void {}
    
    /**
     * Draws anything that needs to be in the front (over the models) of the level
     */
    drawFront():void {}
	
    /**
     * Registers any events that will need to be monitored during gameplay
     */
    protected registerLevelEvents():void {}
    
    /**
     * Loads the level's HUD
     */
    private _loadHUD():void
    {
        this.HUD.load(this.pointerEventManager);
        this.HUD.loadComponents();
    }
    
    /**
     * Places the top-left of the camera at the top-left of the level's space
     * @param camera the game camera
     * @param unitsWithinCameraX How many draw-space units are there within the camera's size (on the x axis)?
     * @param unitsWithinCameraY How many draw-space units are there within the camera's size (on the y axis)?
     */
    private _resetCameraPosition(camera:ICamera, unitsWithinCameraX:number, unitsWithinCameraY:number):void
    {
        camera.setCameraPosition(
            unitsWithinCameraX / 2,
            unitsWithinCameraY / 2
        );
    }
}