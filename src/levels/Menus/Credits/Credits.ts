import IFrameManager from '../../../../Kernel/engines/GraphicEngine/IFrameManager';
import IKeyboardEventManager from '../../../../Kernel/entities/Level/IKeyboardEventManager';
import IModelEventManager from '../../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../../Kernel/entities/Level/IPointerEventManager';
import CreditsHUD from '../../../HUDs/CreditsHUD/CreditsHUD';
import ASMenu from '../../ASMenu/ASMenu';

/**
 * The level for the Credits screen
 */
export default class Credits extends ASMenu
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
        
        this.HUD = new CreditsHUD(pointerEventManager);
	}
};