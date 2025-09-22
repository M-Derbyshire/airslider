import EpilepsyWarning from '../src/levels/EpilepsyWarning/EpilepsyWarning';
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
	InitialLevelClass: VevaniaLoadingScreen
} as ISettings;