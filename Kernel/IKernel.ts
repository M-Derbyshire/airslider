import ILevel from "../assets/levels/Level/ILevel";
import IModel from "../assets/models/Model/IModel";
import IGameEngine from "../engines/GameEngine/IGameEngine";
import IGraphicEngine from "../engines/GraphicEngine/IGraphicEngine";
import ISoundEngine from "../engines/SoundEngine/ISoundEngine";
import ISettings from "../settings/ISettings";
import IHelpers from "./helpers/IHelpers";
import { KernelStatus } from "./KernelStatus";

/**
 * This will be a singleton that controls the entire game, and provides other entities with 
 * access to certain functionality and data.
 */
export default interface IKernel {
    /**
     * If we want to display the FPS counter, this is the color the text should be.
     * The FPS counter is only drawn if this value is truthy.
     */
    fpsDisplayColor:string;
    
    /**
     * The amount of draw-space units there are within the camera's size.
     * There are seperate amounts for both the X and Y axis.
     */
    unitsWithinCameraX:number;
    unitsWithinCameraY:number;
    
    /**
     * A map to store any state that needs to be accessible to all levels.
     */
    readonly centralState:Map<string, any>;
    
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
     * The total amount of milliseconds that the level has not been paused or stopped for any reason
     */
    readonly totalLevelActiveMilliseconds:number;
    
    /**
     * The amount of milliseconds that passed between the last frame, and this one
     */
    readonly timeSinceLastFrameMS:number;
    
    /**
     * The root directory/path, added to the beginning of all file paths when loading assets
     */
    readonly rootPath:string;
    
    /**
     * Provides a number of "helper" objects, that each calculate and/or provide useful values
     */
    readonly helpers:IHelpers;
    
    /**
     * The current level that is being ran
     */
    readonly level?:ILevel;
    
    /**
     * The models loaded by the current level
     */
    readonly loadedModels:IModel[];
    
    /**
     * Has the current level been prepared? (using the Level.prepare method)
     */
    readonly levelHasBeenPrepared:boolean;
    
    /**
     * The amount of assets that are still loading
     */
    readonly assetsStillLoading:number;
    
    /**
     * The engine that triggers the actions of levels/models. It also triggers the checking for in-game events
     */
    readonly gameEngine?:IGameEngine;
    
    /**
     * The engine that controls the drawing to the screen
     */
    readonly graphicEngine?:IGraphicEngine;
    
    /**
     * The engine that controls the sound/music of the game
     */
    readonly soundEngine?:ISoundEngine;
    
    /**
     * The HTML canvas element that the game should be drawn on
     */
    readonly gameCanvas:HTMLCanvasElement;
    
    /**
     * The 2D context from the HTML canvas element
     */
    readonly gameContext:CanvasRenderingContext2D;
    
    /**
     * Loads the given level, and adds it to the kernel's internal level queue
     * @param level the level to load
     */
    loadLevel(level:ILevel):void;
    
    /**
     * Marks the current level as ready to be unloaded
     */
    unloadCurrentLevel():void;
    
    /**
     * Restarts the current level
     */
    restartCurrentLevel():void;
    
    /**
     * Loads an image with the asset handler
     * @param path the file path to the image
     * @returns the image object
     */
    loadImage(path:string):HTMLImageElement;
    
    /**
     * Loads an audio file with the asset handler
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
     * Deletes the asset with the given file path (fonts cannot be released).
     * @param path the file path of the asset
     */
    releaseAsset(path:string):void;
    
    /**
     * Runs the game loop
     */
    run():void;
    
    /**
     * Pauses/unpauses the game (if the current level is pauseable)
     */
    toggleGamePause():void;
    
    /**
     * Handles errors
     * @param error the error to handle (this doesn't have to be an instance of Error)
     */
    handleError(error:any):void
};