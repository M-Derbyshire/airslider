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
import ICamera from '../../../engines/GraphicEngine/ICamera';
import IModel from '../../models/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import IFrameManager from '../../../engines/GraphicEngine/IFrameManager';
import EventManager from '../Level/EventManager';
import PointerEventManager from '../Level/PointerEventManager';
import TarianExplosion from '../../models/TarianExplosion/TarianExplosion';
import zCollisionEventCheck from './events/zCollisionEventCheck';
import hitPlayerOrGroundEventCheck from './events/hitPlayerOrGroundEventCheck';
import neonPidgeonOverlappingEventCheck from './events/neonPidgeonOverlappingEventCheck';

/**
 * The game's base Level class
 */
export default class ASLevel extends Level 
{
    protected frameIndex: number; // The index of the level's current frame
    
    //The edges of the playable area
    leftEdge:number;
    rightEdge:number;
    
    // Environment management
    protected roadColor: string;
    protected roadManager: LevelRoad;
    protected groundManager: LevelGround;
    protected tunnelManager: LevelTunnel;
    protected outsideVisible:boolean;
    protected tunnelLightMaskIndex:number;
    protected outsideLightMaskIndex: number;
    protected tunnelSprite: HTMLImageElement;
    protected tunnelSpriteLength: number;
    
    // Shocker management
    protected shockerManager: ShockerManager;
    protected patternManager: ModelXPositionPatternManager;
    
    // Models we want to keep references to
    protected monsters:Monster[];
    protected player:Tarian;
    
    // Level speed management
    levelMoving:boolean; // Is the player moving forwards?
    levelSpeedRaw:number; // The level speed (before being calculated by the zCalc)
    maxLevelSpeedRaw:number; // The maximum speed (before being calculated by the zCalc)
    levelSpeed:number; // The level speed (after being calculated by the zCalc)
    protected levelSpeedAccl:number; // How quickly does the speed accelerate at the start?
    
    // Level section management 
    private _activeSections: string[]; // The IDs of the level sections that are currently active
    private _openingSectionId = "opening"; // The ID of the level's opening section
    private _closingSectionId = "closing"; // The ID of the level's closing section
    
    // Models/info for the opening and closing of the level
    private _startSign:Sign; // The sign at the start of the level
    private _startSignDisplay:SignDisplay; // The light display on the starting sign
    private _finishSign:Sign; // The finish sign
    private _finishFlagsActive:boolean; // Should the flags at the end of the level be active?
    private _signStartingZPosition:number; // Where on the z axis does the startSign start, and the finishSign end?
    private _finishFlagsManager:LevelGround; // Manages the flags at the end of the level
    
	constructor()
	{
		super();
        
        this.HUD = new MainHUD();
		
		this.roadManager = new LevelRoad();
        this.roadColor = "#999999";
        
        this.shockerManager = new ShockerManager();
		this.patternManager = new ModelXPositionPatternManager();
        
        this.tunnelManager = new LevelTunnel();
        
        this._signStartingZPosition = 50;
	}
    
