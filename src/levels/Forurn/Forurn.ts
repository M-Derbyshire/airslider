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
import { IPattern } from '../ASLevel/ObstaclePatternManager';

/**
 * A class for a Level
 */
export default class Forurn extends ASLevel<Snake>
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
        
        const snakes:Obstacle[] = [];
        for(let i = 0; i < totalSnakeCount; i++)
            snakes.push(new Snake());
        
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
        
        this.patternManager.setRepeatingPattern(this._generateSnakePattern());
        
        const initialSnakeLineCount = 3;
        this.obstacleManager.setObstacleModels(this._snakes);
        this.obstacleManager.setCurrentLineCount(initialSnakeLineCount);
        this.patternManager.setModelsForPattern(this._snakes);
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        this.levelSection(
            "introSnake",
            15,
            37,
            () => this._introSnake.start()
        );
        
        this.levelSection(
            "randomSnakes",
            43,
            93,
            null,
            () => this.obstacleManager.sendObstaclesIfReady()
        );
        
        this.levelSection(
            "increaseSnakeCount",
            54.5,
            54.6,
            () => this.obstacleManager.setCurrentLineCount(
                this.obstacleManager.currentLineCount + 1
            )
        );
        
        this.levelSection(
            "monster",
            97,
            152,
            () => this.monsters.forEach(monster => monster.start()),
            null,
            () => this.monsters.forEach(monster => monster.stop())
        );
        
        this.levelSection(
            "snakeGroups",
            155,
            217,
            null,
            () => this.patternManager.sendPattern()
        );
        
        // Run the closing sequence
        this.levelEndSection(220);
    }
    
    /**
     * Generate the pattern of Snakes that should be created by the patternManager
     * @returns a pattern object that can be used by the patternManager to create the 
     * desired pattern of Snakes
     */
    private _generateSnakePattern():IPattern {
        const pattern:IPattern = {
            zGap: 200,
            zModifierAbs: 10,
            positions: []
        };
        
        if(!this._snakes.length)
            return pattern;
        
        /*
            There are 2 kinds of "lines" in the pattern: 
            - lines where the snakes are on both sides of the level (with a gap in the center)
            - a line in the center (may just be one snake)
        */
        const possibleLinePositions = this._getPossiblePatternLines(this._snakes[0].width);
        
        pattern.positions.push(possibleLinePositions.sides);
        pattern.positions.push(possibleLinePositions.center);
        
        return pattern;
    }
    
    /**
     * Generates the horizontal "lines" that we can use when creating a pattern of 
     * snakes. There are 2 possible lines: "center" and "sides". Each line is an 
     * array of positions on the X-axis.
     * @param modelWidth the width of the model that is being used in our patterns
     * @returns an object with "lines" that can be used when making a pattern. Each 
     * line is an array of X-axis positions.
     */
    private _getPossiblePatternLines(modelWidth:number):{ sides:number[], center:number[] }
    {
        const modelHalfWidth = modelWidth / 2;
        const gapBetweenModels = 10;
        
        const levelWidth = this.rightEdge - this.leftEdge;
        const levelCenter = (levelWidth / 2) + this.leftEdge;
        const leftEdgeToUse = this.leftEdge - modelHalfWidth;
        const rightEdgeToUse = this.rightEdge + modelHalfWidth;
        
        const centerPositions = [levelCenter - modelHalfWidth];
        
        const modelCountPerSide = 2;
        const widthWithGap = modelWidth + gapBetweenModels;
        const leftPositions:number[] = [];
        const rightPositions:number[] = [];
        
        for(let i = 0; i < modelCountPerSide; i++)
            leftPositions.push(leftEdgeToUse + (widthWithGap * i));
        
        for(let i = 1; i <= modelCountPerSide; i++)
            rightPositions.push(rightEdgeToUse - (widthWithGap * i));
        
        return {
            sides: [...leftPositions, ...rightPositions],
            center: centerPositions
        }
    }
};