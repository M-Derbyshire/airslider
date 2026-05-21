import ASLevel from '../ASLevel/ASLevel';
import ASModel from '../../models/ASModel/ASModel';
import Kernel from '../../../Kernel/Kernel';
import GangMember from '../../models/Obstacles/GangMember/GangMember';
import IntroGangMember from '../../models/Obstacles/IntroObstacles/IntroGangMember/IntroGangMember';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModelEventManager from '../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import NeonPidgeon from '../../models/Monsters/NeonPidgeon/NeonPidgeon';
import SweepAndAimObstacleManager from '../ASLevel/ObstacleManager/SweepAndAimObstacleManager';
import { IPattern } from '../ASLevel/ObstaclePatternManager';
import VevaniaLoadingScreen from '../LoadingScreens/VevaniaLoadingScreen/VevaniaLoadingScreen';
import IKeyboardEventManager from '../../../Kernel/entities/Level/IKeyboardEventManager';
import FrameManager from '../../../Kernel/engines/GraphicEngine/FrameManager';
import ModelEventManager from '../../../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../../../Kernel/entities/Level/PointerEventManager';
import KeyboardEventManager from '../../../Kernel/entities/Level/KeyboardEventManager';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import ModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/ModelAnimationsManager';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';

/**
 * The Neonus level
 */
export default class Neonus extends ASLevel<GangMember>
{
    private _introGangMembers:IntroGangMember[];
    
     // The count of "lines" that the obstacle manager will put on screen at any one time
    private _gangMembersLineCount:number;
    
    private _staticGangMembers:GangMember[];
    private _sweepingGangMembers:GangMember[];
    
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
        
        this.roadColor = "#899699";
        this.obstacleManagers = [
            new SweepAndAimObstacleManager<GangMember>()
        ];
        
