import IGraphicEngine, { IDrawDimensions, IDrawPositions, ITextContent } from "../../../engines/GraphicEngine/IGraphicEngine";
import { IHitBox } from "../IModel";

/**
 * Manages a model's animations
 */
export default interface IModelAnimationsManager {
    /**
     * The animations created for the model
     */
    readonly animations:AnimationsObject;
    
    /**
     * The calculated X/Y pixel values to be used when drawing the model
     */
    readonly calculatedDrawPositions:IDrawPositions;
    
    /**
     * The calculated width/height pixel values to be used when drawing the model
     */
    readonly calculatedDrawDimensions:IDrawDimensions;
    
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
     * Removes all animations from this manager
     */
    clearAllAnimations():void;
    
    /**
     * Calculates and stores the positions/dimensions to use when drawing the animation (these can be accessed via the
     * calculatedDrawPositions and calculatedDrawDimensions properties)
     * @param modelCoordinates the model's current coordinates, including its Z-axis position
     * @param graphicEngine the graphic engine used by the level
     */
    precalculateDrawPositionsAndDimensions(modelCoordinates:originalModelCoordinates, graphicEngine:IGraphicEngine):void
    
    /**
     * Draws the correct frame of the animation (moving to the next frame if it's time to do so), using the
     * positions/dimensions calculated by the precalculateDrawPositionsAndDimensions method
     * @param animationName the name of the animation to draw
     * @param canvasContext the 2D context from the HTML canvas element
     * @param currentFps the current FPS of the game
     */
    drawNextFrame(animationName:string, canvasContext:CanvasRenderingContext2D, currentFps:number):void;
    
    /**
     * Draws the text content of the linked model
     * @param text the text content, and the details required to draw it
     * @param modelPosition the x/y/z values (in units) of the model
     * @param graphicEngine the graphic engine used by the level
     */
    drawText(textContent:ITextContent, modelPosition:IDrawPositions&{z:number}, graphicEngine:IGraphicEngine):void;
    
    /**
     * Draws the model's hit boxes
     * @param color the color to use when drawing the boxes
     * @param hitBoxes the hit boxes to draw
     * @param graphicEngine the graphic engine used by the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    drawHitBoxes(color:string, hitBoxes:IHitBox[], graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void;
};

/**
 * The type for the animations object (each animation will be a property -- the property name is the model state for that animation)
 */
export type AnimationsObject = {
    [key:string]: IAnimation;
};

/**
 * The original coordinates of the model, before scaling/positioning/etc
 */
export type originalModelCoordinates = IDrawPositions&IDrawDimensions&{ z:number };

/**
 * Represents a model's animation
 */
export interface IAnimation {
    /**
     * The spritesheet for this animation
     */
    spritesheet:HTMLImageElement;
    
    /**
     * The coordinates of the frames on the spritesheet
     */
    frameCoordinates:IFrameCoordinates[];
        
    /**
     * The Frames Per Second that this animation should play at
     */
    fps:number;
    
    /**
     * How many frames of the game have passed since we last changed the frame of this animation?
     */
    waitCount:number;
    
    /**
     * How many frames of the game need to have passed before we can change to the next frame of this animation?
     */
    nextCount:number;
    
    /**
     * The index of the current frame for the current animation
     */
    currentFrameIndex:number;
    
    /**
     * The height (in units) that this animation should be drawn at
     */
    height:number;
    
    /**
     * The width (in units) that this animation should be drawn at
     */
    width:number;
    
    /**
     * If the x position of the model needs to change when switching to this animation, it will be changed by this value
     */
    xOffset:number;
    
    /**
     * If the y position of the model needs to change when switching to this animation, it will be changed by this value
     */
    yOffset:number;
    
    /**
     * A callback to call once this animation has ended. If you don't want the animation to be looped, you can use this to change the model's state
     */
    onAnimationEnd?:()=>void;
};

/**
 * The details required to create a new animation for a model
 */
export interface IAnimationDetails {
    /**
     * The spritesheet for this animation
     */
    spritesheet:HTMLImageElement;
    
    /**
     * The Frames Per Second that this animation should play at
     */
    fps:number;
    
    /**
     * The width (in units) that this animation should be drawn at
     */
    drawWidth:number;
    
    /**
     * The height (in units) that this animation should be drawn at
     */
    drawHeight:number;
    
    /**
     * The coordinates of a frame on a spritesheet
     */
    frameCoordinates:IFrameCoordinates[];
    
    /**
     * If the x position of the model needs to change when switching to this animation, it will be changed by this value
     */
    xOffset?:number;
    
    /**
     * If the y position of the model needs to change when switching to this animation, it will be changed by this value
     */
    yOffset?:number;
    
    /**
     * A callback to call once this animation has ended. If you don't want the animation to be looped, you can use this to change the model's state
     */
    onAnimationEnd?:()=>void;
};

/**
 * The coordinates of a frame on a spritesheet
 */
export interface IFrameCoordinates {
    /**
     * The x position
     */
    x:number;
    
    /**
     * The y position
     */
    y:number;
    
    /**
     * The width dimension
     */
    width:number;
    
    /**
     * The height dimension
     */
    height:number;  
};