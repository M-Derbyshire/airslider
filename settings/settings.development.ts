import EpilepsyWarning from '../assets/levels/EpilepsyWarning/EpilepsyWarning';
import ASControlsInitialiser from './ControlsInitialiser/ASControlsInitialiser';
import ISettings from './ISettings';

export default {
	fpsLimit: 70,
	fpsDisplayColor: "blue",
	unitsWithinCamera: 1000,
	aspectRatioHorizontal: 17,
	aspectRatioVertical: 9,
	ControlsInitialiserClass: ASControlsInitialiser,
	InitialLevelClass: EpilepsyWarning
} as ISettings;