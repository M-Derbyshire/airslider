import Level from '../Level/Level';
import MainHUD from '../../HUDs/MainHUD/mainHUD';
import LevelRoad from './LevelRoad';
import ShockerManager from './ShockerManager';
import ModelXPositionPatternManager from './ModelXPositionPatternManager';
import LevelGround from './LevelGround';
import LevelTunnel from './LevelTunnel';
import Sign from '../../models/Sign/Sign';
import SignDisplay from '../../models/SignDisplay/SignDisplay';
import Tarian from '../../models/Tarian/Tarian';
import Shocker from '../..//models/Shocker/Shocker';
import NeonPidgeon from '../../models/Monsters/NeonPidgeon/NeonPidgeon';
import LavaBall from '../../models/Monsters/attacks/LavaBall/LavaBall';
import Lightning from '../../models/Monsters/attacks/Lightning/Lightning';
import Falcon from '../../models/Monsters/Falcon/Falcon';
import Ghost from '../../models/Monsters/Ghost/Ghost';
import ElectricHornet from '../../models/Monsters/ElectricHornet/ElectricHornet';
import Monster from '../../models/Monster/Monster';
import ICamera from '../../../engines/GraphicEn/ICamera';
import IPointerEventManager from '../Level/IPointerEventManager';
import IModel from '../../models/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import IFrameManager from '../../../engines/GraphicEn/IFrameManager';

/**
 * The game's base Level class
 */
export default class ASLevel extends Level 
{
    //The edges of the playable area
    leftEdge:number;
    rightEdge:number;
    
    protected road: LevelRoad;
    protected roadColor: string;
    protected ground: LevelGround;
    protected tunnelManager: LevelTunnel;
    
    protected shockerManager: ShockerManager;
    protected patternManager: ModelXPositionPatternManager;
    
    protected levelSection: number; // The section the level is currently on (0 is the opening sequence)
    protected levelClosingSectionNumber:number; // The closing section number is defined by the child level.
    protected timeLevelClosingBeginMS:number; // When (in milliseconds) did the closing sequence begin
    
    protected monsters:Monster;
    protected player:IModel;
    
    protected outsideVisible:boolean;
    protected tunnelLightMaskIndex:number;
    protected outsideLightMaskIndex: number;
    
    protected levelMoving:boolean;
    protected levelSpeed:number;
    protected levelSpeedRaw:number;
    protected maxLevelSpeedRaw:number;
    protected levelSpeedAccl; // How quickly does the speed accelerate at the start?
    
    
    private _tunnelSprite: HTMLImageElement;
    private _tunnelSpriteLength: number;
    
    // Models/info for opening and closing of level
    private _startSign: IModel;
    private _startSignDisplay:IModel;
    private _finishSign:IModel;
    private _finishFlagsActive:boolean;
    private _signStartingZPosition:number;
    private _finishFlagsManager:LevelGround;
    
    /**
     * Constructor
     */
	constructor()
	{
		super();
        
        this.HUD = new MainHUD();
		
		this.road = new LevelRoad();
        this.roadColor = "#999999";
        
        this.shockerManager = new ShockerManager();
		this.patternManager = new ModelXPositionPatternManager();
        
        this.ground;
        
        this.tunnelManager = new LevelTunnel();
        this._tunnelSprite;
        this._tunnelSpriteLength;
		
		this.levelSection = 0;
        this.levelClosingSectionNumber = 1;
        this.timeLevelClosingBeginMS = 0;
		
        this.leftEdge;
        this.rightEdge;
        
        this.monsters;
        this.player;
		
		this.outsideVisible = false;
		
		this.tunnelLightMaskIndex;
        this.outsideLightMaskIndex;
        
        this.levelMoving = false;
        this.levelSpeed;
        this.levelSpeedRaw;
        this.maxLevelSpeedRaw;
        this.levelSpeedAccl; // How quickly does the speed accelerate at the start?
        
        // Models/info for opening and closing of level
        this._startSign;
        this._startSignDisplay;
        this._finishSign;
        this._finishFlagsActive = false;
        this._signStartingZPosition = 50;
	}
    
    getModels():IModel[]
    {
        this._startSign = new Sign("", this._signStartingZPosition, -1, true);
        this._startSignDisplay = new SignDisplay(this._startSign);
        this._finishSign = new Sign("FINISH", this.helpers.zCalc.vPointDepth, this._signStartingZPosition, false);
        
        return [
            this._startSign,
            this._startSignDisplay,
            this._finishSign
        ];
    }
	
	load(gameCanvas:HTMLCanvasElement, gameContext:CanvasRenderingContext2D, camera:ICamera, frameManager:IFrameManager):void
	{
		super.load(gameCanvas, gameContext, camera, frameManager);
        
		this.leftEdge = 0;
        this.rightEdge = this.kernel.unitsWithinCamera;
        
        this.ground = new LevelGround(gameContext, camera);
        this._finishFlagsManager = new LevelGround(gameContext, camera, false); 
        
        this._finishFlagsManager.load(
            "/assets/levels/ASLevel/images/finish_flag.png",
            312,
            50,
            500
        );
		
        this._setupShockerManager(this.leftEdge, this.rightEdge);
		
		this._setupLevelSpeed();
		
		this._setupPatternManager();
	}
    
    prepare():void
    {
        super.prepare();
        this.ground.setupGround();
        this._finishFlagsManager.setupGround();
        
        this._finishFlagsActive = false;
        this.levelMoving = false;
    }
    
    unload():void
    {
        super.unload();
    }
    
