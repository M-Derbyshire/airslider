import ASLevel from '../ASLevel/ASLevel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import ElectricHornet from '../../models/Monsters/ElectricHornet/ElectricHornet';
import IModelEventManager from '../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import Kernel from '../../../Kernel/Kernel';
import Snake from '../../models/Obstacles/Snake/Snake';
import IntroSnake from '../../models/Obstacles/IntroObstacles/IntroSnake/IntroSnake';
import { IPattern } from '../ASLevel/ObstaclePatternManager';
import SideGroupsObstacleManager from '../ASLevel/ObstacleManager/SideGroupsObstacleManager';
import LarsLoadingScreen from '../LoadingScreens/LarsLoadingScreen/LarsLoadingScreen';
import IKeyboardEventManager from '../../../Kernel/entities/Level/IKeyboardEventManager';
import FrameManager from '../../../Kernel/engines/GraphicEngine/FrameManager';
import ModelEventManager from '../../../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../../../Kernel/entities/Level/PointerEventManager';
import KeyboardEventManager from '../../../Kernel/entities/Level/KeyboardEventManager';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import ModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/ModelAnimationsManager';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';

/**
 * The Forurn level
 */
export default class Forurn extends ASLevel<Snake>
{
    private _introSnake:IntroSnake; // Used to introduce the "snake" obstacle to the player
    private _snakes:Snake[]; // The Snake obstacles that the level will use
    
    /**
     * Constructor
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
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
        
        // We only want the first track as the music for this level
        this.musicFilePaths = this.musicFilePaths.filter(path => path.endsWith("airslider_track_1.mp3"));
        
        this.roadColor = "#8EA08E";
        this.obstacleManagers = [
            new SideGroupsObstacleManager<Snake>()
        ];
	}
    
    /**
     * Creates and returns the models to be used in the level
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const models = super.getModels() as ASModel[];
        
        // Setup the monster
        const monster = new ElectricHornet(new ModelAnimationsManager());
        this.monsters = [monster];
        models.push(monster);
        
        // Setup the Snake obstacles
        const totalSnakeCount = 100;
        
        const snakes:Snake[] = [];
        for(let i = 0; i < totalSnakeCount; i++)
            snakes.push(new Snake(new ModelAnimationsManager()));
        
        models.push(...snakes);
        this._snakes = snakes;
        
        this._introSnake = new IntroSnake(new ModelAnimationsManager());
        models.push(this._introSnake);
        
        return models;
    }
    
    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
	{
		super.load(assetHandler);
        
        const backgroundImagePath = "/levels/Forurn/images/background.png";
        const lightMaskImagePath = "/levels/Forurn/images/lightmask.png";
        const groundImagePath = "/levels/Forurn/images/ground.png";
        
        this.backgroundImage = assetHandler.loadImage(backgroundImagePath);
        this.lightMaskImage = assetHandler.loadImage(lightMaskImagePath);
        this.lightMaskLuminosity = 0.2;
        
        this.groundManager.load(groundImagePath, null, 150, 75);
        
        this.assetsToUnload.push(
            backgroundImagePath,
            lightMaskImagePath,
            groundImagePath
        );
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare()
    {
        super.prepare();
        
        const initialSnakeLineCount = 4;
        this.obstacleManagers[0].setObstacleModels(this._snakes);
        this.obstacleManagers[0].setCurrentLineCount(initialSnakeLineCount);
        
        this.patternManager.setRepeatingPattern(this._generateSnakePattern());
        this.patternManager.setModelsForPattern(this._snakes);
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        this.levelIntroSection(
            33,
            22,
            () => this._introSnake.start()
        );
        
        this.levelSection(
            "randomSnakes",
            37,
            91,
            null,
            () => this.obstacleManagers[0].sendObstaclesIfReady()
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
            161,
            224,
            () => this.patternManager.start(),
            null,
            () => this.patternManager.stop()
        );
        
        this.patternManager.act();
        
        // Run the closing sequence
        this.levelEndSection(231);
    }
    
    /**
     * Constructs the loading screen for the next level
     */
    protected getNextLevelLoadingScreen():LoadingScreen
    {
        return new LarsLoadingScreen(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(Kernel.getInstance().canvasContext.canvas),
            new KeyboardEventManager()
        );
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
            - a line in the center
            These lines can have either 1 or 2 snakes, so we're going to generate a few lines,
            to get a good mixture
        */
       
        const totalLineCount = 20;
        for(let i = 0; i < (totalLineCount / 2); i++)
        {
            const possibleLinePositions = this._getPossiblePatternLines(this._snakes[0].width);
        
            pattern.positions.push(possibleLinePositions.sides);
            pattern.positions.push(possibleLinePositions.center);
        }
        
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
        const lineHasMultipleObstacles = Math.round(Math.random()) === 0;
        
        const modelHalfWidth = modelWidth / 2;
        const gapBetweenModels = 10;
        
        const levelWidth = this.rightEdge - this.leftEdge;
        const levelCenter = (levelWidth / 2) + this.leftEdge;
        const leftEdgeToUse = this.leftEdge - modelHalfWidth;
        const rightEdgeToUse = this.rightEdge + modelHalfWidth;
        
        const centerPositions:number[] = [];
        if(lineHasMultipleObstacles) {
            const halfGapWidth = gapBetweenModels / 2;
            const leftOfCenter = levelCenter - modelWidth - halfGapWidth
            const rightOfCenter = levelCenter + halfGapWidth
            
            centerPositions.push(leftOfCenter, rightOfCenter);
        } else {
            centerPositions.push(levelCenter - modelHalfWidth);
        }
        
        const leftPositions:number[] = [];
        const rightPositions:number[] = [];
        const modelCountPerSide = lineHasMultipleObstacles ? 2 : 1;
        const widthWithGap = modelWidth + gapBetweenModels;
        
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