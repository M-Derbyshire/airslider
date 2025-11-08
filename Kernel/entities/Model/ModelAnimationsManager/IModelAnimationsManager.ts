import { IDrawDimensions, IDrawPositions, ITextContent } from "../../../engines/GraphicEngine/IGraphicEngine";
import { IHitBox } from "../IModel";

/**
 * Manages a model's animations
 */
export default interface IModelAnimationsManager {
    /**
     * The animations created for the model
     */
    animations:AnimationsObject;
    
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
     * @param animationName the name of the animation to draw
     * @param modelCoordinates the model's current coordinates, including its Z-axis position
     */
    drawNextFrame(animationName:string, modelCoordinates:originalModelCoordinates):void;
    
    /**
     * Draws the text content of the linked model
     * @param text the text content, and the details required to draw it
     * @param modelPosition the x/y/z values (in units) of the model
     */
    drawText(textContent:ITextContent, modelPosition:IDrawPositions&{z:number}):void;
    
    /**
     * Draws the model's hit boxes
     * @param hitBoxes the hit boxes to draw
     */
    drawHitBoxes(hitBoxes:IHitBox[]):void;
    
    /**
     * Calculates the positions/dimensions to draw the model (or hit box)
     * @param modelCoordinates the model's current coordinates, along with the model's z position
     * @returns The correct positions/dimensions to draw the sprite at
     */
	getDrawPositionsAndDimensions(modelCoordinates:originalModelCoordinates):IDrawPositions&IDrawDimensions
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
     * The file path to the spritesheet
     */
    sheetPath:string;
    
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