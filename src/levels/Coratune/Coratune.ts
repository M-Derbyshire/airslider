import ASLevel from '../ASLevel/ASLevel';
import ASModel from '../../models/ASModel/ASModel';
import Kernel from '../../../Kernel/Kernel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModelEventManager from '../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import CoratuneLoadingScreen from '../LoadingScreens/CoratuneLoadingScreen/CoratuneLoadingScreen';
import LevelGroundManager from '../ASLevel/LevelGroundManager';
import IntroJellyfish from '../../models/Obstacles/IntroObstacles/IntroJellyfish/IntroJellyfish';
import { IPattern } from '../ASLevel/ObstaclePatternManager';
import Jellyfish from '../../models/Obstacles/Jellyfish/Jellyfish';
import CenterLineObstacleManager from '../ASLevel/ObstacleManager/CenterLineObstacleManager';
import Lightning from '../../models/Monsters/attacks/Lightning/Lightning';
import ElectricSeahorse from '../../models/Monsters/ElectricSeahorse/ElectricSeahorse';
import IKeyboardEventManager from '../../../Kernel/entities/Level/IKeyboardEventManager';
import FrameManager from '../../../Kernel/engines/GraphicEngine/FrameManager';
import ModelEventManager from '../../../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../../../Kernel/entities/Level/PointerEventManager';
import KeyboardEventManager from '../../../Kernel/entities/Level/KeyboardEventManager';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import ModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/ModelAnimationsManager';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';
import IGraphicEngine from '../../../Kernel/engines/GraphicEngine/IGraphicEngine';

/**
 * The Coratune level
 */
export default class Coratune extends ASLevel<Jellyfish>
{
    private _buoyImage!:HTMLImageElement;
    private _buoyImageDimensions!:{ width:number, height:number };
    private _finishFlagsBuoyManager:LevelGroundManager; // Draws Buoys in front of the finish flags
    
    private _introJellyfish!:IntroJellyfish;
    private _centerHomingJellyfish:Jellyfish[]; // The homing jellyfish that are in the center of the track
    private _sidesHomingJellyfish:Jellyfish[]; // The homing jellyfish that are on the sides of the level
    
    private _homingJellyfishInitialXSpeed:number; // The initial X speed for the homing jellyfish
    
