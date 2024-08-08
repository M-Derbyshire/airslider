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
     * The maximum FPS that the game should be allowed to run at
     */
	fpsLimit:number;
    
    /**
     * If we want to display the FPS counter, what color should the text be?
     * The FPS counter is only drawn if this value is truthy
     */
	fpsDisplayColor?:string;
    
    /**
     * How many draw-space units are there within the camera's size (this value is used for both x and y)?
     * So, if this were 1000, then a model with a width and height of 1000 would take up the entire 
     * screen (assuming their z position was 0)
     */
	unitsWithinCamera:number;
    
    /**
     * The horizontal size of the camera's aspect ratio (e.g. the 16 in "16:9")
     */
	aspectRatioHorizontal:number;
    
    /**
     * The vertical size of the camera's aspect ratio (e.g. the 9 in "16:9")
     */
	aspectRatioVertical:number;
    
    /**
     * The class of the control's initialiser
     */
	ControlsInitialiserClass:new()=>IControlsInitialiser;
    
    /**
     * The class of the initial level
     */
	InitialLevelClass:new()=>ILevel;
};