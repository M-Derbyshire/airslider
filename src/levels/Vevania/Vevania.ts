import ASLevel from '../ASLevel/ASLevel';
import ASModel from '../../models/ASModel/ASModel';
import Kernel from '../../../Kernel/Kernel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModelEventManager from '../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import SweepAndAimObstacleManager from '../ASLevel/ObstacleManager/SweepAndAimObstacleManager';
import Skeleton from '../../models/Obstacles/Skeleton/Skeleton';
import IntroSkeleton from '../../models/Obstacles/IntroObstacles/IntroSkeleton/IntroSkeleton';
import Ghost from '../../models/Monsters/Ghost/Ghost';
import SweepingObstacleManager from '../ASLevel/ObstacleManager/SweepingObstacleManager';
import { IPattern } from '../ASLevel/ObstaclePatternManager';
import CoratuneLoadingScreen from '../LoadingScreens/CoratuneLoadingScreen/CoratuneLoadingScreen';
import IKeyboardEventManager from '../../../Kernel/entities/Level/IKeyboardEventManager';
import FrameManager from '../../../Kernel/engines/GraphicEngine/FrameManager';
import ModelEventManager from '../../../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../../../Kernel/entities/Level/PointerEventManager';
import KeyboardEventManager from '../../../Kernel/entities/Level/KeyboardEventManager';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import ModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/ModelAnimationsManager';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';

/**
 * The Vevania level
 */
export default class Vevania extends ASLevel<Skeleton>
{
    private _introSkeletons:IntroSkeleton[];
    private _sweepingSkeletons:Skeleton[];
    private _staticSkeletons:Skeleton[];
    private _homingSkeletons:Skeleton[];
    
    private _sweepingObstacleManager:SweepingObstacleManager<Skeleton>;
    private _sweepAndAimObstacleManager:SweepAndAimObstacleManager<Skeleton>;
    private _sweepingLineCount:number; // The line count for the SweepingObstacleManager
    private _sweepAndAimLineCount:number; // The line count for the SweepAndAimObstacleManager
    
    private _homingPatternZGap:number; // The gap (on the Z-axis) between the homing skeletons
    
