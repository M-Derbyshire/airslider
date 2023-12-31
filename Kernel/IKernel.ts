import ILevel from "../assets/levels/Level/ILevel";
import IModel from "../assets/models/Model/IModel";
import IGameEngine from "../engines/GameEngine/IGameEngine";
import IGraphicEngine from "../engines/GraphicEngine/IGraphicEngine";
import ISoundEngine from "../engines/SoundEngine/ISoundEngine";
import ISettings from "../settings/ISettings";
import IHelpers from "./helpers/IHelpers";
import IAssetHandler from "./AssetHandler/IAssetHandler";
import { KernelStatus } from "./KernelStatus";

/**
 * Controls the entire game (this will be a singleton)
 */
export default interface IKernel {
    /**
     * If we're displaying the FPS counter, what color should the text be?
     */
    fpsDisplayColor:string;
    
    /**
     * How many drawSpace x/y units are there within the camera's size?
     */
    unitsWithinCamera:number;
    
    /**
     * The current status of the game (e.g. is it playing, or in another state)
     */
    readonly status:KernelStatus;
    
    /**
     * The settings for the game
     */
    readonly settings:ISettings;
    
    /**
     * The current Frames Per Second of the game
     */
    readonly fps:number;
    
    /**
     * The maximum FPS that the game should be allowed to run at
     */
    readonly fpsLimit:number;
    
    /**
     * The total milliseconds that the level has not been paused or stopped for any reason
     */
    readonly totalLevelActiveMilliseconds:number;
    
    /**
     * The root directory/path, added to the beginning of all asset file paths
     */
    readonly rootPath:string;
    
    /**
     * Provides a number of "helper" objects, that each calculate and/or provide useful values
     */
    readonly helpers:IHelpers;
    
    /**
     * The current level that is being ran
     */
    readonly level:ILevel;
    
    /**
     * The models loaded by the current level
     */
    readonly loadedModels:IModel[];
    
    /**
     * Has the current level been prepared? (using the Level.prepare method)
     */
    readonly levelHasBeenPrepared:boolean;
    
    /**
     * The loaded image/audio assets
     */
    readonly loadedAssets:(HTMLImageElement|HTMLAudioElement)[];
    
    /**
     * Loads and handles assets
     */
    readonly assetHandler:IAssetHandler;
    
    /**
     * How many assets are still loading?
     */
    readonly assetsStillLoading:number;
    
    /**
     * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
     */
    readonly gameEngine:IGameEngine;
    
    /**
     * The engine that controls the drawing to the screen
     */
    readonly graphicEngine:IGraphicEngine;
    
    /**
     * The engine that controls the sound/music of the game
     */
    readonly soundEngine:ISoundEngine;
    
    /**
     * The canvas element that the game should be drawn on
     */
    readonly gameCanvas:HTMLCanvasElement;
    
    /**
     * The 2D context from the HTML canvas element
     */
    readonly gameContext:CanvasRenderingContext2D;
    
    /**
     * Should the canvas's styling width/height be corrected, based on the Device Pixel Ratio?
     */
    readonly correctCanvasStyleToDevicePixelRatio:boolean;
    
    
    /**
     * Loads the elements needed for the kernel, and the initial level
     */
    load():void;
    
    /**
     * Unloads the current level, releasing any assets that need releasing
     */
    unloadCurrentLevel():void;
    
    /**
     * Loads an image (if not already loaded) with the asset handler
     * @param path the file path to the image
     * @param callback a callback function, to run when the asset has finished loading (this function should still call the asset handler's default asset callback)
     * @returns the image object
     */
    loadImage(path:string):HTMLImageElement;
    
    /**
     * Loads an audio file (if not already loaded) with the asset handler
     * @param path the file path to the audio file
     * @returns the audio object
     */
    loadAudio(path:string):HTMLAudioElement;
    
    /**
     * Starts the loading of a font file into the HTML document
     * @param name the name of the font
     * @param path the path to the font file
     */
    loadFont(name:string, path:string):void;
    
    /**
     * Finds the loaded asset with the given file path, and reduces the usage count against it. The asset should stay 
     * loaded if there are still entities using it, but if the usage count goes down to 0, this will remove it. (fonts 
     * cannot be unloaded)
     * @param path the file path of the asset
     */
    releaseAsset(path:string):void;
    
    /**
     * Runs the game
     */
    run():void;
    
    /**
     * Paues/unpauses the game (if the current level is pauseable)
     */
    toggleGamePause():void;
    
    /**
     * Handles errors
     * @param err the error to handle (doesn't have to be an instance of Error)
     */
    handleError(err:any):void
    
    /**
     * Loads the kernel, and starts the game running
     */
    initiate():void;
    
};