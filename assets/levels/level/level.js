import Kernel from '/kernel/kernel';
import EventManager from './EventManager';
import PointerEventManager from './PointerEventManager';
import EventCheckContainer from './EventCheckContainer';
import ModelExtraEventManager from './ModelExtraEventManager';
import LevelRoad from './LevelRoad';
import ShockerManager from './ShockerManager';
import ModelXPositionPatternManager from './ModelXPositionPatternManager';
import LevelGround from './LevelGround';
import LevelTunnel from './LevelTunnel';
import MainHUD from '/assets/HUDs/MainHUD/MainHUD';
import Tarian from '/assets/models/Tarian/Tarian';
import Shocker from '/assets/models/Shocker/Shocker';
import NeonPidgeon from '/assets/models/Monsters/NeonPidgeon/NeonPidgeon';
import LavaBall from '/assets/models/Monsters/attacks/LavaBall/LavaBall';
import Falcon from '/assets/models/Monsters/Falcon/Falcon';
import Ghost from '/assets/models/Monsters/Ghost/Ghost';


export default class Level
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this._eventManager = new EventManager(new EventCheckContainer, new ModelExtraEventManager);
		this._pointerEventManager; //Setup in load method
        this._frameManager; //Set in subclass load method
        
        this.road = new LevelRoad();
        this.roadColor = "#999999";
        
        this.shockerManager = new ShockerManager();
		this.patternManager = new ModelXPositionPatternManager();
        
        this.ground;
        
        this.tunnelManager = new LevelTunnel();
        
        this._HUD; //the Heads Up Display for the level
        this._HUD = new MainHUD();
        
		//The section the level is currently on
		this._levelSection = 0;
		
        //The edges of the playable area
        this.leftEdge;
        this.rightEdge;
        
        this.monster;
        
        this._musicRef;
        
        this.outsideVisible = false;
        
        this.frameIndex;
        
        this.tunnelLightMaskIndex;
        this.outsideLightMaskIndex;
        
        this.levelSpeed;
        this.levelSpeedRaw;
        this.initialLevelSpeedRaw;
    }
    
    //set things that can only be done after the engines are constructed
    load(gameCanvas, gameContext, camera, frameManager)
    {
        this._registerLevelEvents();
        
        this.leftEdge = 0;
        this.rightEdge = this.kernel.unitsWithinCamera;
		
		this.ground = new LevelGround(gameContext, camera);
		
        this._setupShockerManager(this.leftEdge, this.rightEdge);
        
        this._setupZCalc(gameCanvas);
        
        this._setupLevelSpeed();
		
		this._setupPatternManager();
		
		this._pointerEventManager = new PointerEventManager(gameCanvas);
		
		 this._setupHUD(gameContext, camera, this._pointerEventManager);
		
		//Not an array, so have to loop over normally
		for(let i = 0; i < this.kernel.loadedModels.length; i++)
		{
			this._pointerEventManager.addPointerEventSubject(this.kernel.loadedModels[i]);
		}
    }
	
	_setupPatternManager()
	{
		this.patternManager.setStartingZPosition(this.helpers.zCalc.vPointDepth);
	}
	
	_setupHUD(gameContext, camera, pointerEventManager)
	{
		this._HUD.models.push(this.kernel.loadedModels[0]);
		this._loadHUD(gameContext, camera, pointerEventManager);
	}
	
	_setupLevelSpeed()
	{
		//levelSpeedRaw can be used if you need to check for a change in level speed, or to change it
		
		this.initialLevelSpeedRaw = 600;
        this.levelSpeedRaw = this.initialLevelSpeedRaw;
        this.updateLevelSpeed();
	}
	
	_setupZCalc(canvas)
	{
		this.helpers.zCalc.setVanishPoint(
            () => { return canvas.width / 2; }, 
            () => { return canvas.height / 2; }
        );
	}
	
	_setupShockerManager(leftEdge, rightEdge)
	{
		this.shockerManager.setAreaEdges(leftEdge, rightEdge);
		this.shockerManager.setPlayerModelIndex(0);
	}
	
	_registerLevelEvents()
	{
		//These are the events that are valid across all levels
        this._eventManager.registerEventsArray([
            { 
                eventCheckMethodName: "zCollisionEventCheck",
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: Shocker,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheckMethodName: "hitPlayerOrGroundEventCheck",
                class1: NeonPidgeon,
                class1EventActionName: "hitPlayerOrGroundEventAction",
                class2: Tarian,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheckMethodName: "neonPidgeonOverlappingEventCheck",
                class1: NeonPidgeon,
                class1EventActionName: "neonPidgeonOverlappingEventAction",
                class2: Tarian,
                class2EventActionName: "" //Doesn't have one, and doesn't try to call one
            },
            { 
                eventCheckMethodName: "zCollisionEventCheck",
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: LavaBall,
                class2EventActionName: "hitPlayerEventAction"
            },
            { 
                eventCheckMethodName: "hitPlayerOrGroundEventCheck",
                class1: Falcon,
                class1EventActionName: "hitPlayerOrGroundEventAction",
                class2: Tarian,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheckMethodName: "zCollisionEventCheck",
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: Ghost,
                class2EventActionName: "zCollisionEventAction"
            },
        ]);
	}
    
    _loadHUD(canvasCtx, camera, pointerEventManager)
    {
        this._HUD.load(canvasCtx, camera, pointerEventManager);
    }
    
    get HUD() { return this._HUD; }
    
    //meant to be overridden
    getModels(){}
    act(){}
    
    updateLevelSpeed()
    {
        if(this.levelSpeed != 0)
        {
            this.levelSpeed = this.helpers.zCalc.speed(this.levelSpeedRaw, this.kernel.fps); //need to use this in monsters for death
        }
    }
    
    setLightMask()
    {
        if(
            this.tunnelManager.tunnel.length > 1 && 
            this.tunnelManager.tunnel[this.tunnelManager.tunnel.length - 1].z <= 0 &&
            this.tunnelManager.tunnel[this.tunnelManager.tunnel.length - 2].image
        )
        {
            this._frameManager.getFrameByIndex(this.frameIndex).setLightMaskImage(
                this.tunnelLightMaskIndex
            );
        } else {
            this._frameManager.getFrameByIndex(this.frameIndex).setLightMaskImage(
                this.outsideLightMaskIndex
            );
        }
    }
    
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
    
    levelStop()
    {
        this.levelSpeedRaw = 0;
        
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            this.kernel.loadedModels[i].levelStopped();
        }
    }
}