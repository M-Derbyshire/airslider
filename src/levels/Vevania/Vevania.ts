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

/**
 * The Vevania level
 */
export default class Vevania extends ASLevel<Skeleton>
{
    constructor()
    {
        super();
        
        this.NextLevelLoadingScreen = VevaniaLoadingScreen;
        
        this.roadColor = "#525950";
        this.obstacleManager = new SweepAndAimObstacleManager<Skeleton>();
    }
    
    /**
     * Creates and returns the models to be used in the level
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const models = super.getModels() as ASModel[];
        
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
        const leftGroundImagePath = "/levels/Forurn/images/ground.png";
        const rightGroundImagePath = "/levels/Forurn/images/ground.png";
        
        this.backgroundImage = assetHandler.loadImage(backgroundImagePath);
        this.lightMaskImage = assetHandler.loadImage(lightMaskImagePath);
        this.lightMaskLuminosity = 0;
        
        this.groundManager.load(leftGroundImagePath, rightGroundImagePath, 150, 75, 1200);
        
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
        
        // Run the closing sequence
        this.levelEndSection(223);
    }
};