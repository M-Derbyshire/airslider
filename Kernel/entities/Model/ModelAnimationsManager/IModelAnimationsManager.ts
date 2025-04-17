import IDrawDimensions from "../../../engines/GraphicEngine/IDrawDimensions";
import IDrawPositions from "../../../engines/GraphicEngine/IDrawPositions";
import IAnimation from "./IAnimation";
import IAnimationDetails from "./IAnimationDetails";

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
     */
    drawNextFrame():void;
    
    /**
     * Draws the text content of the linked model
     */
    drawText():void;
    
    /**
     * Draws the model's hit boxes
     */
    drawHitBoxes():void;
    
    /**
     * Calculates the positions/dimensions to draw the model (or hit box)
     * @param originalValues the model's current coordinates, along with the model's z position
     * @returns The correct positions/dimensions to draw the sprite at
     */
	getDrawPositionsAndDimensions(originalValues:IDrawPositions&IDrawDimensions&{ z:number }):IDrawPositions&IDrawDimensions
};

/**
 * The type for the animations object (each animation will be a property -- the property name is the model state for that animation)
 */
export type AnimationsObject = {
    [key:string]: IAnimation;
};