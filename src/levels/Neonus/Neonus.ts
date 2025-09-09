import ASLevel from '../ASLevel/ASLevel';
import ASModel from '../../models/ASModel/ASModel';
import Kernel from '../../../Kernel/Kernel';
import NeonusLoadingScreen from '../LoadingScreens/NeonusLoadingScreen/NeonusLoadingScreen';
import GangMember from '../../models/Obstacles/GangMember/GangMember';
import IntroGangMember from '../../models/Obstacles/IntroObstacles/IntroGangMember/IntroGangMember';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import NeonPidgeon from '../../models/Monsters/NeonPidgeon/NeonPidgeon';
import SweepAndAimObstacleManager from '../ASLevel/ObstacleManager/SweepAndAimObstacleManager';

/**
 * The Lars level
 */
export default class Neonus extends ASLevel<GangMember>
{
    private _introGangMembers:IntroGangMember[];
    
     // The count of "lines" that the obstacle manager will put on screen at any one time
    private _gangMembersLineCount:number;
    
    private _staticGangMembers:GangMember[];
    private _sweepingGangMembers:GangMember[];
    
    constructor()
    {
        super();
        
        this.NextLevelLoadingScreen = NeonusLoadingScreen;
        
        this.roadColor = "#899699";
        this.obstacleManager = new SweepAndAimObstacleManager<GangMember>();
        
        this._gangMembersLineCount = 8;
        this._staticGangMembers = [];
        this._sweepingGangMembers = [];
    }
    
    /**
     * Creates and returns the models to be used in the level
     * @returns the newly created models
     */
    getModels():IModel[]
    {
        const models = super.getModels() as ASModel[];
        
        const higherPidgeon = new NeonPidgeon();
        const lowerPidgeon = new NeonPidgeon(higherPidgeon);
        this.monsters = [higherPidgeon, lowerPidgeon];
        models.push(...this.monsters);
        
        const leftIntroGangMember = new IntroGangMember(false);
        const rightIntroGangMember = new IntroGangMember(false);
        const leadIntroGangMember = new IntroGangMember(true, leftIntroGangMember, rightIntroGangMember);
        
        this._introGangMembers = [
            leftIntroGangMember,
            rightIntroGangMember,
            leadIntroGangMember
        ];
        
        models.push(...this._introGangMembers);
        
        const sweepingCount = this._gangMembersLineCount * 2;
        const staticCount = Math.ceil(sweepingCount / 2);
        const sweepingXSpeed = 1000;
        
        for(let i = 0; i < sweepingCount; i++)
            this._sweepingGangMembers.push(new GangMember("sweep", sweepingXSpeed));
        
        for(let i = 0; i < staticCount; i++)
            this._staticGangMembers.push(new GangMember("static", 0));
        
        models.push(...this._sweepingGangMembers);
        models.push(...this._staticGangMembers);
        
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
        
        this.obstacleManager.setCurrentLineCount(this._gangMembersLineCount);
        (this.obstacleManager as SweepAndAimObstacleManager<GangMember>).setSeperatedObstacleModels(
            this._sweepingGangMembers,
            this._staticGangMembers
        );
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        // this.levelIntroSection(
        //     39,
        //     29,
        //     () => this._introGangMembers.forEach(gm => gm.start())
        // );
        
        // this.levelSection(
        //     "neonPidgeons",
        //     15,
        //     76,
        //     () => this.monsters.forEach(monster => monster.start()),
        //     null,
        //     () => this.monsters.forEach(monster => monster.stop())
        // );
        
        // this.levelSection(
        //     "gangMembers1",
        //     15,
        //     76,
        //     null,
        //     () => this.obstacleManager.sendObstaclesIfReady()
        // );
        
        // Run the closing sequence
        this.levelEndSection(249);
    }
};