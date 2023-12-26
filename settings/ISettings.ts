import IControlsInitialiser from "./ControlsInitialiser/IControlsInitialiser";
import ILevel from "../assets/levels/Level/ILevel";

/**
 * The settings for the game
 */
export default interface ISettings {
    /**
     * The canvas element that the game should be drawn on
     */
    gameCanvas:HTMLCanvasElement;
    
    /**
     * Should the canvas's css width/height be corrected, based on the Device Pixel Ratio?
     */
	correctCanvasStyleToDevicePixelRatio:boolean;
    
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
     * How many drawSpace units are there within the camera's size (this value is used for both x and y)?
     */
	unitsWithinCamera:number;
    
    /**
     * The horizontal size of the camera's aspect ratio (e.g. the "16" in "16:9")
     */
	aspectRatioHorizontal:number;
    
    /**
     * The vertical size of the camera's aspect ratio (e.g. the "9" in "16:9")
     */
	aspectRatioVertical:number;
    
    /**
     * The index of the player model, in the Kernel's loadedModels array
     */
	playerModelIndex:number;
    
    /**
     * The class of the controls initialiser
     */
	controlsInitialiserClass:new()=>IControlsInitialiser;
    
    /**
     * The class of the initial level
     */
	initialLevelClass:new()=>ILevel;
    
    /**
     * Any parameters required to initialise the initial level
     */
	initialLevelConstructorParameters:any[];  
};