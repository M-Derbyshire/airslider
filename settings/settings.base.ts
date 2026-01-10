import FrameManager from '../Kernel/engines/GraphicEngine/FrameManager';
import KeyboardEventManager from '../Kernel/entities/Level/KeyboardEventManager';
import ModelEventManager from '../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../Kernel/entities/Level/PointerEventManager';
import IKernel from '../Kernel/IKernel';
import Kernel from '../Kernel/Kernel';
import EpilepsyWarning from '../src/levels/EpilepsyWarning/EpilepsyWarning';
import CoratuneLoadingScreen from '../src/levels/LoadingScreens/CoratuneLoadingScreen/CoratuneLoadingScreen';
import ForurnLoadingScreen from '../src/levels/LoadingScreens/ForurnLoadingScreen/ForurnLoadingScreen';
import LarsLoadingScreen from '../src/levels/LoadingScreens/LarsLoadingScreen/LarsLoadingScreen';
import NeonusLoadingScreen from '../src/levels/LoadingScreens/NeonusLoadingScreen/NeonusLoadingScreen';
import VevaniaLoadingScreen from '../src/levels/LoadingScreens/VevaniaLoadingScreen/VevaniaLoadingScreen';
import ISettings from './ISettings';

export default {
	unitsWithinCameraX: 1000,
	unitsWithinCameraY: 1000,
	aspectRatioHorizontal: 17,
	aspectRatioVertical: 9,
	getInitialLevel: (kernel:IKernel) => new LarsLoadingScreen(
		new FrameManager(),
		new ModelEventManager(),
		new PointerEventManager(kernel.canvasContext.canvas),
		new KeyboardEventManager()
	)
} as ISettings;