import IModelEventManager from './IModelEventManager';
import IPointerEventManager from './IPointerEventManager';
import IModel from '../Model/IModel';
import ILevel from './ILevel';
import IFrameManager from '../../engines/GraphicEngine/IFrameManager';
import IHUD from '../HUD/IHUD';
import { IEntitySound } from '../types';
import IKeyboardEventManager from './IKeyboardEventManager';
import HUD from '../HUD/HUD';
import IAssetHandler from '../../AssetHandler/IAssetHandler';
import ISoundEngine from '../../engines/SoundEngine/ISoundEngine';
import IGraphicEngine from '../../engines/GraphicEngine/IGraphicEngine';

/**
 * A level of the game
 */
export default class Level implements ILevel
{
    private _hud:IHUD; // The Heads Up Display for the level
    private _frameManager:IFrameManager; // The frame manager for the level
    
    protected assetsToUnload:string[]; // File paths of assets that need to be released when this is unloaded
    protected sounds:IEntitySound[]; // Sounds that need to be added to the sound engine, during preparation
    
    protected modelEventManager:IModelEventManager; // Manages the event monitoring between models
    
    protected keyboardEventManager:IKeyboardEventManager; // Manages any keyboard events
    protected pointerEventManager:IPointerEventManager; // Manages any events relating to mouse clicks
    
    /**
     * The Heads Up Display for the level
     */
    get HUD():IHUD {
        return this._hud;
    }
    protected set HUD(value:IHUD) {
        this._hud = value;
    }
    
    /**
     * The frame manager for the level
     */
    get frameManager():IFrameManager {
        return this._frameManager;
    }
    protected set frameManager(value:IFrameManager) {
        this._frameManager = value;
    }
    
    /**
     * Can this level be paused?
     */
    isPauseable:boolean;
    
    /**
     * Constructor
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks
     * @param keyboardEventManager Manages any keyboard events
     */
    constructor(
        frameManager:IFrameManager,
        modelEventManager:IModelEventManager,
        pointerEventManager:IPointerEventManager,
        keyboardEventManager:IKeyboardEventManager
    )
    {
        this._frameManager = frameManager;
        this._hud = new HUD(pointerEventManager);
        
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
     * Registers the sounds used by the level (these should be added to the sounds array during loading). Also
     * triggers the registration of the HUD's sounds
     * @param soundEngine the sound engine for the level 
     */
    registerSounds(soundEngine:ISoundEngine):void
    {
        this.sounds.forEach(sound => soundEngine.addSound(sound.key, sound.asset));
        this.HUD.registerSounds(soundEngine);
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
        this.pointerEventManager.removePointerEventSubjects();
        this.keyboardEventManager.removeKeyboardEventCallbacks();
        this.modelEventManager.clearEvents();
        
        this.registerLevelEvents();
        
        this.HUD.prepare();
    }
    
    /**
     * Runs the registered model event checks
     * @param models the models for the current level
     */
    checkForModelEvents(models:IModel[]):void
    {
        this.modelEventManager.checkForEvents(models);
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
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    drawBack(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void {}
    
    /**
     * Draws anything that needs to be in the front (over the models) of the level
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    drawFront(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void {}
	
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
}