    /**
     * Creates and returns the player model, and the models for the start/finish sequences
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const stdModels = super.getModels();
        
        this.player = new Tarian();
        
        this._startSign = new Sign("", this._signStartingZPosition, -1, true);
        this._startSignDisplay = new SignDisplay(this._startSign);
        this._finishSign = new Sign("FINISH", null, this._signStartingZPosition, false);
        
        return [
            ...stdModels,
            this.player,
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
        
        this.groundManager = new LevelGround();
        this._finishFlagsManager = new LevelGround(false); 
        
        this._finishFlagsManager.load(
            "/assets/levels/ASLevel/images/finish_flag.png",
            312,
            50,
            312
        );
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
        this.leftEdge = 0;
        this.rightEdge = this.kernel.unitsWithinCamera;
        
        this.groundManager.setupGround();
        this._finishFlagsManager.setupGround();
        
        this._activeSections = [this._openingSectionId];
        this.levelMoving = false;
        this._setupLevelSpeed();
        
        this._finishFlagsActive = false;
        
        this._setupShockerManager(this.leftEdge, this.rightEdge);
		this._setupPatternManager();
        
        this.outsideVisible = false;
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        // Keeps level speed consistent, via the fps
        this._updateLevelSpeed();
        
        // If we move outside/inside a tunnel, change the light mask
        this._setLightMask();
        
        // Run the opening section, if required
        this._levelOpening();
    }
    
    /**
     * Draws anything that needs to be in the back (before the models) of the level
     */
    drawBack():void
    {
        if(this.outsideVisible)
            this.groundManager.draw(this.levelSpeed);
        
        if(this._finishFlagsActive)
            this._finishFlagsManager.draw(this.levelSpeed);
        
        this.tunnelManager.draw(this.levelSpeed);
        this.roadManager.draw(this.roadColor);
    }
    
    /**
     * Stops the level (and triggers the stop on all models)
     * This may be triggered by the level's closing sequence, or by another entity in the game
     */
	levelStop():void
    {
        this.levelMoving = false;
        this.kernel.loadedModels.forEach(model => (model as ASModel).levelStopped());
    }
    
    
    
    
    /**
     * Registers all model events for the level
     */
	protected registerLevelEvents():void
	{
		//These are the events that are valid across all levels
        this.eventManager.registerEventsArray([
            { 
                eventCheck: zCollisionEventCheck,
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: Shocker,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheck: zCollisionEventCheck,
                class1: ElectricHornet,
                class1EventActionName: "zCollisionEventAction",
                class2: Tarian,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheck: hitPlayerOrGroundEventCheck,
                class1: NeonPidgeon,
                class1EventActionName: "hitPlayerOrGroundEventAction",
                class2: Tarian,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheck: neonPidgeonOverlappingEventCheck,
                class1: NeonPidgeon,
                class1EventActionName: "neonPidgeonOverlappingEventAction",
                class2: Tarian,
                class2EventActionName: "" //Doesn't have one, and doesn't try to call one
            },
            { 
                eventCheck: hitPlayerOrGroundEventCheck,
                class1: LavaBall,
                class1EventActionName: "hitPlayerOrGroundEventAction",
                class2: Tarian,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheck: hitPlayerOrGroundEventCheck,
                class1: Falcon,
                class1EventActionName: "hitPlayerOrGroundEventAction",
                class2: Tarian,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheck: zCollisionEventCheck,
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: Ghost,
                class2EventActionName: "zCollisionEventAction"
            },
            {
                eventCheck: zCollisionEventCheck,
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: Lightning,
                class2EventActionName: "hitPlayerEventAction"
            },
        ]);
	}
    
    /**
     * Runs a section of the level (if it's time to do so). The initialiseCallback is ran once, then the actCallback 
     * is called every frame. Finally, once the time is greater than msEnd, the endCallback is ran, and the actCallback 
     * is no longer called.
     * @param id A unique ID for the level section
     * @param msStart The time (in milliseconds) when this section should become active
     * @param msEnd The time (in milliseconds) when this section should stop being active
     * @param initialiseCallback A callback to call when this section begins (may be null)
     * @param actCallback A callback to call on every frame while this section is active (may be null)
     * @param endCallback A callback to call when this section is no longer active (may be null)
     */
    protected levelSection(
        id:string, 
        msStart:number, 
        msEnd:number, 
        initialiseCallback?:()=>void, 
        actCallback?:()=>void, 
        endCallback?:()=>void
    ) {
        if(this.levelMoving) {
            const currentMS = this.helpers.time.getTotalMilliseconds();
        
            if(currentMS >= msStart && currentMS <= msEnd) 
            {
                if(!this._activeSections.includes(id)) 
                {
                    if(initialiseCallback)
                        initialiseCallback();
                    
                    this._activeSections.push(id);
                }
                
                if(actCallback)
                    actCallback();
            }
            
            if(currentMS > msEnd && this._activeSections.includes(id)) {
                if(endCallback)
                    endCallback();
                
                // Remove this section from currentSections
                this._activeSections = this._activeSections.filter((cs:string) => cs !== id);
            }
        }
    }
    
