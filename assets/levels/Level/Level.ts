import Kernel from '../../../Kernel/Kernel';
import IKernel from '../../../Kernel/IKernel';
import EventManager from './EventManager';
import PointerEventManager from './PointerEventManager';
import EventCheckContainer from './EventCheckContainer';
import ModelExtraEventManager from './ModelExtraEventManager';
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
    ):void
    {
        this.gameCanvas = gameCanvas;
        this.gameContext = gameCanvas.getContext("2d");
        this.camera = camera;
        this.frameManager = frameManager;
        
        this.setupZCalc(this.gameCanvas);
        
        this.eventManager = eventManager;
        this.pointerEventManager = pointerEventManager;
        
        this._loadHUD(this.gameContext, camera, this.pointerEventManager);
    }
    
    /**
     * Unloads any assets used by the level
     */
    unload():void
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        this.setupZCalc(this.gameCanvas);
        this.HUD.prepare();
        
        //Not an array, so have to loop over normally
		for(let i = 0; i < this.kernel.loadedModels.length; i++)
		{
			this.pointerEventManager.addPointerEventSubject(this.kernel.loadedModels[i]);
		}
        
        this.setupHUD();
        
        this.registerLevelEvents();
    }
    
    /**
     * Registers any events that will need to be monitored for during gameplay
     */
    protected registerLevelEvents():void {}
    
    /**
     * Runs the registered event checks
     */
    checkForEvents():void
    {
        this.eventManager.checkForEvents();
    }
    
    /**
     * Creates and returns any models that will be in the level
     * @returns the models that will be in the level
     */
    getModels():IModel[] { return []; }
    
    /**
     * Runs the level's actions. This is ran on every frame.
     */
    act():void {}
    
    /**
     * Draws anything that needs to be in the back (before the models) of the level
     */
    drawBack():void {}
    
    /**
     * Draws anything that needs to be in the front (after the models) of the level
     */
    drawFront():void {}
    
    /**
     * Run any setup required by the level's HUD
     */
	protected setupHUD():void {}
	
    /**
     * Set the settings of the zCalc
     * @param canvas The canvas element that the game is displayed on
     */
	protected setupZCalc(canvas:HTMLCanvasElement):void
	{
		this.helpers.zCalc.setVanishPoint(
            () => { return canvas.width / 2; }, 
            () => { return canvas.height / 2; }
        );
	}
    
    /**
     * Loads the level's HUD
     * @param gameContext The 2D canvas context
     * @param camera The game's camera
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
    private _loadHUD(gameContext:CanvasRenderingContext2D, camera:ICamera, pointerEventManager:IPointerEventManager):void
    {
        this.HUD.load(gameContext, camera, pointerEventManager);
    }
}