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

/**
 * The Vevania level
 */
export default class Vevania extends ASLevel<Skeleton>
{
    private _introSkeletons:IntroSkeleton[];
    private _sweepingSkeletons:Skeleton[];
    private _staticSkeletons:Skeleton[];
    
    private _sweepingObstacleManager:SweepingObstacleManager<Skeleton>;
    private _sweepAndAimObstacleManager:SweepAndAimObstacleManager<Skeleton>;
    private _sweepingLineCount:number; // The line count for the SweepingObstacleManager
    private _sweepAndAimLineCount:number; // The line count for the SweepAndAimObstacleManager
    
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
        
        for(let i = 0; i < sweepingCount; i++)
            this._sweepingSkeletons.push(new Skeleton("sweep", 1000, 0));
        
        for(let i = 0; i < staticCount; i++)
            this._staticSkeletons.push(new Skeleton("static", 0, 0));
        
        models.push(...this._sweepingSkeletons);
        models.push(...this._staticSkeletons);
        
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
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        // this.levelIntroSection(
        //     40,
        //     28,
        //     () => this._introSkeletons.forEach(s => s.start())
        // );
        
        // this.levelSection(
        //     "sweepingSkeletons",
        //     15,
        //     70,
        //     null,
        //     () => this._sweepingObstacleManager.sendObstaclesIfReady()
        // );
        
        // this.levelSection(
        //     "ghosts",
        //     15,
        //     65,
        //     () => this.monsters.forEach(monster => monster.start()),
        //     null,
        //     () => this.monsters.forEach(monster => monster.stop())
        // );
        
        // this.levelSection(
        //     "sweepAndAimSkeletons",
        //     15,
        //     70,
        //     null,
        //     () => this._sweepAndAimObstacleManager.sendObstaclesIfReady()
        // );
        
        // Run the closing sequence
        this.levelEndSection(223);
    }
};