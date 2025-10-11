import ASLevel from '../ASLevel/ASLevel';
import ASModel from '../../models/ASModel/ASModel';
import Kernel from '../../../Kernel/Kernel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import SweepAndAimObstacleManager from '../ASLevel/ObstacleManager/SweepAndAimObstacleManager';
import VevaniaLoadingScreen from '../LoadingScreens/VevaniaLoadingScreen/VevaniaLoadingScreen';
import Skeleton from '../../models/Obstacles/Skeleton/Skeleton';
import IntroSkeleton from '../../models/Obstacles/IntroObstacles/IntroSkeleton/IntroSkeleton';
import Ghost from '../../models/Monsters/Ghost/Ghost';
import SweepingObstacleManager from '../ASLevel/ObstacleManager/SweepingObstacleManager';
import { IPattern } from '../ASLevel/ObstaclePatternManager';

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
    
    constructor()
    {
        super();
        
        this.NextLevelLoadingScreen = VevaniaLoadingScreen;
        
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
            new IntroSkeleton("left"),
            new IntroSkeleton("right")
        ];
        models.push(...this._introSkeletons);
        
        this.monsters = [
            new Ghost(this.player, "left"),
            new Ghost(this.player, "right")
        ];
        models.push(...this.monsters);
        
        // Setup the obstacles for the obstacle managers
        const sweepingCount = this._sweepingLineCount * 2;
        const staticCount = sweepingCount / 2;
        
        const sweepSpeed = 1000;
        for(let i = 0; i < sweepingCount; i++)
            this._sweepingSkeletons.push(new Skeleton("sweep", sweepSpeed, 0));
        
        for(let i = 0; i < staticCount; i++)
            this._staticSkeletons.push(new Skeleton("static", 0, 0));
        
        models.push(...this._sweepingSkeletons);
        models.push(...this._staticSkeletons);
        
        // Setup the homing skeletons for the homing pattern
        const homingCount = 7;
        const homingZStart = 150;
        const homingXSpeed = 400;
        for(let i = 0; i < homingCount; i++)
            this._homingSkeletons.push(new Skeleton("home", homingXSpeed, homingZStart, this.player))
        
        models.push(...this._homingSkeletons);
        
        return models;
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
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
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
    prepare():void
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
            null,
            () => this._sweepingObstacleManager.sendObstaclesIfReady()
        );
        
        this.levelSection(
            "ghosts",
            108,
            158,
            () => this.monsters.forEach(monster => monster.start()),
            null,
            () => this.monsters.forEach(monster => monster.stop())
        );
        
        this.levelSection(
            "sweepAndAimSkeletons",
            171,
            221,
            null,
            () => this._sweepAndAimObstacleManager.sendObstaclesIfReady()
        );
        
        this.levelSection(
            "homingSkeletons",
            230,
            280,
            () => this.patternManager.start(),
            null,
            () => this.patternManager.stop()
        );
        
        this.patternManager.act();
        
        // Run the closing sequence
        this.levelEndSection(288);
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