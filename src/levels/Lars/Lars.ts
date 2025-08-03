import ASLevel from '../ASLevel/ASLevel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import Kernel from '../../../Kernel/Kernel';
import LarsLoadingScreen from '../LoadingScreens/LarsLoadingScreen/LarsLoadingScreen';
import BabyDragon from '../../models/Monsters/BabyDragon/BabyDragon';
import LavaBall from '../../models/Monsters/attacks/LavaBall/LavaBall';
import RockBall from '../../models/Obstacles/RockBall/RockBall';
import IntroRockBall from '../../models/Obstacles/IntroObstacles/IntroRockBall/IntroRockBall';
import SweepingObstacleManager from '../ASLevel/ObstacleManager/SweepingObstacleManager';

/**
 * The Lars level
 */
export default class Lars extends ASLevel<RockBall>
{
    private _introRockBalls:IntroRockBall[]; // Used to introduce the "Rock Ball" obstacle to the player
    private _sweepingRockBalls:RockBall[]; // The sweeping Rock Ball obstacles that the level will use (not for patterns)
    
    constructor()
	{
		super();
        
        this.NextLevelLoadingScreen = LarsLoadingScreen;
        
        this.roadColor = "#9E8C8C";
        this.obstacleManager = new SweepingObstacleManager<RockBall>();
	}
    
    /**
     * Creates and returns the models to be used in the level
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const models = super.getModels() as ASModel[];
        
        this.obstacleManager.setPlayerModel(this.player);
        
        // Setup the monster
        const lavaBall1 = new LavaBall(this.player);
        const lavaBall2 = new LavaBall(this.player);
        const monster = new BabyDragon(this.player, lavaBall1, lavaBall2);
        this.monsters = [monster];
        models.push(monster);
        models.push(lavaBall1, lavaBall2);
        
        // Setup the Rock Ball obstacles
        const totalSweepingBallCount = 10;
        
        const sweepingBalls:RockBall[] = [];
        const sweepingXSpeed = 1000;
        
        for(let i = 0; i < totalSweepingBallCount; i++)
            sweepingBalls.push(new RockBall("sweep", sweepingXSpeed));
        
        models.push(...sweepingBalls);
        this._sweepingRockBalls = sweepingBalls;
        
        this._introRockBalls = [new IntroRockBall("left"), new IntroRockBall("right")];
        models.push(...this._introRockBalls);
        
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
        
        const backgroundImagePath = "/levels/Lars/images/background.png";
        const lightMaskImagePath = "/levels/Lars/images/lightmask.png";
        const groundImagePath = "/levels/Lars/images/ground.png";
        
        this.backgroundImage = assetHandler.loadImage(backgroundImagePath);
        this.lightMaskImage = assetHandler.loadImage(lightMaskImagePath);
        this.lightMaskLuminosity = 0.4;
        
        this.groundManager.load(groundImagePath, 500, 75);
        
        this.assetsToUnload.push(
            backgroundImagePath,
            lightMaskImagePath,
            groundImagePath
        );
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
        const initialRockBallLineCount = 6;
        this.obstacleManager.setObstacleModels(this._sweepingRockBalls);
        this.obstacleManager.setCurrentLineCount(initialRockBallLineCount);
        
        this.patternManager.setModelsForPattern(this._sweepingRockBalls);
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        this.levelSection(
            "introRockBalls",
            15,
            30,
            () => this._introRockBalls.forEach(rb => rb.start())
        );
        
        this.levelSection(
            "sweepingRockBalls1",
            34,
            88,
            null,
            () => this.obstacleManager.sendObstaclesIfReady()
        );
        
        // Run the closing sequence
        this.levelEndSection(231);
    }
};