import ASControlsInitialiser from './ControlsInitialiser/ASControlsInitialiser';
import TheConstruct from '../assets/levels/TheConstruct/TheConstruct';
import ISettings from './ISettings';

export default {
	gameCanvasElementID: "gameCan",
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
	controlsInitialiserClass: ASControlsInitialiser.prototype,
	initialLevelClass: TheConstruct.prototype,
	initialLevelConstructorParameters: []
} as ISettings;