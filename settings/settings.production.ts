import ASControlsInitialiser from './ControlsInitialiser/ASControlsInitialiser';
import TheConstruct from '../assets/levels/TheConstruct/TheConstruct';
import ISettings from './ISettings';

export default {
	gameCanvas: document.getElementById("gameCan") as HTMLCanvasElement,
	correctCanvasStyleAndDevicePixelRatio: true,
	isOnMobile: false,
	initialFPS: 60,
	fpsLimit: 70,
	displayFps: true,
	fpsDisplayColor: "blue",
	unitsWithinCamera: 1000,
	aspectRatioHorizontal: 17,
	aspectRatioVertical: 9,
	playerModelIndex: 0,
	controlsInitialiserClass: ASControlsInitialiser,
	initialLevelClass: TheConstruct,
	initialLevelConstructorParameters: []
} as ISettings;