    /**
     * Runs the closing sequence, if it is time to do so
     * @param msStart the time (in milliseconds) that the end sequence should start from
     */
    protected levelEndSection(msStart:number)
    {
        if(this.helpers.time.getTotalMilliseconds() >= msStart) {
            if(!this._activeSections.includes(this._closingSectionId)) {
                this._activeSections.push(this._closingSectionId);
                
                // Start the finish flags
                this._finishFlagsActive = true;
            }
            
            this._levelClosing(msStart);
        }
    }
    
    
    
    
    
	
	/**
     * Sets up the model pattern manager
     */
	private _setupPatternManager():void
	{
		this.patternManager.setStartingZPosition(this.helpers.zCalc.vPointDepth);
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
     * Sets up the initial level speed
     */
	private _setupLevelSpeed():void
	{
		this.maxLevelSpeedRaw = 1000;
        this.levelSpeedRaw = 0; // this can be used if you need to check for a change in level speed, or to change it
        this.levelSpeedAccl = 600;
        this._updateLevelSpeed();
	}
    
    /**
     * This calculates the real z-speed (based on the FPS). If we're at the start of the level, it also increases 
     * the raw level speed until it hits the max. If the level is no longer moving, this sets the speed to 0
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
     * Sets the light mask, based on the whether or not the player's going through a tunnel
     */
    private _setLightMask():void
    {
        const tunnelLength = this.tunnelManager.tunnel.length;
        const frame = this.frameManager.getFrameByIndex(this.frameIndex);
        
        const isInside = (
            tunnelLength > 1 && 
            this.tunnelManager.tunnel[tunnelLength - 1].z <= 0 &&
            this.tunnelManager.tunnel[tunnelLength - 2].image
        );
        
        frame.setLightMaskImage(isInside ? this.tunnelLightMaskIndex : this.outsideLightMaskIndex);
    }    
    
    
    
    
    /**
     * Runs the level opening sequence (if it's active)
     */
    private _levelOpening()
    {
        // SignDisplay will start its countdown automatically, so just wait until it's finished
        if(this._activeSections.includes(this._openingSectionId) && this._startSignDisplay.state === "finished")
        {
            this._levelMovementStart();
            
            // Remove opening from _activeSections
            this._activeSections = this._activeSections.filter((cs:string) => cs !== this._openingSectionId);
        }
    }
    
    /**
     * Start the forward movement of the level
     */
    private _levelMovementStart():void
    {
        this.levelMoving = true;
        this.player.canBeControlled = true;
    }
    
    /**
     * Runs the level closing sequence
     * @param closingStartMS the time (in milliseconds) when the closing sequence should start
     */
    private _levelClosing(closingStartMS:number)
    {
        const currentMs = this.helpers.time.getTotalMilliseconds();
        
        if(!this._finishSign.active)
        {
            // End the finish flags, before starting the sign's entrance
            if(currentMs >= (closingStartMS + 3500))
                this._finishFlagsManager.removeGround();
            
            // Trigger the finish sign's entrance
            if(currentMs >= (closingStartMS + 4000))
                this._finishSign.active = true;
        }
        
        // If the sign is in position, stop the level
        if(this._finishSign.hasReachedTargetPosition && this.player.zSpeed === 0)
        {
            this.player.zSpeed = this.levelSpeedRaw;
            this.levelMoving = false;
        }
        
        // Once the player has vanished into the distance, finish the level
        if(this.player.z > this.helpers.zCalc.vPointDepth)
            this.levelStop();
    }
}