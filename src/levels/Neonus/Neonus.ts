import ASLevel from '../ASLevel/ASLevel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import Kernel from '../../../Kernel/Kernel';
import RockBall from '../../models/Obstacles/RockBall/RockBall';
import SweepingObstacleManager from '../ASLevel/ObstacleManager/SweepingObstacleManager';
import NeonusLoadingScreen from '../LoadingScreens/NeonusLoadingScreen/NeonusLoadingScreen';

/**
 * The Lars level
 */
export default class Neonus extends ASLevel<RockBall>
{
    constructor()
    {
        super();
        
        this.NextLevelLoadingScreen = NeonusLoadingScreen;
        
        this.roadColor = "#899699";
        this.obstacleManager = new SweepingObstacleManager<RockBall>();
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
        
        const backgroundImagePath = "/levels/Neonus/images/background.png";
        const lightMaskImagePath = "/levels/Neonus/images/lightmask.png";
        const leftGroundImagePath = "/levels/Neonus/images/leftGround.png";
        const rightGroundImagePath = "/levels/Neonus/images/rightGround.png";
        
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
        //     30,
        //     19,
        //     () => this._introRockBalls.forEach(rb => rb.start())
        // );
        
        
        
        // Run the closing sequence
        this.levelEndSection(249);
    }
};