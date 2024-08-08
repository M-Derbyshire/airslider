import Level from '../Level/Level';
import IFrameManager from '../../../engines/GraphicEngine/IFrameManager';
import EventManager from '../Level/EventManager';
import PointerEventManager from '../Level/PointerEventManager';
import ILevel from '../Level/ILevel';
import Frame from '../../../engines/GraphicEngine/Frame';
import LoadingScreenHUD from '../../HUDs/LoadingScreenHUD/LoadingScreenHUD';
import { KernelStatus } from '../../../Kernel/KernelStatus';
import Kernel from '../../../Kernel/Kernel';

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
        
        const unitsWithinCamera = Kernel.getInstance().unitsWithinCamera;
        const frame = new Frame(0, 0, unitsWithinCamera, unitsWithinCamera);
        
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
        
        const kernel = Kernel.getInstance();
        
        const axisVanishPointPosition = kernel.unitsWithinCamera / 2;
        kernel.helpers.zCalc.setVanishPoint(axisVanishPointPosition, axisVanishPointPosition);
        
        kernel.loadLevel(new this.LevelToLoad());
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