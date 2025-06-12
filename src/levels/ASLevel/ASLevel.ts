import Level from '../../../Kernel/entities/Level/Level';
import MainHUD from '../../HUDs/MainHUD/MainHUD';
import LevelRoad from './LevelRoad';
import ObstacleManager from './ObstacleManager';
import ObstaclePatternManager from './ObstaclePatternManager';
import LevelGround from './LevelGround';
import LevelTunnel from './LevelTunnel';
import Sign from '../../models/Sign/Sign';
import SignDisplay from '../../models/SignDisplay/SignDisplay';
import Tarian from '../../models/Tarian/Tarian';
import Monster from '../../models/Monster/Monster';
import IModel from '../../../Kernel/entities/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import TarianExplosion from '../../models/TarianExplosion/TarianExplosion';
import { CentralStateKey } from '../CentralStateKey';
import ILevel from '../../../Kernel/entities/Level/ILevel';
import RacerManager from './RacerManager';
import Kernel from '../../../Kernel/Kernel';
import ASControlsInitialiser from './ASControlsInitialiser';
import LinearVanishingPointStrategy from '../../../Kernel/utils/ZCalc/strategies/LinearVanishingPointStrategy';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import Frame from '../../../Kernel/engines/GraphicEngine/Frame';
import MusicManager from './MusicManager';
import standardModelEvents from './events/standardModelEvents';
import UnitHelper from '../../../Kernel/utils/UnitHelper';
import ZCalc from '../../../Kernel/utils/ZCalc/ZCalc';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import Obstacle from '../../models/Obstacle/Obstacle';

/**
 * The game's base Level class
 */
export default class ASLevel<ObstacleType extends Obstacle = Obstacle> extends Level 
{
    // The edges of the playable area
    leftEdge:number;
    rightEdge:number;
    
    protected zCalcStrategy: LinearVanishingPointStrategy;
    
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
    
    // Frame management
    protected frame: Frame;
    protected backgroundImage: HTMLImageElement;
    protected outsideLightMaskImage: HTMLImageElement;
    protected outsideLightMaskLuminosity: number;
    protected insideLightMaskImage: HTMLImageElement;
    protected insideLightMaskLuminosity: number;
    
    // Environment management
    protected roadColor: string;
    protected roadManager: LevelRoad;
    protected groundManager: LevelGround;
    protected tunnelManager: LevelTunnel;
    protected outsideVisible: boolean;
    protected tunnelSprite: HTMLImageElement;
    protected tunnelSpriteLength: number;
    
    // Management of the other racers on the track
    protected racerManager: RacerManager;
    
    // Obstacle management
    protected obstacleManager: ObstacleManager<ObstacleType>;
    protected patternManager: ObstaclePatternManager<ObstacleType>;
    
    // Models we want to keep references to
    protected monsters:Monster[];
    protected player:Tarian;
    
    // Level speed management
    levelMoving:boolean; // Is the player moving forwards?
    levelSpeedRaw:number; // The level speed (before being calculated by the UnitHelper)
    maxLevelSpeedRaw:number; // The maximum speed (before being calculated by the UnitHelper)
    levelSpeed:number; // The level speed (after being calculated by the UnitHelper)
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
    protected musicFilePaths:string[]; // File paths to the music a level can load (one will be picked by the MusicManager)
    protected musicVolume:number; // The maximum volume of the music
    private _musicManager:MusicManager; // Manages the level's music
    
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
        this.roadColor = "#A5A5A5";
        
        this.obstacleManager = new ObstacleManager<ObstacleType>();
		this.patternManager = new ObstaclePatternManager<ObstacleType>();
        
        this.tunnelManager = new LevelTunnel();
        
        this.racerManager = new RacerManager();
        
        this._signStartingZPosition = 90;
        
        const musicDir = "/levels/ASLevel/music";
        this.musicFilePaths = [
            `${musicDir}/airslider_track_1.mp3`,
            `${musicDir}/airslider_track_2.mp3`,
            `${musicDir}/airslider_track_3.mp3`
        ];
        this.musicVolume = 0.5;
        this._musicManager = new MusicManager();
        
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
        
        const centralState = Kernel.getInstance().centralState;
        
        this.player = new Tarian();
        centralState.set(CentralStateKey.PlayerModelIndex, stdModels.length);
        
        this._startSign = new Sign("", this._signStartingZPosition, -1, true);
        this._startSignDisplay = new SignDisplay(this._startSign);
        this._finishSign = new Sign("FINISH", null, this._signStartingZPosition, false);
        
