import Level from '../../../Kernel/entities/Level/Level';
import IModelEventManager from '../../../Kernel/entities/Level/IModelEventManager';
import ILevel from '../../../Kernel/entities/Level/ILevel';
import LoadingScreenHUD from '../../HUDs/LoadingScreenHUD/LoadingScreenHUD';
import Kernel from '../../../Kernel/Kernel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import Frame from '../../../Kernel/engines/GraphicEngine/Frame';
import IKeyboardEventManager from '../../../Kernel/entities/Level/IKeyboardEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import IAssetHandler from '../../../Kernel/AssetHandler/IAssetHandler';
import { GameLoopStatus } from '../../../Kernel/GameLoopManager/IGameLoopManager';

/**
 * A base class for loading screens
 */
export default class LoadingScreen extends Level
{
    protected backgroundImagePath?:string; // The path to the background image asset
    protected levelToLoad!:ILevel; // The level to be loaded
    protected autoContinue:boolean; // Should the screen automatically start the level, once it has loaded?
    
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
        
        this.HUD = new LoadingScreenHUD(pointerEventManager);
        this.isPauseable = false;
        this.autoContinue = false;
	}
    
    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
	{
		super.load(assetHandler);
        
        const settings = Kernel.getInstance().settings;
        
        const frame = new Frame(0, 0, settings.unitsWithinCameraX, settings.unitsWithinCameraY);
        
        if(this.backgroundImagePath) {
            const backgroundImage = assetHandler.loadImage(this.backgroundImagePath);
            frame.setBackgroundImage(backgroundImage);
            
            this.frameManager.setFrames([frame]);
            
            this.assetsToUnload.push(
                this.backgroundImagePath
            );
        }
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare()
    {
        super.prepare();
        
        Kernel.getInstance().loadLevel(this.levelToLoad);
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        const kernel = Kernel.getInstance();
        
        // We don't want this level to pause (e.g. on the browser changing to another tab)
        if(kernel.status === GameLoopStatus.PrePaused)
            kernel.toggleGamePause();
        
        const levelHasLoaded = kernel.assetHandler.assetsStillLoading === 0;

        (this.HUD as LoadingScreenHUD).setLevelHasLoaded(levelHasLoaded);

        if(this.autoContinue && levelHasLoaded)
            Kernel.getInstance().unloadCurrentLevel();
    }
};