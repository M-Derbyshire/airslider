import ASControlsInitialiser from './ControlsInitialiser/ASControlsInitialiser';
import TheConstruct from '../assets/levels/TheConstruct/TheConstruct';
import ISettings from './ISettings';

export default {
	gameCanvas: document.getElementById("gameCanvas") as HTMLCanvasElement,
	correctCanvasStyleToDevicePixelRatio: true,
	fpsLimit: 70,
	fpsDisplayColor: "blue",
	unitsWithinCamera: 1000,
	aspectRatioHorizontal: 17,
	aspectRatioVertical: 9,
	ControlsInitialiserClass: ASControlsInitialiser,
	InitialLevelClass: TheConstruct
} as ISettings;