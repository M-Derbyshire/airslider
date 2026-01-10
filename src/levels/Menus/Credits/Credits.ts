import IFrameManager from '../../../../Kernel/engines/GraphicEngine/IFrameManager';
import IKeyboardEventManager from '../../../../Kernel/entities/Level/IKeyboardEventManager';
import IModelEventManager from '../../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../../Kernel/entities/Level/IPointerEventManager';
import Level from '../../../../Kernel/entities/Level/Level';
import CreditsHUD from '../../../HUDs/CreditsHUD/CreditsHUD';

/**
 * The level for the Credits screen
 */
export default class Credits extends Level
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
		
		this.isPauseable = false;
        
        this.HUD = new CreditsHUD();
	}
};