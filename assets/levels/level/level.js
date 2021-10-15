import Kernel from '/kernel/kernel';
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
        
        this._eventManager = new EventManager(new EventCheckContainer, new ModelExtraEventManager);
		this._pointerEventManager; //Setup in load method
        this._frameManager; //Set in subclass load method
        
        
        this._HUD; //the Heads Up Display for the level
        this._HUD = new MainHUD();
        
        this._musicRef;
        
        this.frameIndex;
    }
    
    //set things that can only be done after the engines are constructed
    load(gameCanvas, gameContext, camera, frameManager)
    {
        this._registerLevelEvents();
        
        this._setupZCalc(gameCanvas);
		
		this._pointerEventManager = new PointerEventManager(gameCanvas);
		
		this._setupHUD(gameContext, camera, this._pointerEventManager);
		
		//Not an array, so have to loop over normally
		for(let i = 0; i < this.kernel.loadedModels.length; i++)
		{
			this._pointerEventManager.addPointerEventSubject(this.kernel.loadedModels[i]);
		}
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
    
    get HUD() { return this._HUD; }
    
    //meant to be overridden
    getModels(){}
    act(){}
	_registerLevelEvents(){}
	
    
    
    drawBack()
    {
        if(this.extraDrawBack)
        {
            this.extraDrawBack();
        }
        
        if(this.outsideVisible)
        {
            this.ground.draw(this.levelSpeed);
        }
        
        this.tunnelManager.draw(this.levelSpeed);
        this.road.draw(this.roadColor);
    }
    
    drawFront()
    {
        
        
        if(this.extraDrawFront)
        {
            this.extraDrawFront();
        }
    }
    
    checkForEvents()
    {
        this._eventManager.checkForEvents();
    }
}