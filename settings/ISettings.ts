import ILevel from "../Kernel/entities/Level/ILevel";
import IKernel from "../Kernel/IKernel";

/**
 * The settings for the game
 */
export default interface ISettings {
    /**
     * The maximum FPS that the game should be allowed to run at (the browser may still run 
     * the game at a lower FPS)
     */
	fpsLimit?:number;
    
    /**
     * If we want to display the FPS counter, what color should the text be?
     * The FPS counter is only drawn if this value is truthy
     */
	fpsDisplayColor?:string;

    /**
     * Should the fullscreen option be enabled? (this only has an affect if fullscreen is
     * available in the browser)
     */
    isFullscreenEnabled?:boolean;
    
    /**
     * The URL of the assets directory.
     * If the game is being hosted locally, then this should be left undefined
     */
    assetsDirUrl?:string;
    
    /**
     * How many draw-space units are there within the camera's size (on the x axis)?
     * So, if this value was 1000, then a model with a width of 1000 would take up the entire 
     * screen (assuming its z position was 0)
     */
	unitsWithinCameraX?:number;
    
    /**
     * How many draw-space units are there within the camera's size (on the y axis)?
     * So, if this value was 1000, then a model with a height of 1000 would take up the entire 
     * screen (assuming its z position was 0)
     */
    unitsWithinCameraY?:number;
    
    /**
     * The horizontal size of the camera's aspect ratio (e.g. the 16 in "16:9")
     */
	aspectRatioHorizontal?:number;
    
    /**
     * The vertical size of the camera's aspect ratio (e.g. the 9 in "16:9")
     */
	aspectRatioVertical?:number;
    
    /**
     * A function that will construct the initial level of the game
     */
	getInitialLevel:(kernel:IKernel)=>ILevel;
};

// These are the properties that still need to be optional on the
// SettingsWithDefaults type (all the others will be required)
type AlwaysOptionalSettingsKeys = "fpsDisplayColor" | "assetsDirUrl";

/**
 * The settings for the game, but with certain properties not being
 * optional
 */
export type SettingsWithDefaults =
  Omit<Required<ISettings>, AlwaysOptionalSettingsKeys> &
  Pick<Partial<ISettings>, AlwaysOptionalSettingsKeys>;