        this.groundManager.setDistancedModels([this._startSign, this._finishSign]);
        
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
        eventManager:IEventManager,
        pointerEventManager:IPointerEventManager
    ):void
	{
		super.load(frameManager, eventManager, pointerEventManager);
        
        this.groundManager = new LevelGround();
        this._finishFlagsManager = new LevelGround(false); 
        
        this._finishFlagsManager.load(
            "/levels/ASLevel/images/finish_flag.png",
            312,
            50,
            312
        );
        
        const chosenMusicFilePath = this._musicManager.load(this.musicFilePaths);
        if(chosenMusicFilePath)
            this.assetsToUnload.push(chosenMusicFilePath);
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
        const settings = Kernel.getInstance().settings;
        
        this.zCalcStrategy.setVanishPoint(
            settings.unitsWithinCameraX / 2, 
            settings.unitsWithinCameraY / 2
        );
        
        ZCalc.setStrategy(this.zCalcStrategy);
        
        this.leftEdge = 0;
        this.rightEdge = settings.unitsWithinCameraX;
        
        this._prepareFrame();
        
        this._musicManager.prepare(this.musicVolume);
        
        this.racerManager.prepare();
        
        this.groundManager.setupGround();
        this._finishFlagsManager.setupGround();
        
        this._activeSections = [this._openingSectionId];
        this.levelMoving = false;
        this._setupLevelSpeed();
        
        this._finishFlagsActive = false;
        
        this._setupObstacleManager(this.leftEdge, this.rightEdge);
        
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
        
        // Keeps level speed consistent, via the fps
        this._updateLevelSpeed();
        
        // If we move outside/inside a tunnel, change the light mask
        this._setLightMask();
        
        // Let the MusicManager do what it needs to do each frame
        this._musicManager.act();
        
        // Run the opening section, if required
        this._levelOpening();
        
        // Display the retry-level dialog, if required
        const currentMs = Kernel.getInstance().totalLevelActiveMilliseconds;
        if(this.lost && currentMs > this.stoppedForlossAtMS + this._retryLevelDialogDelayMS)
        {
            (this.HUD as MainHUD).displayRetryLevelDialog();
            this._musicManager.startFadeOutProcess();
        }    
        
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
        this.stoppedForlossAtMS = Kernel.getInstance().totalLevelActiveMilliseconds;
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
     * Setup the frame for the level
     */
    private _prepareFrame():void
    {
        const settings = Kernel.getInstance().settings;
        
        //Setup the frame for the level
        this.frame = new Frame(0, 0, settings.unitsWithinCameraX, settings.unitsWithinCameraY);
        
        // The light mask will be set during the gameplay (based on whether we're inside or outside a tunnel)
        // However, the background should be consistent, so we set it here.
        this.frame.setBackgroundImage(this.backgroundImage);
        
        this.frameManager.setFrames([this.frame]);
    }
    
    /**
     * Registers all model events for the level
     */
	protected registerLevelEvents():void
	{
        super.registerLevelEvents();
        this.eventManager.registerEventsArray(standardModelEvents);
	}
    
    /**
     * Runs a section of the level (if it's time to do so). The initialiseCallback is ran once, then the actCallback 
     * is called on every frame. Finally, once the time is greater than secsEnd, the endCallback is ran, and the actCallback 
     * is no longer called.
     * @param id A unique ID for the level section
     * @param secsStart The time (in seconds) when this section should become active
     * @param secsEnd The time (in seconds) when this section should stop being active
     * @param initialiseCallback A callback to call when this section begins (may be null)
     * @param actCallback A callback to call on every frame while this section is active (may be null)
     * @param endCallback A callback to call when this section is no longer active (may be null)
     */
    protected levelSection(
        id:string, 
        secsStart:number, 
        secsEnd:number, 
        initialiseCallback?:()=>void, 
        actCallback?:()=>void, 
        endCallback?:()=>void
    ) {
        if(this.levelMoving) {
            const currentSecs = Kernel.getInstance().totalLevelActiveMilliseconds / 1000;
            const actionIsActive = this._activeSections.includes(id);
        
            if(currentSecs >= secsStart && currentSecs <= secsEnd) 
            {
                if(!actionIsActive)
                {
                    if(initialiseCallback)
                        initialiseCallback();
                    
                    this._activeSections.push(id);
                }
                
                if(actCallback)
                    actCallback();
            }
            
            if(currentSecs > secsEnd && actionIsActive) {
                if(endCallback)
                    endCallback();
                
                this._activeSections = this._activeSections.filter((activeId:string) => activeId !== id);
            }
        }
    }
    
    /**
     * Runs the closing sequence, if it is time to do so
     * @param secsStart the time (in seconds) that the end sequence should start from
     */
    protected levelEndSection(secsStart:number)
    {
        const kernel = Kernel.getInstance();
        const msStart = secsStart * 1000;
        
        if(kernel.totalLevelActiveMilliseconds >= msStart) {
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
            if(this.levelSpeedRaw < this.maxLevelSpeedRaw)
            {
                this.levelSpeedRaw += UnitHelper.speed(this.levelSpeedAccl);
            } else {
                this.levelSpeedRaw = this.maxLevelSpeedRaw;
            }
            
            this.levelSpeed = UnitHelper.speed(this.levelSpeedRaw);
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
        
        const isInside = (
            tunnelLength > 1 && 
            this.tunnelManager.tunnel[tunnelLength - 1].zPosition <= 0 &&
            this.tunnelManager.tunnel[tunnelLength - 2].image
        );
        
        if(isInside)
        {
            this.frame.setLightMaskImage(this.insideLightMaskImage, this.insideLightMaskLuminosity);
        }
        else
        {
            this.frame.setLightMaskImage(this.outsideLightMaskImage, this.outsideLightMaskLuminosity);
        }
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
            this._activeSections = this._activeSections.filter((s:string) => s !== this._openingSectionId);
        }
    }
    
    /**
     * Start the forward movement of the level
     */
    private _levelMovementStart():void
    {
        this.levelMoving = true;
        this.player.canBeControlled = true;
        this._musicManager.startFadeInProcess();
    }
    
    /**
     * Runs the level closing sequence
     * @param closingStartMS the time (in milliseconds) when the closing sequence should start
     */
    private _levelClosing(closingStartMS:number)
    {
        const currentMs = Kernel.getInstance().totalLevelActiveMilliseconds;
        
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
        {
            (this.HUD as MainHUD).displayNextLevelDialog();
            this._musicManager.startFadeOutProcess();
        }
    }
}