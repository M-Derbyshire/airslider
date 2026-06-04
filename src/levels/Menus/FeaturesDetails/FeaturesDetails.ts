import FrameManager from '../../../../Kernel/engines/GraphicEngine/FrameManager';
import IFrameManager from '../../../../Kernel/engines/GraphicEngine/IFrameManager';
import IKeyboardEventManager from '../../../../Kernel/entities/Level/IKeyboardEventManager';
import IModelEventManager from '../../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../../Kernel/entities/Level/IPointerEventManager';
import KeyboardEventManager from '../../../../Kernel/entities/Level/KeyboardEventManager';
import ModelEventManager from '../../../../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../../../../Kernel/entities/Level/PointerEventManager';
import Kernel from '../../../../Kernel/Kernel';
import FullscreenHelper from '../../../../Kernel/utils/FullscreenHelper';
import FeaturesDetailsHUD from '../../../HUDs/FeaturesDetailsHUD/FeaturesDetailsHUD';
import ASMenu from '../../ASMenu/ASMenu';
import MainMenu from '../MainMenu/MainMenu';

/**
 * A level that provides details on different features (e.g. the fullscreen mode)
 */
export default class FeaturesDetails extends ASMenu
{
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
        
        // We will skip this screen, if the Fullscreen feature isn't available (as that's the only feature
        // this screen advises on). However, this screen was being displayed for a frame (so it flashes up, then
        // off), so we don't want to display anything in that situation
        if(FullscreenHelper.isFeatureAvailable()) {
            const onContinue = () => Kernel.getInstance().unloadCurrentLevel();
            this.HUD = new FeaturesDetailsHUD(pointerEventManager, onContinue);
        }
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare()
    {
        super.prepare();
        
        const kernel = Kernel.getInstance();
        
        const nextLevel = new MainMenu(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(kernel.canvasContext.canvas),
            new KeyboardEventManager()
        );
        kernel.loadLevel(nextLevel);

        // The fullscreen feature is the only one this screen currently advises on.
        // So, if it's not available, just skip this screen.
        if(!FullscreenHelper.isFeatureAvailable())
            kernel.unloadCurrentLevel();
    }
};