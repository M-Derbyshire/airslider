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

/**
 * The Vevania level
 */
export default class Vevania extends ASLevel<Skeleton>
{
    private _introSkeletons:IntroSkeleton[];
    
    constructor()
    {
        super();
        
        this.NextLevelLoadingScreen = VevaniaLoadingScreen;
        
        this.roadColor = "#525950";
        this.obstacleManagers = [
            new SweepAndAimObstacleManager<Skeleton>()
        ];
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
        
        // Run the closing sequence
        this.levelEndSection(223);
    }
};