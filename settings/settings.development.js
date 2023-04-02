import ASControlsInitialiser from '/settings/ControlsInitialiser/ASControlsInitialiser';
import TheConstruct from '/assets/levels/TheConstruct/TheConstruct';

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
	controlsInitialiserClass: ASControlsInitialiser,
	initialLevelClass: TheConstruct,
	initialLevelConstructorParameters: []
};