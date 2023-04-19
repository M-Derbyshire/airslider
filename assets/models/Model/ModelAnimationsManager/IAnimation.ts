import IFrameCoordinates from "./IFrameCoordinates";

/**
 * Represents a model animation
 */
export default interface IAnimation {
    
    /**
     * The spritesheet for this animation
     */
    spritesheet:HTMLImageElement;
    
    /**
     * The coordinates of a frame on a spritesheet
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
     * The index of the current frame this animation is on
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
     * If the model should switch to a different animation once this one has finished, this is the name of the model state that uses that animation
     */
    nextAnim:string;
    
};