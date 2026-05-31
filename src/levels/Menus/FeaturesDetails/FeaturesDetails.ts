import FrameManager from '../../../../Kernel/engines/GraphicEngine/FrameManager';
import IFrameManager from '../../../../Kernel/engines/GraphicEngine/IFrameManager';
import IKeyboardEventManager from '../../../../Kernel/entities/Level/IKeyboardEventManager';
import IModelEventManager from '../../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../../Kernel/entities/Level/IPointerEventManager';
import KeyboardEventManager from '../../../../Kernel/entities/Level/KeyboardEventManager';
import Level from '../../../../Kernel/entities/Level/Level';
import ModelEventManager from '../../../../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../../../../Kernel/entities/Level/PointerEventManager';
import Kernel from '../../../../Kernel/Kernel';
import FeaturesDetailsHUD from '../../../HUDs/FeaturesDetailsHUD/FeaturesDetailsHUD';
import MainMenu from '../MainMenu/MainMenu';

/**
 * A level that provides details on different features (e.g. the fullscreen mode)
 */
export default class FeaturesDetails extends Level
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
        
        this.isPauseable = false;
        
        const onContinue = () => Kernel.getInstance().unloadCurrentLevel();
        this.HUD = new FeaturesDetailsHUD(pointerEventManager, onContinue);
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare()
    {
        super.prepare();
        
        const kernel = Kernel.getInstance();
        const camera = kernel.graphicEngine.camera;

        camera.setColors("#000018", "black");
        
        const nextLevel = new MainMenu(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(kernel.canvasContext.canvas),
            new KeyboardEventManager()
        );
        kernel.loadLevel(nextLevel);
    }
};