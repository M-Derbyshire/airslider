import ASLevel from '../ASLevel/ASLevel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import Kernel from '../../../Kernel/Kernel';
import BabyDragon from '../../models/Monsters/BabyDragon/BabyDragon';
import LavaBall from '../../models/Monsters/attacks/LavaBall/LavaBall';
import RockBall from '../../models/Obstacles/RockBall/RockBall';
import IntroRockBall from '../../models/Obstacles/IntroObstacles/IntroRockBall/IntroRockBall';
import SweepingObstacleManager from '../ASLevel/ObstacleManager/SweepingObstacleManager';
import { IPattern } from '../ASLevel/ObstaclePatternManager';
import NeonusLoadingScreen from '../LoadingScreens/NeonusLoadingScreen/NeonusLoadingScreen';

/**
 * The Lars level
 */
export default class Lars extends ASLevel<RockBall>
{
    private _introRockBalls:IntroRockBall[]; // Used to introduce the "Rock Ball" obstacle to the player
    private _sweepingRockBalls:RockBall[]; // The sweeping Rock Ball obstacles that the level will use (not for patterns)
    private _staticRockBalls:RockBall[]; // The Rock Ball obstacles to use when creating patterns
    
    constructor()
	{
		super();
        
        this.NextLevelLoadingScreen = NeonusLoadingScreen;
        
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
        
        // Setup the monster
        const lavaBall1 = new LavaBall(this.player);
        const lavaBall2 = new LavaBall(this.player);
        const monster = new BabyDragon(lavaBall1, lavaBall2);
        this.monsters = [monster];
        models.push(monster);
        models.push(lavaBall1, lavaBall2);
        
        // Setup the Rock Ball obstacles
        const totalStaticBallCount = 28;
        const totalSweepingBallCount = 10;
        const staticBalls:RockBall[] = [];
        const sweepingBalls:RockBall[] = [];
        const sweepingXSpeed = 1000;
        
        for(let i = 0; i < totalStaticBallCount; i++)
            staticBalls.push(new RockBall("static", 0));
        
        for(let i = 0; i < totalSweepingBallCount; i++)
            sweepingBalls.push(new RockBall("sweep", sweepingXSpeed));
        
        models.push(...staticBalls);
        this._staticRockBalls = staticBalls;
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
        
        this.groundManager.load(groundImagePath, null, 500, 75);
        
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
        
        this.patternManager.setRepeatingPattern(this._generateZigZagPattern());
        this.patternManager.setModelsForPattern(this._staticRockBalls);
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        this.levelIntroSection(
            30,
            19,
            () => this._introRockBalls.forEach(rb => rb.start())
        );
        
        this.levelSection(
            "sweepingRockBalls1",
            34,
            88,
            null,
            () => this.obstacleManager.sendObstaclesIfReady()
        );
        
        this.levelSection(
            "rockBallsZigZagPattern",
            95,
            122,
            () => this.patternManager.start(),
            null,
            () => this.patternManager.stop()
        );
        
        this.patternManager.act();
        
        this.levelSection(
            "babyDragon",
            127,
            177,
            () => this.monsters.forEach(monster => monster.start()),
            null,
            () => this.monsters.forEach(monster => monster.stop())
        );
        
        this.levelSection(
            "sweepingRockBalls2",
            187,
            242,
            () => this.obstacleManager.setCurrentLineCount(7),
            () => this.obstacleManager.sendObstaclesIfReady()
        );
        
        // Run the closing sequence
        this.levelEndSection(249);
    }
    
    /**
     * Generates an obstacle pattern that forces the player
     * to zig-zag
     * @returns a pattern to be used by the pattern manager
     */
    private _generateZigZagPattern():IPattern
    {
        const pattern:IPattern = {
            zGap: 37,
            zModifierAbs: 3,
            positions: []
        };
        
        if(!this._staticRockBalls.length)
            return pattern;
        
        const levelWidth = this.rightEdge - this.leftEdge;
        const obstacleWidth = this._staticRockBalls[0].width;
        const gapBetweenObstacles = 10;
        const playerSafeSpaceWidth = (obstacleWidth + gapBetweenObstacles) * 4;
        const obstacleCountPerWall = (levelWidth - playerSafeSpaceWidth) / obstacleWidth;
        
        // We're going to generate "walls" of obstacles.
        // These "walls" will be on an angle -- So, from 
        // the bottom-left to the top-right, and from 
        // the bottom-right to the top-left.
        // They will have an empty space at their top end, 
        // where the player will be safe from the obstacles
                
        const leftToRightWall = this._generateLeftToRightWallLines(
            obstacleCountPerWall,
            obstacleWidth, 
            gapBetweenObstacles
        );
        
        const rightToLeftWall = leftToRightWall.map(line => (
            [this.rightEdge - obstacleWidth - line[0]]
        ));
        
        pattern.positions.push(...leftToRightWall, ...rightToLeftWall);
        pattern.lineCountPerSection = leftToRightWall.length;
        
        return pattern;
    }
    
    /**
     * Creates a "wall" for use in an obstacle pattern. The wall has an
     * angle (from the bottom left to the top right)
     * @param obstacleCount how many obstacles should there be in the wall?
     * @param obstacleWidth the width of the obstacles
     * @param xGapBetweenObstacles the horizontal space between obstacles
     * @returns the "lines" of an obstacle pattern, to be used when creating a
     * "wall" for a pattern.
     */
    private _generateLeftToRightWallLines(
        obstacleCount:number,
        obstacleWidth:number,
        xGapBetweenObstacles:number
    ):number[][]
    {
        const wall:number[][] = [
            [this.leftEdge]
        ];
        
        while(wall.length < obstacleCount)
        {   
            const lastLine = wall[wall.length - 1];
            
            wall.push(
                [lastLine[0] + obstacleWidth + xGapBetweenObstacles]
            );
        }
        
        return wall;
    }
};