import ASLevel from '../ASLevel/ASLevel';
import ASModel from '../../models/ASModel/ASModel';
import Kernel from '../../../Kernel/Kernel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import IModel from '../../../Kernel/entities/Model/IModel';
import Skeleton from '../../models/Obstacles/Skeleton/Skeleton';
import CoratuneLoadingScreen from '../LoadingScreens/CoratuneLoadingScreen/CoratuneLoadingScreen';
import LevelGroundManager from '../ASLevel/LevelGroundManager';

/**
 * The Coratune level
 */
export default class Coratune extends ASLevel<Skeleton>
{
    private _buoyImage:HTMLImageElement;
    private _buoyImageDimensions:{ width:number, height:number };
    private _finishFlagsBuoyManager:LevelGroundManager; // Draws Buoys in front of the finish flags
    
    constructor()
    {
        super();
        
        this.NextLevelLoadingScreen = CoratuneLoadingScreen;
        
        this.roadColor = "#789994";
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
        
        const backgroundImagePath = "/levels/Coratune/images/background.png";
        const lightMaskImagePath = "/levels/Coratune/images/lightmask.png";
        const groundImagePath = "/levels/Forurn/images/ground.png";
        
        this.backgroundImage = assetHandler.loadImage(backgroundImagePath);
        this.lightMaskImage = assetHandler.loadImage(lightMaskImagePath);
        this.lightMaskLuminosity = 0;
        
        this.groundManager.load(groundImagePath, null, 150, 75);
        
        const buoyImagePath = "/levels/Coratune/images/buoy.png";
        this._buoyImage = assetHandler.loadImage(buoyImagePath);
        this._buoyImageDimensions = {
            width: 125,
            height: 150
        };
        
        this._finishFlagsBuoyManager = new LevelGroundManager(false);
        this._finishFlagsBuoyManager.load(
            buoyImagePath,
            null,
            this._buoyImageDimensions.height * 1.25,
            50,
            this._buoyImageDimensions.width * 1.35,
            70,
            17
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
    prepare():void
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
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        // Run the closing sequence
        this.levelEndSection(288);
    }

    /**
     * Draws anything that needs to be in the back (before the models) of the level
     */
    drawBack():void
    {
        super.drawBack();
        
        if(this.finishFlagsActive)
            this._finishFlagsBuoyManager.draw(this.levelSpeed);
        
        if(this.finishFlagsManager.groundIsBeingRemoved)
            this._finishFlagsBuoyManager.removeGround();
    }
};