import IControlsInitialiser from "./ControlsInitialiser/IControlsInitialiser";
import ILevel from "../assets/levels/Level/ILevel";

/**
 * The different settings for the game
 */
export default interface ISettings {
    
    /**
     * The ID of the HTML canvas element
     */
    gameCanvasElementID:string;
    
    /**
     * Should the canvas's styling width/height be corrected, based on the Device Pixel Ratio?
     */
	correctCanvasStyleAndDevicePixelRatio:boolean;
    
    /**
     * Is this a mobile app (such as through Cordova)?
     */
	isOnMobile:boolean;
    
    /**
     * The initial FPS for the game (the FPS will change, based on the actual FPS in the browser)
     */
	initialFPS:number;
    
    /**
     * The maximum FPS that the game should be allowed to run at
     */
	fpsLimit:number;
    
    /**
     * Should the current FPS counter be displayed on the canvas?
     */
	displayFps:boolean;
    
    /**
     * If we're displaying the FPS counter, what color should the text be?
     */
	fpsDisplayColor:string;
    
    /**
     * How many drawSpace x/y units are there within the camera's size?
     */
	unitsWithinCamera:number;
    
    /**
     * The horizontal size of the camera (e.g. the "16" in "16:9")
     */
	aspectRatioHorizontal:number;
    
    /**
     * The vertical size of the camera (e.g. the "9" in "16:9")
     */
	aspectRatioVertical:number;
    
    /**
     * The index of the player model, in the Kernel's loadedModels array
     */
	playerModelIndex:number;
    
    /**
     * The class of the controls initialiser
     */
	controlsInitialiserClass:IControlsInitialiser;
    
    /**
     * The class of the initial level
     */
	initialLevelClass:ILevel;
    
    /**
     * Any parameters required by the constructor of the initial level
     */
	initialLevelConstructorParameters:any[];
    
};