    /**
     * Constructor
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks
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
        
        this.roadColor = "#789994";
        
        this._centerHomingJellyfish = [];
        this._sidesHomingJellyfish = [];
        this._homingJellyfishInitialXSpeed = 450;
        
        this.obstacleManagers = [
            new CenterLineObstacleManager<Jellyfish>()
        ];
        
        this._finishFlagsBuoyManager = new LevelGroundManager(false);
    }
    
    /**
     * Creates and returns the models to be used in the level
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const models = super.getModels() as ASModel[];
        
        this._introJellyfish = new IntroJellyfish(new ModelAnimationsManager());
        models.push(this._introJellyfish);
        
        // Setup the obstacles for the pattern and obstacle-manager
        const centerHomingJellyfishCount = 6;
        const sidesHomingJellyfishCount = 7;
        const homingZStart = 150;
        
        for(let i = 0; i < centerHomingJellyfishCount; i++)
            this._centerHomingJellyfish.push(
                new Jellyfish(new ModelAnimationsManager(), "home", this._homingJellyfishInitialXSpeed, homingZStart, this.player)
            );
        
        for(let i = 0; i < sidesHomingJellyfishCount; i++)
            this._sidesHomingJellyfish.push(
                new Jellyfish(new ModelAnimationsManager(), "home", this._homingJellyfishInitialXSpeed, homingZStart, this.player)
            );
        
        models.push(...this._centerHomingJellyfish);
        models.push(...this._sidesHomingJellyfish);
        
        // Setup the monster
        const lighting1 = new Lightning(new ModelAnimationsManager());
        const lighting2 = new Lightning(new ModelAnimationsManager());
        
        this.monsters = [
            new ElectricSeahorse(lighting1, lighting2, new ModelAnimationsManager()),
            new ElectricSeahorse(lighting1, lighting2, new ModelAnimationsManager())
        ];
        models.push(lighting1, lighting2, ...this.monsters);
        
        return models;
    }
    
    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        const backgroundImagePath = "/levels/Coratune/images/background.png";
        const lightMaskImagePath = "/levels/Coratune/images/lightmask.png";
        const groundImagePath = "/levels/Coratune/images/ground.png";
        
        this.backgroundImage = assetHandler.loadImage(backgroundImagePath);
        this.lightMaskImage = assetHandler.loadImage(lightMaskImagePath);
        this.lightMaskLuminosity = 0;
        
        this.groundManager.load(groundImagePath, null, 150, 75, 1000, 200);
        
        const buoyImagePath = "/levels/Coratune/images/buoy.png";
        this._buoyImage = assetHandler.loadImage(buoyImagePath);
        this._buoyImageDimensions = {
            width: 125,
            height: 150
        };
        
        this._finishFlagsBuoyManager.load(
            buoyImagePath,
            null,
            this._buoyImageDimensions.height * 1.25,
            50,
            this._buoyImageDimensions.width * 1.35,
            70,
            35
        );
        
        this.assetsToUnload.push(
            backgroundImagePath,
            lightMaskImagePath,
            groundImagePath,
            buoyImagePath
        );
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare()
    {
        super.prepare();
        
        // Set the buoy image for the bases of the start/finish signs
        this.startSign.setBaseImage(
            this._buoyImage,
            this._buoyImageDimensions.width,
            this._buoyImageDimensions.height
        );
        this.finishSign.setBaseImage(
            this._buoyImage,
            this._buoyImageDimensions.width,
            this._buoyImageDimensions.height
        );
        
        this._finishFlagsBuoyManager.setupGround();
        
        const pattern = this._generateLinesOnSidesPattern(this._sidesHomingJellyfish[0].width);
        this.patternManager.setModelsForPattern(this._sidesHomingJellyfish);
        this.patternManager.setRepeatingPattern(pattern);
        
        this.obstacleManagers[0].setObstacleModels(this._centerHomingJellyfish);
        this.obstacleManagers[0].setCurrentLineCount(6);
        
        this._sidesHomingJellyfish.forEach(j => j.xSpeed = this._homingJellyfishInitialXSpeed);
        this._centerHomingJellyfish.forEach(j => j.xSpeed = this._homingJellyfishInitialXSpeed);
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        this.levelIntroSection(
            36,
            24,
            () => this._introJellyfish.start()
        );
        
        this.patternManager.act();
        
        this.levelSection(
            "homingJellyfishFromSides",
            38,
            88,
            () => this.patternManager.start(),
            undefined,
            () => this.patternManager.stop()
        );
        
        this.levelSection(
            "electricSeahorse1",
            88,
            138,
            () => this.monsters[0].start(),
            undefined,
            () => this.monsters[0].stop()
        );
        
        this.levelSection(
            "homingJellyfishFromSidesAndCenter",
            149,
            179,
            () => {
                this.patternManager.start();
                
                const newSpeed = this._homingJellyfishInitialXSpeed * 0.25;
                this._sidesHomingJellyfish.forEach(j => j.xSpeed = newSpeed);
                this._centerHomingJellyfish.forEach(j => j.xSpeed = newSpeed);
            },
            () => this.obstacleManagers[0].sendObstaclesIfReady(),
            () => this.patternManager.stop()
        );
        
        this.levelSection(
            "electricSeahorse2",
            179,
            229,
            () => this.monsters[1].start(),
            undefined,
            () => this.monsters[1].stop()
        );
        
        // Run the closing sequence
        this.levelEndSection(239);
    }

    /**
     * Draws anything that needs to be in the back (before the models) of the level
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    drawBack(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void
    {
        super.drawBack(graphicEngine, canvasContext);
        
        if(this.finishFlagsActive)
            this._finishFlagsBuoyManager.draw(this.levelSpeed);
        
        if(this.finishFlagsManager.groundIsBeingRemoved)
            this._finishFlagsBuoyManager.removeGround();
    }
    
    /**
     * Constructs the loading screen for the next level
     */
    protected getNextLevelLoadingScreen():LoadingScreen
    {
        return new CoratuneLoadingScreen(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(Kernel.getInstance().canvasContext.canvas),
            new KeyboardEventManager()
        );
    }
    
    /**
     * Generates an obstacle pattern that sends 2 lines of
     * obstacles down the track (one line on each side of
     * the track)
     * @param obstacleWidth the width of the obstacles
     * @returns a pattern to be used by the pattern manager
     */
    private _generateLinesOnSidesPattern(obstacleWidth:number):IPattern
    {
        return {
            zGap: 150,
            zModifierAbs: 0,
            positions: [
                [this.leftEdge],
                [this.rightEdge - obstacleWidth]
            ]
        };
    }
};