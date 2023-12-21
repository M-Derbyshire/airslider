import Kernel from '../../../Kernel/Kernel';
import IKernel from '../../../Kernel/IKernel';
import EventManager from './EventManager';
import PointerEventManager from './PointerEventManager';
import IEventManager from './IEventManager';
import IHUD from '../../HUDs/HUD/IHUD';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import ICamera from '../../../engines/GraphicEn/ICamera';
import IPointerEventManager from './IPointerEventManager';
import IFrameManager from '../../../engines/GraphicEn/IFrameManager';
import IModel from '../../models/Model/IModel';
import ILevel from './ILevel';

/**
 * A level of the game
 */
export default class Level implements ILevel
{
    protected kernel: IKernel;
    protected helpers: IHelpers;
    
    protected assetsToUnload: string[]; // File paths of assets that need to be released when this is unloaded
    
    protected frameManager: IFrameManager; // The frame manager for the level
    protected camera: ICamera; // The level's camera
    
    protected eventManager: IEventManager; // Manages the event monitoring for a level (not including mouse clicks or screen touches)
    protected pointerEventManager:IPointerEventManager; // Manages any events relating to mouse clicks or screen touches
    
    protected gameCanvas: HTMLCanvasElement; // The canvas element that the game should be drawn on
    protected gameContext: CanvasRenderingContext2D; // The 2D context from the HTML canvas element
    
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
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.assetsToUnload = [];
        this.isPauseable = true;
    }
    
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
    ):void
    {
        this.gameCanvas = this.kernel.gameCanvas;
        this.gameContext = this.kernel.gameContext;
        
        this.camera = camera;
        this.frameManager = frameManager;
        
        this.eventManager = eventManager;
        this.pointerEventManager = pointerEventManager;
        
        this._loadHUD();
    }
    
    /**
     * Unloads any assets used by the level
     */
    unload():void
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
        this.pointerEventManager.removeEventHandlers();
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        this.setupZCalc();
        
        this.HUD.prepare();
        
        this.registerLevelEvents();
        this.kernel.loadedModels.forEach(model => this.pointerEventManager.addPointerEventSubject(model));
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
     * Set the default settings of the zCalc
     */
	protected setupZCalc():void
	{
		this.helpers.zCalc.setVanishPoint(
            () => (this.gameCanvas.width / 2), 
            () => (this.gameCanvas.height / 2)
        );
	}
    
    /**
     * Loads the level's HUD
     */
    private _loadHUD():void
    {
        this.HUD.load(this.camera, this.pointerEventManager);
        this.HUD.loadComponents();
    }
}