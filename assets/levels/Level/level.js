import Kernel from '/Kernel/kernel';
import EventManager from './EventManager';
import PointerEventManager from './PointerEventManager';
import EventCheckContainer from './EventCheckContainer';
import ModelExtraEventManager from './ModelExtraEventManager';

/**
 * A level of the game
 */
export default class Level
{
    /**
     * Constructor
     */
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this._gameCanvas;
        this._gameContext;
        this._camera;
        this._HUD;
        
        this._eventManager = new EventManager(new EventCheckContainer, new ModelExtraEventManager);
		this._pointerEventManager; //Setup in load method
        
        this.assetsToUnload = []; // file paths of assets that need to be released when this is unloaded
        
        this.frameManager; //Set in load method
        this.frameIndex;
    }
    
    /**
     * The Heads Up Display for the level
     */
    get HUD() { return this._HUD; }
    
    /**
     * Loads and sets up the level
     * @param gameCanvas The canvas element that the game is displayed on
     * @param gameContext The 2D canvas context
     * @param camera The game's camera
     * @param frameManager The frame manager for the level
     */
    load(gameCanvas, gameContext, camera, frameManager)
    {
        this._gameCanvas = gameCanvas;
        this._gameContext = gameContext;
        this._camera = camera;
        this.frameManager = frameManager;
        
        this._pointerEventManager = new PointerEventManager(this._gameCanvas);
        this._loadHUD(gameContext, camera, this._pointerEventManager);
    }
    
    /**
     * Unloads any assets used by the level
     */
    unload()
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare()
    {
        this._setupZCalc(this._gameCanvas);
        this.HUD.prepare();
        
        //Not an array, so have to loop over normally
		for(let i = 0; i < this.kernel.loadedModels.length; i++)
		{
			this._pointerEventManager.addPointerEventSubject(this.kernel.loadedModels[i]);
		}
        
        this._setupHUD(this._gameContext, this._camera, this._pointerEventManager);
        
        this.registerLevelEvents();
    }
    
    /**
     * Registers any events that will need to be monitored for during gameplay
     */
    registerLevelEvents(){}
    
    /**
     * Runs the registered event checks
     */
    checkForEvents()
    {
        this._eventManager.checkForEvents();
    }
    
    /**
     * Creates and returns any models that will be in the level
     * @returns the models that will be in the level
     */
    getModels(){ return []; }
    
    /**
     * Runs the level's actions. This is ran on every frame.
     */
    act(){}
    
    /**
     * Draws anything that needs to be in the back (before the models) of the level
     */
    drawBack(){}
    
    /**
     * Draws anything that needs to be in the front (after the models) of the level
     */
    drawFront(){}
	
    
    
    /**
     * Loads the level's HUD
     * @param gameContext The 2D canvas context
     * @param camera The game's camera
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
    _loadHUD(gameContext, camera, pointerEventManager)
    {
        this._HUD.load(gameContext, camera, pointerEventManager);
    }
    
    /**
     * Run any setup required by the level's HUD
     * @param gameContext The 2D canvas context
     * @param camera The game's camera
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
	_setupHUD(gameContext, camera, pointerEventManager)
	{
		this._HUD.models.push(this.kernel.loadedModels[0]);
	}
	
    /**
     * Set the settings of the zCalc
     * @param canvas The canvas element that the game is displayed on
     */
	_setupZCalc(canvas)
	{
		this.helpers.zCalc.setVanishPoint(
            () => { return canvas.width / 2; }, 
            () => { return canvas.height / 2; }
        );
	}
}