import ASLevel from '../ASLevel/ASLevel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import ForurnLoadingScreen from '../LoadingScreens/ForurnLoadingScreen/ForurnLoadingScreen';
import ASModel from '../../models/ASModel/ASModel';
import ElectricHornet from '../../models/Monsters/ElectricHornet/ElectricHornet';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import Kernel from '../../../Kernel/Kernel';

/**
 * A class for a Level
 */
export default class Forurn extends ASLevel
{
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
        
        this.groundManager.load(groundImagePath, 150, 100);
        
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
        
        this.patternManager.setStartingZPosition(this.zCalcStrategy.vanishingPointDepth);
        this.patternManager.clearPatterns();
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        this.levelSection(
            "monster", 
            15000, 
            90000, 
            () => this.monsters.forEach(monster => monster.start()),
            null,
            () => this.monsters.forEach(monster => monster.stop())
        );
    }
};