import Level from '../../../Kernel/entities/Level/Level';
import MainHUD from '../../HUDs/MainHUD/MainHUD';
import LevelRoadManager from './LevelRoadManager';
import ObstacleManager from './ObstacleManager/ObstacleManager';
import ObstaclePatternManager from './ObstaclePatternManager';
import LevelGroundManager from './LevelGroundManager';
import Sign from '../../models/Sign/Sign';
import SignDisplay from '../../models/SignDisplay/SignDisplay';
import Tarian from '../../models/Tarian/Tarian';
import Monster from '../../models/Monster/Monster';
import IModel from '../../../Kernel/entities/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import TarianExplosion from '../../models/TarianExplosion/TarianExplosion';
import { CentralStateKey } from '../CentralStateKey';
import RacerManager from './RacerManager';
import Kernel from '../../../Kernel/Kernel';
import LinearVanishingPointStrategy from '../../../Kernel/utils/ZCalc/strategies/LinearVanishingPointStrategy';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import Frame from '../../../Kernel/engines/GraphicEngine/Frame';
import MusicManager from './MusicManager';
import standardModelEvents from './events/standardModelEvents';
import UnitHelper from '../../../Kernel/utils/UnitHelper';
import ZCalc from '../../../Kernel/utils/ZCalc/ZCalc';
import IModelEventManager from '../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import Obstacle from '../../models/Obstacle/Obstacle';
import IKeyboardEventManager from '../../../Kernel/entities/Level/IKeyboardEventManager';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import FrameManager from '../../../Kernel/engines/GraphicEngine/FrameManager';
import PointerEventManager from '../../../Kernel/entities/Level/PointerEventManager';
import KeyboardEventManager from '../../../Kernel/entities/Level/KeyboardEventManager';
import ModelEventManager from '../../../Kernel/entities/Level/ModelEventManager';
import ModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/ModelAnimationsManager';

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
    protected lightMaskImage: HTMLImageElement;
    protected lightMaskLuminosity: number;
    
    // Environment management
    protected roadColor: string;
    protected roadManager: LevelRoadManager;
    protected groundManager: LevelGroundManager;
    
    // Management of the other racers on the track
    protected racerManager: RacerManager;
    
    // Obstacle management
    protected obstacleManagers: ObstacleManager<ObstacleType>[];
    protected patternManager: ObstaclePatternManager<ObstacleType>;
    
    // Models we want to keep references to
    protected monsters:Monster[];
    protected player:Tarian;
    
    private _currentPlayerMoveKey:string; // The key currently being pressed to control the player
    private _pauseToggleKeyIsPressed:boolean; // Is the key used to toggle the pause currently pressed?
    
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
    
    // Music management
    protected musicFilePaths:string[]; // File paths to the music a level can load (one will be picked by the MusicManager)
    protected musicVolume:number; // The maximum volume of the music
    private _musicManager:MusicManager; // Manages the level's music
    
    // Level section management 
    private _activeSections:string[]; // The IDs of the level sections that are currently active
    private _openingSectionId = "opening"; // The ID of the level's opening section
    private _closingSectionId = "closing"; // The ID of the level's closing section
    
    // An amount of seconds (can be negative) to shift the level section's start/end times by.
    // This will not be reset during level preperation
    private _permanentSectionTimeShiftSecs:number;
    
    // Models/info for the opening and closing of the level
    protected startSign:Sign; // The sign at the start of the level
    private _startSignDisplay:SignDisplay; // The light display on the starting sign
    protected finishSign:Sign; // The finish sign
    protected finishFlagsActive:boolean; // Should the flags at the end of the level be active?
    private _signStartingZPosition:number; // Where on the z axis does the startSign start, and the finishSign end?
    protected finishFlagsManager:LevelGroundManager; // Manages the flags at the end of the level
    
    /**
     * Constructor
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     * @param keyboardEventManager Manages any keyboard events
     */
    constructor(
        frameManager:IFrameManager,
        modelEventManager:IModelEventManager,
        pointerEventManager:IPointerEventManager,
        keyboardEventManager:IKeyboardEventManager
    )
	{
		super(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);
        
        this.zCalcStrategy = new LinearVanishingPointStrategy();
        
        this.HUD = new MainHUD(pointerEventManager);
		
		this.roadManager = new LevelRoadManager();
        this.roadColor = "#A5A5A5";
        
        this.obstacleManagers = [];
		this.patternManager = new ObstaclePatternManager<ObstacleType>();
        
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
        
        this._permanentSectionTimeShiftSecs = 0;
        
        this._currentPlayerMoveKey = "";
        this._pauseToggleKeyIsPressed = false;
	}
    
    /**
     * Creates and returns the player model, and the models for the start/finish sequences
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const stdModels = super.getModels();
        
        const centralState = Kernel.getInstance().centralState;
        
        this.player = new Tarian(new ModelAnimationsManager());
        centralState.set(CentralStateKey.PlayerModelIndex, stdModels.length);
        this.obstacleManagers.forEach(om => om.setPlayerModel(this.player));
        
        this.startSign = new Sign(new ModelAnimationsManager(), "", this._signStartingZPosition, -1, true);
        this._startSignDisplay = new SignDisplay(new ModelAnimationsManager(), this.startSign);
        this.finishSign = new Sign(new ModelAnimationsManager(), "FINISH", null, this._signStartingZPosition, false);
        
        this.groundManager.setDistancedModels([this.startSign, this.finishSign]);
        
        const racers = this.racerManager.getModels();
        
        return [
            ...stdModels,
            this.player,
            new TarianExplosion(new ModelAnimationsManager(), this.player),
            this.startSign,
            this._startSignDisplay,
            this.finishSign,
            ...racers
        ];
    }
	
    /**
     * Loads the level's assets
     */
	load():void
	{
		super.load();
        
        this.groundManager = new LevelGroundManager();
        this.finishFlagsManager = new LevelGroundManager(false); 
        
        this.finishFlagsManager.load(
            "/levels/ASLevel/images/finish_flag.png",
            null,
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
        this.finishFlagsManager.setupGround();
        
        this._activeSections = [this._openingSectionId];
        this.levelMoving = false;
        this._setupLevelSpeed();
        
        this.finishFlagsActive = false;
        
        this._setupObstacleManager(this.leftEdge, this.rightEdge);
        
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
        this.groundManager.draw(this.levelSpeed);
        
        if(this.finishFlagsActive)
            this.finishFlagsManager.draw(this.levelSpeed);
        
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
     * Constructs the loading screen for the next level
     */
    protected getNextLevelLoadingScreen():LoadingScreen
    {
        return new LoadingScreen(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(Kernel.getInstance().canvasContext.canvas),
            new KeyboardEventManager()
        );
    }
    
    /**
     * Stops the level (and triggers the stop on all models)
     * This may be triggered by the level's closing sequence, or by another entity in the game
     */
	private _stopLevel():void
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
        
        this.frame.setBackgroundImage(this.backgroundImage);
        this.frame.setLightMaskImage(this.lightMaskImage, this.lightMaskLuminosity);
        
        this.frameManager.setFrames([this.frame]);
    }
    
    /**
     * Registers all model events for the level
     */
	protected registerLevelEvents():void
	{
        super.registerLevelEvents();
        this.modelEventManager.registerEventsArray(standardModelEvents);
        this._setupPlayerControls();
        this._setupKeyboardPauseToggle();
	}
    
    /**
     * Sets up the handlers that let the player control their character
     */
    private _setupPlayerControls():void
    {
        this.keyboardEventManager.addKeyDownEventCallback((e:KeyboardEvent) => {
            if(this.player.canBeControlled && this._currentPlayerMoveKey !== e.key)
            {
                switch(e.key)
                {
                    case "ArrowLeft":
                        this.player.state = "left";
                        break;
                    case "ArrowRight":
                        this.player.state = "right";
                        break;
                }
                
                this._currentPlayerMoveKey = e.key;
            }
        });
        
        this.keyboardEventManager.addKeyUpEventCallback((e:KeyboardEvent) => {
            if(this.player.canBeControlled && this._currentPlayerMoveKey === e.key)
            {
                this.player.state = "forward";
                this._currentPlayerMoveKey = "";
            }
        });
    }
    
    /**
     * Sets up the handlers that allow the player to toggle the pause
     * with the keyboard
     */
    private _setupKeyboardPauseToggle():void
    {
        const pauseToggleKey = " ";
        
        this.keyboardEventManager.addKeyDownEventCallback(
            (e:KeyboardEvent) => {
                if(!this._pauseToggleKeyIsPressed && e.key === pauseToggleKey)
                {
                    Kernel.getInstance().toggleGamePause();
                    this._pauseToggleKeyIsPressed = true;
                }
            },
            true
        );
        
        this.keyboardEventManager.addKeyUpEventCallback(
            (e:KeyboardEvent) => {
                if(e.key === pauseToggleKey)
                    this._pauseToggleKeyIsPressed = false;
            },
            true
        );
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
            
            const shiftedSecsStart = secsStart + this._permanentSectionTimeShiftSecs;
            const shiftedSecsEnd = secsEnd + this._permanentSectionTimeShiftSecs;
        
            if(currentSecs >= shiftedSecsStart && currentSecs <= shiftedSecsEnd) 
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
            
            if(currentSecs > shiftedSecsEnd && actionIsActive) {
                if(endCallback)
                    endCallback();
                
                this._activeSections = this._activeSections.filter((activeId:string) => activeId !== id);
            }
        }
    }
    
    /**
     * Runs a level section that will introduce aspects of the level (e.g. the obstacles) to the
     * player (this should be the first section of the level). If the player loses the level, this
     * section will be skipped when they retry it (so it will only be ran during the first attempt
     * of the level)
     * @param secsEnd The time (in seconds) when this section should stop being active
     * @param secsToShiftWhenSkippingIntro The (positive) number of seconds that other sections should
     * be shifted by, when skipping this section
     * @param initialiseCallback A callback to call when this section begins (may be null)
     * @param actCallback A callback to call on every frame while this section is active (may be null)
     * @param endCallback A callback to call when this section is no longer active (may be null)
     */
    protected levelIntroSection(
        secsEnd:number,
        secsToShiftWhenSkippingIntro:number,
        initialiseCallback?:()=>void,
        actCallback?:()=>void,
        endCallback?:()=>void
    )
    {
        const secsStart = 15;
        
        if(!this._permanentSectionTimeShiftSecs)
            this.levelSection(
                "levelIntro",
                secsStart,
                secsEnd,
                initialiseCallback,
                actCallback,
                endCallback
            );
        
        if(this.lost)
            this._permanentSectionTimeShiftSecs = -secsToShiftWhenSkippingIntro;
    }
    
    /**
     * Runs the closing sequence, if it is time to do so
     * @param secsStart the time (in seconds) that the end sequence should start from
     */
    protected levelEndSection(secsStart:number)
    {
        const kernel = Kernel.getInstance();
        
        const shiftedSecsStart = secsStart + this._permanentSectionTimeShiftSecs;
        const msStart = shiftedSecsStart * 1000;
        const isTimeToRunSection = kernel.totalLevelActiveMilliseconds >= msStart;
        
        const playerInLosingState = this.player.health === 0;
        if(!isTimeToRunSection || playerInLosingState)
            return;
        
        if(!this._activeSections.includes(this._closingSectionId)) {
            this._activeSections.push(this._closingSectionId);
            
            // Start the finish flags
            this.finishFlagsActive = true;
            
            // Start the loading of the next level's loading screen
            kernel.loadLevel(this.getNextLevelLoadingScreen());
        }
        
        this._levelClosing(msStart);
    }
    
    
    
    
    
	
    /**
     * Sets up the obstacle manager
     * @param leftEdge the left edge (in units) of the level
     * @param rightEdge the right edge (in units) of the level
     */
	private _setupObstacleManager(leftEdge:number, rightEdge:number):void
	{
        this.obstacleManagers.forEach(om => {
            om.reset();
            om.setAreaEdges(leftEdge, rightEdge);
        });
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
        
        if(!this.finishSign.active)
        {
            // End the finish flags, before starting the sign's entrance
            if(currentMs >= (closingStartMS + 3500))
                this.finishFlagsManager.removeGround();
            
            // Trigger the finish sign's entrance
            if(currentMs >= (closingStartMS + 4000))
                this.finishSign.active = true;
        }
        
        // If the sign is in position, stop the level
        if(this.finishSign.hasReachedTargetPosition && this.player.zSpeed === 0)
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