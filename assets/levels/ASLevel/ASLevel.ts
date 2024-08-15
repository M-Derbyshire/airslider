import Level from '../Level/Level';
import MainHUD from '../../HUDs/MainHUD/MainHUD';
import LevelRoad from './LevelRoad';
import ObstacleManager from './ObstacleManager';
import ModelXPositionPatternManager from './ModelXPositionPatternManager';
import LevelGround from './LevelGround';
import LevelTunnel from './LevelTunnel';
import Sign from '../../models/Sign/Sign';
import SignDisplay from '../../models/SignDisplay/SignDisplay';
import Tarian from '../../models/Tarian/Tarian';
import Shocker from '../../models/Obstacles/Shocker/Shocker';
import NeonPidgeon from '../../models/Monsters/NeonPidgeon/NeonPidgeon';
import LavaBall from '../../models/Monsters/attacks/LavaBall/LavaBall';
import Lightning from '../../models/Monsters/attacks/Lightning/Lightning';
import Falcon from '../../models/Monsters/Falcon/Falcon';
import Ghost from '../../models/Monsters/Ghost/Ghost';
import ElectricHornet from '../../models/Monsters/ElectricHornet/ElectricHornet';
import Monster from '../../models/Monster/Monster';
import IModel from '../../models/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import IFrameManager from '../../../engines/GraphicEngine/IFrameManager';
import EventManager from '../Level/EventManager';
import PointerEventManager from '../Level/PointerEventManager';
import TarianExplosion from '../../models/TarianExplosion/TarianExplosion';
import zCollisionEventCheck from './events/zCollisionEventCheck';
import hitPlayerOrGroundEventCheck from './events/hitPlayerOrGroundEventCheck';
import neonPidgeonOverlappingEventCheck from './events/neonPidgeonOverlappingEventCheck';
import { CentralStateKey } from '../CentralStateKey';
import ILevel from '../Level/ILevel';
import RacerManager from './RacerManager';
import Kernel from '../../../Kernel/Kernel';
import ASControlsInitialiser from './ASControlsInitialiser';
import IZCalcStrategy from '../../../Kernel/helpers/ZCalc/strategies/IZCalcStrategy';
import LinearVanishingPointStrategy from '../../../Kernel/helpers/ZCalc/strategies/LinearVanishingPointStrategy';

/**
 * The game's base Level class
 */
export default class ASLevel extends Level 
{
    protected frameIndex: number; // The index of the level's current frame
    
    // The edges of the playable area
    leftEdge:number;
    rightEdge:number;
    
    // The strategy for the ZCalc
    protected zCalcStrategy: IZCalcStrategy & {
        vanishingPointX:number,
        vanishingPointY:number,
        vanishingPointDepth:number,
        setVanishPoint:(x:number, y:number, depth?:number)=>void
    };
    
    get vanishingPointX()
    {
        return this.zCalcStrategy.vanishingPointX;
    }
    
    get vanishingPointY()
    {
        return this.zCalcStrategy.vanishingPointY;
    }
    
    get vanishingPointDepth()
    {
        return this.zCalcStrategy.vanishingPointDepth;
    }
    
    // Environment management
    protected roadColor: string;
    protected roadManager: LevelRoad;
    protected groundManager: LevelGround;
    protected tunnelManager: LevelTunnel;
    protected outsideVisible: boolean;
    protected tunnelLightMaskIndex:number;
    protected outsideLightMaskIndex: number;
    protected tunnelSprite: HTMLImageElement;
    protected tunnelSpriteLength: number;
    
    // Management of the other racers on the track
    protected racerManager: RacerManager;
    
    // Obstacle management
    protected obstacleManager: ObstacleManager;
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
    
    // Level ending
    
    // If the player has completed/lost the level, one of these will be set to a positive number (the time in milliseconds)
    protected levelCompletedAtMS:number;
    protected stoppedForlossAtMS:number;
    
    get completed() // Has the level been completed?
    {
        return this.levelCompletedAtMS > 0;
    }
    get lost() // Has the level been lost?
    {
        return this.stoppedForlossAtMS > 0;
    }
    
