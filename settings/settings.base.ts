import FrameManager from '../Kernel/engines/GraphicEngine/FrameManager';
import KeyboardEventManager from '../Kernel/entities/Level/KeyboardEventManager';
import ModelEventManager from '../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../Kernel/entities/Level/PointerEventManager';
import IKernel from '../Kernel/IKernel';
import EpilepsyWarning from '../src/levels/Menus/EpilepsyWarning/EpilepsyWarning';
import ISettings from '../Kernel/settings/ISettings';

export default {
	getInitialLevel: (kernel:IKernel) => new EpilepsyWarning(
		new FrameManager(),
		new ModelEventManager(),
		new PointerEventManager(kernel.canvasContext.canvas),
		new KeyboardEventManager()
	)
} as ISettings;