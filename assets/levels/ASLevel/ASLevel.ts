import Level from '../Level/Level';
import MainHUD from '../../HUDs/MainHUD/MainHUD';
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
import IModel from '../../models/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import IFrameManager from '../../../engines/GraphicEn/IFrameManager';
import EventManager from '../Level/EventManager';
import PointerEventManager from '../Level/PointerEventManager';
import TarianExplosion from '../../models/TarianExplosion/TarianExplosion';

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
    
    protected monsters:Monster[];
    protected player:Tarian;
    
    protected outsideVisible:boolean;
    protected tunnelLightMaskIndex:number;
    protected outsideLightMaskIndex: number;
    
    levelMoving:boolean; // Is the player moving forwards?
    levelSpeed:number; // The level speed (after being calculated by the zCalc)
    levelSpeedRaw:number; // The level speed (before being calculated by the zCalc)
    maxLevelSpeedRaw:number; // The maximum speed (before being calculated by the zCalc)
    protected levelSpeedAccl:number; // How quickly does the speed accelerate at the start?
    
    protected tunnelSprite: HTMLImageElement;
    protected tunnelSpriteLength: number;
    
    private _currentSections: string[]; // The IDs of the level sections that are currently active
    private _openingSectionId = "opening"; // The ID of the level's opening section
    private _closingSectionId = "closing"; // The ID of the level's closing section
    
    // Models/info for opening and closing of level
    private _startSign:Sign;
    private _startSignDisplay:SignDisplay;
    private _finishSign:Sign;
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
        
        this.tunnelManager = new LevelTunnel();
        
        this._signStartingZPosition = 50;
	}
    
    /**
     * Creates and returns the models for the start/finish sequences
     * @returns the models for the start/finish sequences
     */
    getModels():IModel[]
    {
        this.player = new Tarian();
        
        this._startSign = new Sign("", this._signStartingZPosition, -1, true);
        this._startSignDisplay = new SignDisplay(this._startSign);
        this._finishSign = new Sign("FINISH", this.helpers.zCalc.vPointDepth, this._signStartingZPosition, false);
        
        return [
            this.player, // Needs to be index 0
            new TarianExplosion(this.player),
            this._startSign,
            this._startSignDisplay,
            this._finishSign
        ];
    }
	
    /**
     * Loads and sets up the level
     * @param camera The game's camera
     * @param frameManager The frame manager for the level
     * @param eventManager Manages the event monitoring for a level
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
	load(
        camera:ICamera, 
        frameManager:IFrameManager,
        eventManager:EventManager,
        pointerEventManager:PointerEventManager
    ):void
	{
		super.load(camera, frameManager, eventManager, pointerEventManager);
        
		this.leftEdge = 0;
        this.rightEdge = this.kernel.unitsWithinCamera;
        
        this.ground = new LevelGround(camera);
        this._finishFlagsManager = new LevelGround(camera, false); 
        
        this._finishFlagsManager.load(
            "/assets/levels/ASLevel/images/finish_flag.png",
            312,
            50,
            500
        );
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
        this.ground.setupGround();
        this._finishFlagsManager.setupGround();
        
        this._currentSections = [this._openingSectionId];
		
		this.outsideVisible = false;
        
        this.levelMoving = false;
        
        this._finishFlagsActive = false;
        
        this._setupShockerManager(this.leftEdge, this.rightEdge);
		
		this._setupLevelSpeed();
		
		this._setupPatternManager();
    }
	
	/**
     * Sets up the model patter manager
     */
	private _setupPatternManager():void
	{
		this.patternManager.setStartingZPosition(this.helpers.zCalc.vPointDepth);
	}
	
    /**
     * Sets up the initial level speed
     */
	private _setupLevelSpeed():void
	{
		//levelSpeedRaw can be used if you need to check for a change in level speed, or to change it
		this.maxLevelSpeedRaw = 1000;
        this.levelSpeedRaw = 0;
        this.levelSpeedAccl = 600;
        this._updateLevelSpeed();
	}
	
    /**
     * Sets up the shocker manager
     * @param leftEdge the left edge (in units) of the level
     * @param rightEdge the right edge (in units) of the level
     */
	private _setupShockerManager(leftEdge:number, rightEdge:number):void
	{
		this.shockerManager.setAreaEdges(leftEdge, rightEdge);
	}
	
	
	/**
     * Registers all model events for the level
     */
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
    
    /**
     * Runs the level's actions. This is ran on every frame.
     */
    act():void
    {
        super.act();
        this._updateLevelSpeed(); //keeps level speed consistent via fps
        
        //if outside/inside changes, change light mask
        this._setLightMask();
        
        // Opening section
        this._levelOpening();
    }
    
    /**
     * Runs a section of the level (if it's time to do so). The initialiseCallback is ran once, then the actCallback 
     * is called every frame. Finally, once the time is greater than msEnd, the endCallback is ran
     * @param id A unique ID for the level section
     * @param msStart The time (in milliseconds) when this section should become active
     * @param msEnd The time (in milliseconds) when this section should stop being active
     * @param initialiseCallback A callback to call once when this section begins
     * @param actCallback A callback to call on every frame while this section is active
     * @param endCallback A callback to call once when this section is no longer active
     */
    protected levelSection(id:string, msStart:number, msEnd:number, initialiseCallback?:()=>void, actCallback?:()=>void, endCallback?:()=>void) {
        if(this.levelMoving) {
            const currentMS = this.helpers.time.getTotalMilliseconds();
        
            if(currentMS >= msStart && currentMS <= msEnd) {
                if(!this._currentSections.includes(id)) {
                    if(initialiseCallback)
                        initialiseCallback();
                    
                    this._currentSections.push(id);
                }
                
                if(this._currentSections.includes(id) && actCallback)
                    actCallback();
            }
            
            if(currentMS > msEnd && this._currentSections.includes(id)) {
                if(endCallback)
                    endCallback();
                
                // Remove this section from currentSections
                this._currentSections = this._currentSections.filter((cs:string) => cs !== id);
            }
        }
    }
	
    
    
    /**
     * This increases the raw level speed to its max (or stops it, if level is not moving), and calculates the real z-speed
     */
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
    
    /**
     * Sets the light mask, dependant on the whether or not the player's going through a tunnel
     */
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
    
    
	
    
    
    
    
    /**
     * Draws anything that needs to be in the back (before the models) of the level
     */
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
    
    /**
     * Runs the level opening sequence
     */
    private _levelOpening()
    {
        // SignDisplay will start its countdown automatically
        if(this._currentSections.includes(this._openingSectionId) && this._startSignDisplay.state === "finished")
        {
            this._levelMovementStart();
            
            // Remove opening from _currentSections
            this._currentSections = this._currentSections.filter((cs:string) => cs !== this._openingSectionId);
        }
    }
    
    /**
     * Start the forward movement of the level
     */
    private _levelMovementStart():void
    {
        this.levelMoving = true;
        (this.kernel.loadedModels[this.kernel.settings.playerModelIndex] as ASModel).canBeControlled = true;
    }
    
    
    
    
    
    
    /**
     * Runs the closing sequence, if it is time to do so
     * @param msStart the time (in milliseconds) that the end sequence should start
     */
    protected levelEndSection(msStart:number)
    {
        if(this.helpers.time.getTotalMilliseconds() >= msStart) {
            
            // initialise the closing sequence
            if(!this._currentSections.includes(this._closingSectionId)) {
                this._currentSections.push(this._closingSectionId);
                
                // Start the finish flags
                this._finishFlagsActive = true;
            }
            
            this._levelClosing(msStart);
        }
    }
    
    /**
     * Continous action method for the level closing sequence
     * @param closingBeganMS the time (in milliseconds) when the closing sequence began
     */
    private _levelClosing(closingBeganMS:number)
    {
        // End the finish flags, before starting the sign's entrance
        if(!this._finishSign.active && this.helpers.time.getTotalMilliseconds() >= (closingBeganMS + 3500))
        {
            this._finishFlagsManager.removeGround();
        }
        
        // Trigger the finish sign's entrance
        if(!this._finishSign.active && this.helpers.time.getTotalMilliseconds() >= (closingBeganMS + 4000))
        {
            this._finishSign.active = true;
        }
        
        // If the sign is in position, stop the level
        if(this._finishSign.hasReachedTargetPosition && this.player.zSpeed === 0)
        {
            this.player.zSpeed = this.levelSpeedRaw;
            this.levelMoving = false;
        }
        
        if(this.player.z > this.helpers.zCalc.vPointDepth)
            this.levelStop();
    }
    
    /**
     * Stops the level (and triggers the stop on all models)
     * This can be triggered by the level's closing sequence, or by another entity in the game
     */
	levelStop():void
    {
        this.levelMoving = false;
        this.kernel.loadedModels.forEach(model => (model as ASModel).levelStopped());
    }
}