    /**
     * Run any setup required by the level's HUD
     * @param gameContext The 2D canvas context
     * @param camera The game's camera
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
	setupHUD(gameContext:CanvasRenderingContext2D, camera:ICamera, pointerEventManager:IPointerEventManager):void
	{
		this.HUD.models.push(this.kernel.loadedModels[0]);
	}
	
	
	private _setupPatternManager():void
	{
		this.patternManager.setStartingZPosition(this.helpers.zCalc.vPointDepth);
	}
	
	private _setupLevelSpeed():void
	{
		//levelSpeedRaw can be used if you need to check for a change in level speed, or to change it
		this.maxLevelSpeedRaw = 1000;
        this.levelSpeedRaw = 0;
        this.levelSpeedAccl = 600;
        this._updateLevelSpeed();
	}
	
	private _setupShockerManager(leftEdge:number, rightEdge:number):void
	{
		this.shockerManager.setAreaEdges(leftEdge, rightEdge);
		this.shockerManager.setPlayerModelIndex(0);
	}
	
	
	
	protected registerLevelEvents():void
	{
		//These are the events that are valid across all levels
        this.eventManager.registerEventsArray([
            { 
                eventCheckMethodName: "zCollisionEventCheck",
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: Shocker,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheckMethodName: "zCollisionEventCheck",
                class1: ElectricHornet,
                class1EventActionName: "zCollisionEventAction",
                class2: Tarian,
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
            {
              eventCheckMethodName: "zCollisionEventCheck",
              class1: Tarian,
              class1EventActionName: "zCollisionEventAction",
              class2: Lightning,
              class2EventActionName: "hitPlayerEventAction"
            },
        ]);
	}
    
    act():void
    {
        super.act();
        this._updateLevelSpeed(); //keeps level speed consistent via fps
        
        //if outside/inside changes, change light mask
        this._setLightMask();
        
        // Opening
        if(this.levelSection === 0)
        {
            this._levelOpening();
        }
        
        // closing
        if(this.levelMoving && this.levelSection === this.levelClosingSectionNumber)
        {
            this._levelClosing();
        }
    }
	
	private _updateLevelSpeed():void
    {
        if(this.levelMoving)
        {
            if(this.levelSpeedRaw < this.maxLevelSpeedRaw)
            {
                this.levelSpeedRaw += this.helpers.zCalc.speed(this.levelSpeedAccl, this.kernel.fps);
            } else {
                this.levelSpeedRaw = this.maxLevelSpeedRaw;
            }
            
            this.levelSpeed = this.helpers.zCalc.speed(this.levelSpeedRaw, this.kernel.fps);
        }
        else
        {
            this.levelSpeed = 0;
        }
    }
    
    private _setLightMask():void
    {
        if(
            this.tunnelManager.tunnel.length > 1 && 
            this.tunnelManager.tunnel[this.tunnelManager.tunnel.length - 1].z <= 0 &&
            this.tunnelManager.tunnel[this.tunnelManager.tunnel.length - 2].image
        )
        {
            this.frameManager.getFrameByIndex(this.frameIndex).setLightMaskImage(
                this.tunnelLightMaskIndex
            );
        } else {
            this.frameManager.getFrameByIndex(this.frameIndex).setLightMaskImage(
                this.outsideLightMaskIndex
            );
        }
    }
    
    // Start the forward movement of the level (increases until it reaches max)
    private _levelMovementStart():void
    {
        this.levelMoving = true;
        (this.kernel.loadedModels[this.kernel.settings.playerModelIndex] as ASModel).canBeControlled = true;
    }
	
	levelStop():void
    {
        this.levelMoving = false;
        this.kernel.loadedModels.forEach(model => (model as ASModel).levelStopped());
    }
    
    drawBack():void
    {
        if(this.outsideVisible)
        {
            this.ground.draw(this.levelSpeed);
        }
        
        // Not doing this in the above if statement, because draw() needs to be called to add more flags
        if(this._finishFlagsActive)
            this._finishFlagsManager.draw(this.levelSpeed);
        
        this.tunnelManager.draw(this.levelSpeed);
        this.road.draw(this.roadColor);
    }
    
    // Opening and closing sequences for the levels
    private _levelOpening()
    {
        // SignDisplay will start the countdown automatically
        
        if(this._startSignDisplay.state === "go")
        {
            this._levelMovementStart();
            this.levelSection++;
        }
    }
    
    private _levelClosing()
    {
        // Start the finish flags, and record when the closing sequence began
        if(!this.timeLevelClosingBeginMS)
        {
            this.timeLevelClosingBeginMS = this.helpers.time.getTotalMilliseconds();
            this._finishFlagsActive = true;
        }
        
        // End the finish flags, before starting the sign's entrance
        if(!this._finishSign.active && this.helpers.time.getTotalMilliseconds() >= (this.timeLevelClosingBeginMS + 3500))
        {
            this._finishFlagsManager.removeGround();
        }
        
        // Trigger the finish sign's entrance
        if(!this._finishSign.active && this.helpers.time.getTotalMilliseconds() >= (this.timeLevelClosingBeginMS + 4000))
        {
            this._finishSign.active = true;
        }
        
        // If the sign is in position, stop the level
        if(this._finishSign.z === this._signStartingZPosition && this.player.zSpeed === 0)
        {
            this.player.zSpeed = this.levelSpeedRaw;
            this.levelMoving = false;
        }
        
        if(this.player.z > this.helpers.zCalc.vPointDepth)
            this.levelStop();
    }
}