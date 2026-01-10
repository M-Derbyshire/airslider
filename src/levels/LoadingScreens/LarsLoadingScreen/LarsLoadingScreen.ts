import FrameManager from '../../../../Kernel/engines/GraphicEngine/FrameManager';
import IFrameManager from '../../../../Kernel/engines/GraphicEngine/IFrameManager';
import IKeyboardEventManager from '../../../../Kernel/entities/Level/IKeyboardEventManager';
import IModelEventManager from '../../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../../Kernel/entities/Level/IPointerEventManager';
import KeyboardEventManager from '../../../../Kernel/entities/Level/KeyboardEventManager';
import ModelEventManager from '../../../../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../../../../Kernel/entities/Level/PointerEventManager';
import Kernel from '../../../../Kernel/Kernel';
import Lars from '../../Lars/Lars';
import LoadingScreen from '../../LoadingScreen/LoadingScreen';

/**
 * The loading screen for Lars
 */
export default class LarsLoadingScreen extends LoadingScreen
{
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
        
        this.levelToLoad = new Lars(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(Kernel.getInstance().canvasContext.canvas),
            new KeyboardEventManager()
        );
        
        this.backgroundImagePath = "/levels/LoadingScreens/LarsLoadingScreen/images/background.png";
    }
};