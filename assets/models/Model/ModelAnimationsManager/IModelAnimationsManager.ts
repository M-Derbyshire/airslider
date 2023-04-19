import ICamera from "../../../../engines/GraphicEn/ICamera";
import IAnimation from "./IAnimation";
import IAnimationDetails from "./IAnimationDetails";
import IFrameCoordinates from "./IFrameCoordinates";

/**
 * Manages a model's animations
 */
export default interface IModelAnimationsManager {
    
    /**
     * The animations created for the model
     */
    animations:AnimationsObject;
    
    /**
     * A map of spritesheets, used by the animations. The asset filepath is the key
     */
    sheetMap:Map<string, HTMLImageElement>;
    
    /**
     * Loads this animation manager
     * @param canvasCtx The 2D canvas context
     * @param camera The game's camera
     */
    load(canvasCtx:CanvasRenderingContext2D, camera:ICamera):void;
    
    /**
     * Creates and returns a new animation (which will then need to be registered with the registerAnimations method)
     * @param animationDetails The details needed to create this animation
     * @returns The newly created animation
     */
    createAnimation(animationDetails:IAnimationDetails):IAnimation;
    
    /**
     * Registers an array of animations with this manager
     * @param animations The animations to register with this manager
     */
    registerAnimations(animations:AnimationsObject):void;
    
    /**
     * Draws the correct frame of the animation (moving to the next frame if it's time to do so)
     */
    drawNextFrame():void;
    
    /**
     * Draws the text content of the linked model
     */
    drawText():void;
    
    /**
     * Draws the model's boundary boxes
     */
    drawBoundaryBoxes():void;
    
    /**
     * Calculates the positions/dimensions to draw the model (or boundary box)
     * @param originalValues the model's current coordinates, along with the model's z position
     * @returns The correct positions/dimensions to draw the sprite at
     */
	getDrawPositionsAndDimensions(originalValues:IFrameCoordinates & { z:number }):IFrameCoordinates
    
};


/**
 * The type for the animations object
 */
export type AnimationsObject = {
    [key:string]: IAnimation;
};