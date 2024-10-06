import IFrameCoordinates from './IFrameCoordinates';

/**
 * The details required to create a new animation for a model
 */
export default interface IAnimationDetails {
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
     * If the model should switch to a different animation once this one has finished, this is the name of the model state that uses that animation
     */
    nextAnimation?:string;
};