    /**
     * Constructor
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks
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
        
        this.roadColor = "#525950";
        
        this._sweepingObstacleManager = new SweepingObstacleManager<Skeleton>();
        this._sweepAndAimObstacleManager = new SweepAndAimObstacleManager<Skeleton>();
        
        this.obstacleManagers = [
            this._sweepingObstacleManager,
            this._sweepAndAimObstacleManager
        ];
        
        this._sweepingLineCount = 6;
        this._sweepAndAimLineCount = 8;
        this._sweepingSkeletons = [];
        this._staticSkeletons = [];
        this._introSkeletons = [];
        
        this._homingPatternZGap = 150;
        this._homingSkeletons = [];
    }
    
    /**
     * Creates and returns the models to be used in the level
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const models = super.getModels() as ASModel[];
        
        this._introSkeletons = [
            new IntroSkeleton("left", new ModelAnimationsManager()),
            new IntroSkeleton("right", new ModelAnimationsManager())
        ];
        models.push(...this._introSkeletons);
        
        this.monsters = [
            new Ghost(this.player, "left", new ModelAnimationsManager()),
            new Ghost(this.player, "right", new ModelAnimationsManager())
        ];
        models.push(...this.monsters);
        
        // Setup the obstacles for the obstacle managers
        const sweepingCount = this._sweepingLineCount * 2;
        const staticCount = sweepingCount / 2;
        
        const sweepSpeed = 1000;
        for(let i = 0; i < sweepingCount; i++)
            this._sweepingSkeletons.push(new Skeleton(new ModelAnimationsManager(), "sweep", sweepSpeed, 0));
        
        for(let i = 0; i < staticCount; i++)
            this._staticSkeletons.push(new Skeleton(new ModelAnimationsManager(), "static", 0, 0));
        
        models.push(...this._sweepingSkeletons);
        models.push(...this._staticSkeletons);
        
        // Setup the homing skeletons for the homing pattern
        const homingCount = 7;
        const homingZStart = 150;
        const homingXSpeed = 400;
        for(let i = 0; i < homingCount; i++)
            this._homingSkeletons.push(new Skeleton(new ModelAnimationsManager(), "home", homingXSpeed, homingZStart, this.player));
        
        models.push(...this._homingSkeletons);
        
        return models;
    }
    
    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        const backgroundImagePath = "/levels/Vevania/images/background.png";
        const lightMaskImagePath = "/levels/Vevania/images/lightmask.png";
        const leftGroundImagePath = "/levels/Vevania/images/leftGround.png";
        const rightGroundImagePath = "/levels/Vevania/images/rightGround.png";
        
        this.backgroundImage = assetHandler.loadImage(backgroundImagePath);
        this.lightMaskImage = assetHandler.loadImage(lightMaskImagePath);
        this.lightMaskLuminosity = 0;
        
        this.groundManager.load(leftGroundImagePath, rightGroundImagePath, 1000, 75, 1200);
        
        this.assetsToUnload.push(
            backgroundImagePath,
            lightMaskImagePath,
            leftGroundImagePath,
            rightGroundImagePath
        );
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare()
    {
        super.prepare();
        
        this._sweepingObstacleManager.setObstacleModels(this._sweepingSkeletons);
        this._sweepingObstacleManager.setCurrentLineCount(this._sweepingLineCount);
        this._sweepAndAimObstacleManager.setSeperatedObstacleModels(this._sweepingSkeletons, this._staticSkeletons);
        this._sweepAndAimObstacleManager.setCurrentLineCount(this._sweepAndAimLineCount);
        
        const pattern = this._generateCenterLinePattern(this._homingSkeletons[0].width);
        this.patternManager.setModelsForPattern(this._homingSkeletons);
        this.patternManager.setRepeatingPattern(pattern);
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        this.levelIntroSection(
            40,
            28,
            () => this._introSkeletons.forEach(s => s.start())
        );
        
        this.levelSection(
            "sweepingSkeletons",
            44,
            100,
            undefined,
            () => this._sweepingObstacleManager.sendObstaclesIfReady()
        );
        
        this.levelSection(
            "ghosts",
            108,
            158,
            () => this.monsters.forEach(monster => monster.start()),
            undefined,
            () => this.monsters.forEach(monster => monster.stop())
        );
        
        this.levelSection(
            "sweepAndAimSkeletons",
            171,
            221,
            undefined,
            () => this._sweepAndAimObstacleManager.sendObstaclesIfReady()
        );
        
        this.levelSection(
            "homingSkeletons",
            230,
            280,
            () => this.patternManager.start(),
            undefined,
            () => this.patternManager.stop()
        );
        
        this.patternManager.act();
        
        // Run the closing sequence
        this.levelEndSection(288);
    }
    
    /**
     * Constructs the loading screen for the next level
     */
    protected getNextLevelLoadingScreen():LoadingScreen
    {
        return new CoratuneLoadingScreen(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(Kernel.getInstance().canvasContext.canvas),
            new KeyboardEventManager()
        );
    }
    
    /**
     * Generates an obstacle pattern that sends a line of
     * obstacles down the center of the track
     * @param obstacleWidth the width of the obstacles
     * @returns a pattern to be used by the pattern manager
     */
    private _generateCenterLinePattern(obstacleWidth:number):IPattern
    {
        const levelHalfWidth = (this.rightEdge - this.leftEdge) / 2;
        const levelCenter = this.leftEdge + levelHalfWidth;
        
        const modelHalfWidth = obstacleWidth / 2;
        const centeredModelPosition = levelCenter - modelHalfWidth;
        
        return {
            zGap: this._homingPatternZGap,
            zModifierAbs: 0,
            positions: [
                [centeredModelPosition]
            ]
        };
    }
};