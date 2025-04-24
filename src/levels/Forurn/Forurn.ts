import ASLevel from '../ASLevel/ASLevel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import ForurnLoadingScreen from '../LoadingScreens/ForurnLoadingScreen/ForurnLoadingScreen';
import ASModel from '../../models/ASModel/ASModel';
import ElectricHornet from '../../models/Monsters/ElectricHornet/ElectricHornet';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import Kernel from '../../../Kernel/Kernel';
import Snake from '../../models/Obstacles/Snake/Snake';
import Obstacle from '../../models/Obstacle/Obstacle';
import IntroSnake from '../../models/Obstacles/IntroObstacles/IntroSnake/IntroSnake';
import { IPartialPattern } from '../ASLevel/ObstacleXPositionPatternManager';

/**
 * A class for a Level
 */
export default class Forurn extends ASLevel
{
    private _introSnake:IntroSnake; // Used to introduce the "snake" obstacle to the player
    private _snakes:Snake[]; // The Snake obstacles that the level will use
    
    constructor()
	{
		super();
        
        this.NextLevelLoadingScreen = ForurnLoadingScreen;
        
        // We only want the first track as the music for this level
        this.musicFilePaths = this.musicFilePaths.filter(path => path.endsWith("airslider_track_1.mp3"));
        
        this.roadColor = "#8EA08E";
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
        const monster = new ElectricHornet(this.player);
        this.monsters = [monster];
        models.push(monster);
        
        // Setup the Snake obstacles
        const totalSnakeCount = 100;
        const initialActiveSnakeCount = 5;
        
        const snakes:Obstacle[] = [];
        for(let i = 0; i < totalSnakeCount; i++)
            snakes.push(new Snake());
        
        this.obstacleManager.setObstacleModels(snakes);
        this.obstacleManager.setCurrentObstacleCount(initialActiveSnakeCount);
        this.patternManager.setPatternDefaults(snakes);
        
        models.push(...snakes);
        this._snakes = snakes;
        
        this._introSnake = new IntroSnake();
        models.push(this._introSnake);
        
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
        
        const backgroundImagePath = "/levels/Forurn/images/background.png";
        const outsideLightMaskImagePath = "/levels/Forurn/images/outside-lightmask.png";
        const groundImagePath = "/levels/Forurn/images/ground.png";
        
        this.backgroundImage = assetHandler.loadImage(backgroundImagePath);
        this.outsideLightMaskImage = assetHandler.loadImage(outsideLightMaskImagePath);
        this.outsideLightMaskLuminosity = 0.2;
        
        this.groundManager.load(groundImagePath, 150, 75);
        
        this.assetsToUnload.push(
            backgroundImagePath,
            outsideLightMaskImagePath,
            groundImagePath
        );
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
        this.outsideVisible = true;
        
        const patternZGap = 200;
        const patternMinXGap = 10;
        this.patternManager.clearPatterns();
        this.patternManager.addRepeatingPattern(
            patternZGap,
            patternMinXGap,
            this._generateSnakePatterns()
        );
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        this.levelSection(
            "introSnake",
            15000,
            34000,
            () => this._introSnake.start()
        );
        
        this.levelSection(
            "randomSnakes",
            37000,
            90000,
            null,
            () => this.obstacleManager.sendObstacleIfReady()
        );
        
        this.levelSection(
            "monster", 
            92000, 
            152000,
            () => this.monsters.forEach(monster => monster.start()),
            null,
            () => this.monsters.forEach(monster => monster.stop())
        );
        
        this.levelSection(
            "snakeGroups",
            152000,
            212000,
            null,
            () => this.patternManager.sendPatterns(),
            () => this.patternManager.clearPatterns()
        );
        
        // Run the closing sequence
        this.levelEndSection(215000);
    }
    
    /**
     * Generate the patterns of Snakes that should be sent with the patternManager
     */
    private _generateSnakePatterns():IPartialPattern[] {
        // We want to create a series of lines of snakes.
        // Each line will have an X position that its snakes are centered on
        
        const lineHalfWith = this._snakes[0].width * 1.5;
        
        const lineXPositionsCount = 8;
        const lineXPositions = [];
        const randPositionMax = this.rightEdge - this.leftEdge;
        const minPositionDifference = randPositionMax / 2;
        
        while(lineXPositions.length < lineXPositionsCount) {
            // To ensure the player can't just stay in one place, we want to ensure we 
            // have a line to the left, and a line to the right (the rest are set randomnly)
            if(lineXPositions.length === 0) {
                lineXPositions.push(this.leftEdge + lineHalfWith);
                continue;
            }
            else if(lineXPositions.length === lineXPositionsCount / 2) {
                lineXPositions.push(this.rightEdge - lineHalfWith);
                continue;
            }
            
            const xPos = Math.round(Math.random() * randPositionMax) + this.leftEdge;
            
            const lastXPos = lineXPositions[lineXPositions.length - 1] ?? -1000;
            const differenceToLastPosition = Math.abs(xPos - lastXPos);
            
            if(differenceToLastPosition >= minPositionDifference)
                lineXPositions.push(xPos);
        }
        
        return lineXPositions.map(x => ({ fromPosition: x - lineHalfWith, toPosition: x + lineHalfWith }));
    }
};