        this._gangMembersLineCount = 8;
        this._staticGangMembers = [];
        this._sweepingGangMembers = [];
        this._introGangMembers = [];
    }
    
    /**
     * Creates and returns the models to be used in the level
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const models = super.getModels() as ASModel[];
        
        const higherPidgeon = new NeonPidgeon(new ModelAnimationsManager());
        const lowerPidgeon = new NeonPidgeon(new ModelAnimationsManager(), higherPidgeon);
        this.monsters = [higherPidgeon, lowerPidgeon];
        models.push(...this.monsters);
        
        const leftIntroGangMember = new IntroGangMember(new ModelAnimationsManager(), false);
        const rightIntroGangMember = new IntroGangMember(new ModelAnimationsManager(), false);
        const leadIntroGangMember = new IntroGangMember(new ModelAnimationsManager(), true, leftIntroGangMember, rightIntroGangMember);
        
        this._introGangMembers = [
            leftIntroGangMember,
            rightIntroGangMember,
            leadIntroGangMember
        ];
        
        models.push(...this._introGangMembers);
        
        const sweepingCount = this._gangMembersLineCount * 2;
        const staticCount = 50; // These are also used by the pattern manager
        const sweepingXSpeed = 1000;
        
        for(let i = 0; i < sweepingCount; i++)
            this._sweepingGangMembers.push(new GangMember(new ModelAnimationsManager(), "sweep", sweepingXSpeed));
        
        for(let i = 0; i < staticCount; i++)
            this._staticGangMembers.push(new GangMember(new ModelAnimationsManager(), "static", 0));
        
        models.push(...this._sweepingGangMembers);
        models.push(...this._staticGangMembers);
        
        return models;
    }
    
    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
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
    prepare()
    {
        super.prepare();
        
        this.obstacleManagers[0].setCurrentLineCount(this._gangMembersLineCount);
        (this.obstacleManagers[0] as SweepAndAimObstacleManager<GangMember>).setSeperatedObstacleModels(
            this._sweepingGangMembers,
            this._staticGangMembers
        );
        
        this.patternManager.setRepeatingPattern(this._generateGangPattern());
        this.patternManager.setModelsForPattern(this._staticGangMembers);
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        this.levelIntroSection(
            39,
            27,
            () => this._introGangMembers.forEach(gm => gm.start())
        );
        
        this.levelSection(
            "gangMembers1",
            43,
            98,
            undefined,
            () => this.obstacleManagers[0].sendObstaclesIfReady()
        );
        
        this.levelSection(
            "neonPidgeons",
            107,
            157,
            () => this.monsters.forEach(monster => monster.start()),
            undefined,
            () => this.monsters.forEach(monster => monster.stop())
        );
        
        this.levelSection(
            "gangDiamondsPattern",
            166,
            216,
            () => this.patternManager.start(),
            undefined,
            () => this.patternManager.stop()
        );
        
        this.patternManager.act();
        
        // Run the closing sequence
        this.levelEndSection(223);
    }
    
    /**
     * Constructs the loading screen for the next level
     */
    protected getNextLevelLoadingScreen():LoadingScreen
    {
        return new VevaniaLoadingScreen(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(Kernel.getInstance().canvasContext.canvas),
            new KeyboardEventManager()
        );
    }
    
    /**
     * Generates an obstacle pattern that sends groups of
     * obstacles towards the player, on different sides of
     * the track
     * @returns a pattern to be used by the pattern manager
     */
    private _generateGangPattern():IPattern
    {
        const pattern:IPattern = {
            zGap: 25,
            zGapBetweenSections: 75,
            lineCountPerSection: 5,
            zModifierAbs: 0,
            positions: []
        };
        
        let lastGroupWasOnLeftSide = false;
        const obstacleWidth = this._staticGangMembers[0].width;
        const sectionCount = 30;
        
        for(let i = 0; i < sectionCount; i++)
        {
            let section:number[][];
            
            if(lastGroupWasOnLeftSide)
                section = this._generateRightSideGangPositions(obstacleWidth);
            else
                section = this._generateLeftSideGangPositions(obstacleWidth);
            
            pattern.positions.push(...section);
            lastGroupWasOnLeftSide = !lastGroupWasOnLeftSide;
        }
        
        return pattern;
    }
    
    /**
     * Generates the pattern positions for gang-members on the left side of 
     * the track
     * @param modelWidth the width of the obstacle models being used
     * @returns the positions (the first array contains arrays of X-axis positions)
     */
    private _generateLeftSideGangPositions(modelWidth:number):number[][]
    {
        const levelHalfWidth = (this.rightEdge - this.leftEdge) / 2;
        const levelCenter = this.leftEdge + levelHalfWidth;
        const modelHalfWidth = modelWidth / 2;
        
        const groupRightmostPosition = levelCenter - modelHalfWidth;
        const groupCenter = ((groupRightmostPosition - this.leftEdge) / 2) + this.leftEdge;
        const spaceBetweenMiddleObstacles = (groupCenter - this.leftEdge) / 4;
        
        const positions = [
            [groupCenter],
            [
                this.leftEdge + spaceBetweenMiddleObstacles,
                groupRightmostPosition - spaceBetweenMiddleObstacles
            ],
            [this.leftEdge, groupRightmostPosition]
        ];
        
        // Add the first 2 lines again, in reverse, to complete the diamond pattern
        positions.push(positions[1], positions[0]);
        
        return positions;
    }
    
    /**
     * Generates the pattern positions for gang-members on the right side of 
     * the track
     * @param modelWidth the width of the obstacle models being used
     * @returns the positions (the first array contains arrays of X-axis positions)
     */
    private _generateRightSideGangPositions(modelWidth:number):number[][]
    {
        const levelHalfWidth = (this.rightEdge - this.leftEdge) / 2;
        const leftPositions = this._generateLeftSideGangPositions(modelWidth);
        
        const rightPositions:number[][] = leftPositions.map(xPositions => {
            return xPositions.map(position => position + levelHalfWidth);
        });
        
        return rightPositions;
    }
};