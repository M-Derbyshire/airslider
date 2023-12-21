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
    
    protected assetsToUnload: string[];
    
    protected frameManager: IFrameManager;
    protected frameIndex: number;
    protected camera: ICamera;
    
    protected eventManager: IEventManager;
    
    protected gameCanvas: HTMLCanvasElement;
    protected gameContext: CanvasRenderingContext2D;
    
    protected pointerEventManager:IPointerEventManager;
    
    /**
     * The Heads Up Display for the level
     */
    HUD:IHUD;
    
    /**
     * Can this level be paused?
     */
    isPauseable:boolean;
    
    /**
     * Constructor
     */
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.assetsToUnload = []; // file paths of assets that need to be released when this is unloaded
        
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
        
        this.setupZCalc();
        
        this.eventManager = eventManager;
        this.pointerEventManager = pointerEventManager;
        
        this._loadHUD(camera, this.pointerEventManager);
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
        
        //Not an array, so have to loop over normally
		for(let i = 0; i < this.kernel.loadedModels.length; i++)
		{
			this.pointerEventManager.addPointerEventSubject(this.kernel.loadedModels[i]);
		}
        
        this.registerLevelEvents();
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
    getModels():IModel[] { return []; }
    
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
     * Registers any events that will need to be monitored for during gameplay
     */
    protected registerLevelEvents():void {}
    
    /**
     * Set the settings of the zCalc
     */
	protected setupZCalc():void
	{
		this.helpers.zCalc.setVanishPoint(
            () => { return this.gameCanvas.width / 2; }, 
            () => { return this.gameCanvas.height / 2; }
        );
	}
    
    /**
     * Loads the level's HUD
     * @param camera The level's camera
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
    private _loadHUD(camera:ICamera, pointerEventManager:IPointerEventManager):void
    {
        this.HUD.load(camera, pointerEventManager);
        this.HUD.loadComponents();
    }
}