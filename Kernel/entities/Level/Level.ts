import IModelEventManager from './IModelEventManager';
import IPointerEventManager from './IPointerEventManager';
import IModel from '../Model/IModel';
import ILevel from './ILevel';
import Kernel from '../../Kernel';
import IFrameManager from '../../engines/GraphicEngine/IFrameManager';
import IHUD from '../HUD/IHUD';
import { IEntitySound } from '../types';
import ICamera from '../../engines/GraphicEngine/ICamera';
import IKeyboardEventManager from './IKeyboardEventManager';
import HUD from '../HUD/HUD';
import IAssetHandler from '../../AssetHandler/IAssetHandler';

/**
 * A level of the game
 */
export default class Level implements ILevel
{
    protected assetsToUnload:string[]; // File paths of assets that need to be released when this is unloaded
    protected sounds:IEntitySound[]; // Sounds that need to be added to the sound engine, during preparation
    
    protected modelEventManager:IModelEventManager; // Manages the event monitoring between models
    
    protected keyboardEventManager:IKeyboardEventManager; // Manages any keyboard events
    protected pointerEventManager:IPointerEventManager; // Manages any events relating to mouse clicks or screen touches
    
    /**
     * The Heads Up Display for the level
     */
    HUD:IHUD;
    
    /**
     * The frame manager for the level
     */
    frameManager:IFrameManager;
    
    /**
     * Can this level be paused?
     */
    isPauseable:boolean;
    
    /**
     * Constructor
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     * @param keyboardEventManager Manages any keyboard events
     */
    constructor(
        frameManager:IFrameManager,
        modelEventManager:IModelEventManager,
        pointerEventManager:IPointerEventManager,
        keyboardEventManager:IKeyboardEventManager
    )
    {
        this.frameManager = frameManager;
        this.HUD = new HUD(pointerEventManager);
        
        this.modelEventManager = modelEventManager;
        this.pointerEventManager = pointerEventManager;
        this.keyboardEventManager = keyboardEventManager;
        
        this.assetsToUnload = [];
        this.sounds = [];
        this.isPauseable = true;
    }
    
    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {   
        this._loadHUD(assetHandler);
    }
    
    /**
     * Unloads any assets used by the level, and clears up anything else
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    unload(assetHandler:IAssetHandler):void
    {
        this.assetsToUnload.forEach(asset => assetHandler.releaseAsset(asset));
        
        this.pointerEventManager.removeEventHandlers();
        this.keyboardEventManager.removeEventHandlers();
        
        this.HUD.unload(assetHandler);
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        const kernel = Kernel.getInstance();
        
        this.pointerEventManager.removePointerEventSubjects();
        this.keyboardEventManager.removeKeyboardEventCallbacks();
        this.modelEventManager.clearEvents();
        
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
     * Runs the registered model event checks
     */
    checkForModelEvents():void
    {
        this.modelEventManager.checkForEvents();
    }
    
    /**
     * Triggers a check for any pointer hover events
     */
    checkForHoverEvents():void
	{
		this.pointerEventManager.checkForHoverEvents();
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
    act():void {}
    
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
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    private _loadHUD(assetHandler:IAssetHandler):void
    {
        this.HUD.load(assetHandler);
        this.HUD.loadComponents(assetHandler);
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