    private _nextLevelDialogDelayMS:number; // The delay between the level being completed, and the next-level dialog being displayed
    private _retryLevelDialogDelayMS:number; // The delay between the level loss sequence ending, and the retry-level dialog being displayed
    protected NextLevelLoadingScreen:new()=>ILevel; // The class of the loading screen for the next level
    
    // Music management
    protected music:HTMLAudioElement; // The chosen music for the level
    private _musicFilePaths:string[]; // File paths to the music that a level could choose to load
    
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
        
        this.zCalcStrategy = new LinearVanishingPointStrategy();
        
        this.HUD = new MainHUD();
        
        this.controlsInitialiser = new ASControlsInitialiser();
		
		this.roadManager = new LevelRoad();
        this.roadColor = "#999999";
        
        this.obstacleManager = new ObstacleManager();
		this.patternManager = new ModelXPositionPatternManager();
        
        this.tunnelManager = new LevelTunnel();
        
        this.racerManager = new RacerManager();
        
        this._signStartingZPosition = 90;
        
        const musicDir = "/assets/levels/ASLevel/music";
        this._musicFilePaths = [];
        
        this._nextLevelDialogDelayMS = 2000;
        this._retryLevelDialogDelayMS = 2000;
	}
    
    /**
     * Creates and returns the player model, and the models for the start/finish sequences
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const stdModels = super.getModels();
        
        this.player = new Tarian();
        Kernel.getInstance().centralState.set(CentralStateKey.PlayerModelIndex, stdModels.length);
        
        this._startSign = new Sign("", this._signStartingZPosition, -1, true);
        this._startSignDisplay = new SignDisplay(this._startSign);
        this._finishSign = new Sign("FINISH", null, this._signStartingZPosition, false);
        
        const racers = this.racerManager.getModels();
        
        return [
            ...stdModels,
            this.player,
            new TarianExplosion(this.player),
            this._startSign,
            this._startSignDisplay,
            this._finishSign,
            ...racers
        ];
    }
	
    /**
     * Loads and sets up the level
     * @param frameManager The frame manager for the level
     * @param eventManager Manages the event monitoring for a level
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
	load(
        frameManager:IFrameManager,
        eventManager:EventManager,
        pointerEventManager:PointerEventManager
    ):void
	{
		super.load(frameManager, eventManager, pointerEventManager);
        
        this.groundManager = new LevelGround();
        this._finishFlagsManager = new LevelGround(false); 
        
        this._finishFlagsManager.load(
            "/assets/levels/ASLevel/images/finish_flag.png",
            312,
            50,
            312
        );
        
        const chosenMusicFilePath = this._chooseMusicPath();
        if(chosenMusicFilePath)
        {
            this.music = Kernel.getInstance().loadAudio(chosenMusicFilePath);
            this.assetsToUnload.push(chosenMusicFilePath);
        }
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
        const kernel = Kernel.getInstance();
        
        this.zCalcStrategy.setVanishPoint(
            kernel.unitsWithinCameraX / 2, 
            kernel.unitsWithinCameraY / 2
        );
        
        kernel.helpers.zCalc.setStrategy(this.zCalcStrategy);
        
        this.leftEdge = 0;
        this.rightEdge = kernel.unitsWithinCameraX;
        
        this.racerManager.prepare();
        
        this.groundManager.setupGround();
        this._finishFlagsManager.setupGround();
        
        this._activeSections = [this._openingSectionId];
        this.levelMoving = false;
        this._setupLevelSpeed();
        
        this._finishFlagsActive = false;
        
        this._setupObstacleManager(this.leftEdge, this.rightEdge);
		this._setupPatternManager();
        
        this.outsideVisible = false;
        
        this.levelCompletedAtMS = -1;
        this.stoppedForlossAtMS = -1;
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        const timeHelpers = Kernel.getInstance().helpers.time;
        
        // Keeps level speed consistent, via the fps
        this._updateLevelSpeed();
        
        // If we move outside/inside a tunnel, change the light mask
        this._setLightMask();
        
        // Run the opening section, if required
        this._levelOpening();
        
        // Display the retry-level dialog, if required
        const currentMs = timeHelpers.getTotalMilliseconds();
        if(this.lost && currentMs > this.stoppedForlossAtMS + this._retryLevelDialogDelayMS)
            (this.HUD as MainHUD).displayRetryLevelDialog();
        
        // Let the RacerManager do what it needs to do each frame
        this.racerManager.act();
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
     * Handles the loss of the player
     */
    handlePlayerLoss():void
    {
        const timeHelpers = Kernel.getInstance().helpers.time;
        
        this.stoppedForlossAtMS = timeHelpers.getTotalMilliseconds();
        this._stopLevel();
    }
    
    /**
     * Stops the level (and triggers the stop on all models)
     * This may be triggered by the level's closing sequence, or by another entity in the game
     */
	_stopLevel():void
    {
        this.levelMoving = false;
        Kernel.getInstance().loadedModels.forEach(model => (model as ASModel).levelStopped());
        this.racerManager.startOvertakeSequence();
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
            const currentMS = Kernel.getInstance().helpers.time.getTotalMilliseconds();
        
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
        const kernel = Kernel.getInstance();
        
        if(kernel.helpers.time.getTotalMilliseconds() >= msStart) {
            if(!this._activeSections.includes(this._closingSectionId)) {
                this._activeSections.push(this._closingSectionId);
                
                // Start the finish flags
                this._finishFlagsActive = true;
                
                // Start the loading of the next level's loading screen
                kernel.loadLevel(new this.NextLevelLoadingScreen());
            }
            
            this._levelClosing(msStart);
        }
    }
    
    
    
    
    
	
	/**
     * Sets up the model pattern manager
     */
	private _setupPatternManager():void
	{
		this.patternManager.setStartingZPosition(this.zCalcStrategy.vanishingPointDepth);
	}
	
    /**
     * Sets up the obstacle manager
     * @param leftEdge the left edge (in units) of the level
     * @param rightEdge the right edge (in units) of the level
     */
	private _setupObstacleManager(leftEdge:number, rightEdge:number):void
	{
		this.obstacleManager.setAreaEdges(leftEdge, rightEdge);
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
            const kernel = Kernel.getInstance();
            
            if(this.levelSpeedRaw < this.maxLevelSpeedRaw)
            {
                this.levelSpeedRaw += kernel.helpers.zCalc.speed(this.levelSpeedAccl, kernel.fps);
            } else {
                this.levelSpeedRaw = this.maxLevelSpeedRaw;
            }
            
            this.levelSpeed = kernel.helpers.zCalc.speed(this.levelSpeedRaw, kernel.fps);
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
            this.racerManager.startLaunchSequence();
            
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
        const currentMs = Kernel.getInstance().helpers.time.getTotalMilliseconds();
        
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
        if(this.player.z > this.zCalcStrategy.vanishingPointDepth && !this.completed)
        {
            this._stopLevel();
            this.levelCompletedAtMS = currentMs;
        }
        
        if(this.completed && currentMs > this.levelCompletedAtMS + this._nextLevelDialogDelayMS)
            (this.HUD as MainHUD).displayNextLevelDialog();
    }
    
    /**
     * Chooses the music filepath from the array of music filepaths, and returns it.
     * This will set the music filepath in the Kernel's centralState map, so it 
     * can ensure that the next level doesn't select the same music (if 
     * multiple paths are available).
     * If no filepaths are availble, this will return null.
     */
    private _chooseMusicPath():string|null
    {
        if(!this._musicFilePaths.length)
            return null;
        
        if(this._musicFilePaths.length === 1)
            return this._musicFilePaths[0];
        
        const kernel = Kernel.getInstance();
        
        // We want to filter out the filepath used by the previous level
        const selectableFilePaths = this._musicFilePaths.filter(
            filepath => filepath !== kernel.centralState.get(CentralStateKey.LastMusicSelectedPath)
        );
        
        // Now choose a random path
        const lastIndex = selectableFilePaths.length - 1;
        const indexToSelect = Math.round(
            Math.random() * lastIndex
        );
        
        const chosenPath = selectableFilePaths[indexToSelect];
        
        kernel.centralState.set(CentralStateKey.LastMusicSelectedPath, chosenPath);
        return chosenPath;
    }
}