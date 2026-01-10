import Level from '../../../Kernel/entities/Level/Level';
import IModelEventManager from '../../../Kernel/entities/Level/IModelEventManager';
import ILevel from '../../../Kernel/entities/Level/ILevel';
import LoadingScreenHUD from '../../HUDs/LoadingScreenHUD/LoadingScreenHUD';
import Kernel from '../../../Kernel/Kernel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import Frame from '../../../Kernel/engines/GraphicEngine/Frame';
import { KernelStatus } from '../../../Kernel/IKernel';
import IKeyboardEventManager from '../../../Kernel/entities/Level/IKeyboardEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';

/**
 * A base class for loading screens
 */
export default class LoadingScreen extends Level
{
    protected backgroundImagePath:string; // The path to the background image asset
    protected levelToLoad:ILevel; // The level to be loaded
    
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
        
        this.HUD = new LoadingScreenHUD();
        this.isPauseable = false;
	}
    
    /**
     * Loads the level's assets
     */
	load():void
	{
		super.load();
        
        const settings = Kernel.getInstance().settings;
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const frame = new Frame(0, 0, settings.unitsWithinCameraX, settings.unitsWithinCameraY);
        
        const backgroundImage = assetHandler.loadImage(this.backgroundImagePath);
        frame.setBackgroundImage(backgroundImage);
        
        this.frameManager.setFrames([frame]);
        
        this.assetsToUnload.push(
            this.backgroundImagePath
        );
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
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
        if(kernel.status === KernelStatus.PrePaused)
            kernel.toggleGamePause();
        
        (this.HUD as LoadingScreenHUD).setLevelHasLoaded(kernel.assetHandler.assetsStillLoading === 0);
    }
};