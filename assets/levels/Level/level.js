import Kernel from '/Kernel/kernel';
import EventManager from './EventManager';
import PointerEventManager from './PointerEventManager';
import EventCheckContainer from './EventCheckContainer';
import ModelExtraEventManager from './ModelExtraEventManager';
import MainHUD from '/assets/HUDs/MainHUD/MainHUD';

export default class Level
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this._gameCanvas;
        this._gameContext;
        this._camera;
        this._frameManager;
        
        this._eventManager = new EventManager(new EventCheckContainer, new ModelExtraEventManager);
		this._pointerEventManager; //Setup in load method
        this._frameManager; //Set in subclass load method
        
        this._assetsToUnload = []; // file paths of assets that need to be released when this is unloaded
        
        this._HUD; //the Heads Up Display for the level
        this._HUD = new MainHUD();
        
        this._musicRef;
        
        this.frameIndex;
    }
    
    get HUD() { return this._HUD; }
    
    //set things that can only be done after the engines are constructed
    load(gameCanvas, gameContext, camera, frameManager)
    {
        this._gameCanvas = gameCanvas;
        this._gameContext = gameContext;
        this._camera = camera;
        this._frameManager = frameManager;
        
        this._setupZCalc(this._gameCanvas);
    }
    
    //If implementing your own unload in a child class, be sure to call this with super.unload()
    unload()
    {
        this._assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
    }
    
    //If implementing your own prepare in a child class, be sure to call this with super.prepare()
    prepare()
    {
        this._setupZCalc(this._gameCanvas);
        this.HUD.prepare();
        
        
        this._pointerEventManager = new PointerEventManager(this._gameCanvas);
        
        //Not an array, so have to loop over normally
		for(let i = 0; i < this.kernel.loadedModels.length; i++)
		{
			this._pointerEventManager.addPointerEventSubject(this.kernel.loadedModels[i]);
		}
        
        this._setupHUD(this._gameContext, this._camera, this._pointerEventManager);
        
        this._registerLevelEvents();
    }
	
	_setupHUD(gameContext, camera, pointerEventManager)
	{
		this._HUD.models.push(this.kernel.loadedModels[0]);
		this._loadHUD(gameContext, camera, pointerEventManager);
	}
	
	_setupZCalc(canvas)
	{
		this.helpers.zCalc.setVanishPoint(
            () => { return canvas.width / 2; }, 
            () => { return canvas.height / 2; }
        );
	}
    
    _loadHUD(canvasCtx, camera, pointerEventManager)
    {
        this._HUD.load(canvasCtx, camera, pointerEventManager);
    }
    
    checkForEvents()
    {
        this._eventManager.checkForEvents();
    }
    
    //meant to be overridden
    getModels(){ return []; }
    act(){}
	_registerLevelEvents(){}
    drawBack(){}
    drawFront(){}
}