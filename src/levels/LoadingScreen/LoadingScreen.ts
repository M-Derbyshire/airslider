import Level from '../../../Kernel/entities/Level/Level';
import EventManager from '../../../Kernel/entities/Level/EventManager';
import PointerEventManager from '../../../Kernel/entities/Level/PointerEventManager';
import ILevel from '../../../Kernel/entities/Level/ILevel';
import LoadingScreenHUD from '../../HUDs/LoadingScreenHUD/LoadingScreenHUD';
import Kernel from '../../../Kernel/Kernel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import Frame from '../../../Kernel/engines/GraphicEngine/Frame';
import { KernelStatus } from '../../../Kernel/IKernel';

/**
 * A base class for loading screens
 */
export default class LoadingScreen extends Level
{
    protected backgroundImagePath:string; // The path to the background image asset
    protected LevelToLoad:new()=>ILevel; // The class of the level to be loaded
    
    constructor()
	{
		super();
        
        this.HUD = new LoadingScreenHUD();
	}
    
    /**
     * Loads and sets up the level
     * @param frameManager The frame manager for the level
     * @param eventManager Manages the event monitoring for a level
     * @param pointerEventManager Manages any events relating to mouse clicks or screen touches
     */
	load(
        frameManager:IFrameManager,
        eventManager:EventManager,
        pointerEventManager:PointerEventManager
    ):void
	{
		super.load(frameManager, eventManager, pointerEventManager);
        
        const kernel = Kernel.getInstance();
        
        const frame = new Frame(0, 0, kernel.unitsWithinCameraX, kernel.unitsWithinCameraY);
        
        const backgroundIndex = frame.loadBackground(this.backgroundImagePath);
        frame.setBackgroundImage(backgroundIndex);
        
        this.frameManager.addFrame(frame);
        
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
        
        Kernel.getInstance().loadLevel(new this.LevelToLoad());
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
        
        (this.HUD as LoadingScreenHUD).setLevelHasLoaded(kernel.assetsStillLoading === 0);
    }
};