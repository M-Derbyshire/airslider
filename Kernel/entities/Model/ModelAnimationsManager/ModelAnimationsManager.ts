import IModelAnimationsManager, { AnimationsObject, IAnimation, IAnimationDetails, originalModelCoordinates } from './IModelAnimationsManager';
import IGraphicEngine, { IDrawDimensions, IDrawPositions, ITextContent } from "../../../engines/GraphicEngine/IGraphicEngine";
import { IHitBox } from '../IModel';

/**
 * Manages a model's animations
 */
export default class ModelAnimationsManager implements IModelAnimationsManager {
    private _calculatedDrawPositions:IDrawPositions; // The calculated X/Y pixel values to be used when drawing the model
    private _calculatedDrawDimensions:IDrawDimensions; // The calculated width/height pixel values to be used when drawing the model
    private _animations:AnimationsObject; // The animations created for the model
    
    /**
     * The animations created for the model (each animation will be a property -- the property name 
     * is the model state for that animation)
     */
    get animations():AnimationsObject
    {
        return this._animations;
    }
    
    /**
     * The calculated X/Y pixel values to be used when drawing the model
     */
    get calculatedDrawPositions():IDrawPositions
    {
        return this._calculatedDrawPositions;
    }
    
    /**
     * The calculated width/height pixel values to be used when drawing the model
     */
    get calculatedDrawDimensions():IDrawDimensions
    {
        return this._calculatedDrawDimensions;
    }
    
    /**
     * Constructor
     */
    constructor()
    {
        this._calculatedDrawPositions = {
            x: 0,
            y: 0
        };
        
        this._calculatedDrawDimensions = {
            width: 0,
            height: 0
        };
        
        this._animations = {};
    }
    
    /**
     * Creates and returns a new animation
     * @param animationDetails The details needed to create this animation
     * @returns The newly created animation
     */
    createAnimation({
        spritesheet, 
        fps, 
        drawWidth, 
        drawHeight, 
        frameCoordinates, 
        onAnimationEnd,
        xOffset = 0, 
        yOffset = 0
    }:IAnimationDetails):IAnimation
    {
        let anim:IAnimation = {
			spritesheet,
			frameCoordinates,
            fps,
            waitCount: 0, // increased when waiting to move to the next frame
            nextCount: 0, // when waitCount equals this, move to the next frame (done so animation and game can have different fps. This is set on every new game-loop frame)
            currentFrameIndex: 0,
            height: drawHeight,
            width: drawWidth,
            xOffset,
            yOffset,
            onAnimationEnd
        };
        
        return anim;
    }
    
    /**
     * Registers an array of animations with this manager
     * @param animations The animations to register with this manager
     */
    registerAnimations(animations:AnimationsObject):void
    {
        this._animations = animations;
    }
    
    /**
     * Removes all animations from this manager
     */
    clearAllAnimations():void
    {
        this._animations = {};
    }
    
    /**
     * Calculates and stores the positions/dimensions to use when drawing the animation (these can be accessed via the
     * calculatedDrawPositions and calculatedDrawDimensions properties)
     * @param modelCoordinates the model's current coordinates, including its Z-axis position
     * @param graphicEngine the graphic engine used by the level
     */
    precalculateDrawPositionsAndDimensions(modelCoordinates:originalModelCoordinates, graphicEngine:IGraphicEngine):void
    {
        const { x, y, width, height } = this._getDrawPositionsAndDimensions(modelCoordinates, graphicEngine);
        
        this._calculatedDrawPositions = { x, y };
        this._calculatedDrawDimensions = { width, height };
    }
    
    /**
     * Draws the correct frame of the animation (moving to the next frame if it's time to do so), using the
     * positions/dimensions calculated by the precalculateDrawPositionsAndDimensions method
     * @param animationName the name of the animation to draw
     * @param canvasContext the 2D context from the HTML canvas element
     * @param currentFps the current FPS of the game
     */
    drawNextFrame(animationName:string, canvasContext:CanvasRenderingContext2D, currentFps:number):void
    {
        // We want to call this, even if we don't need to draw the model, so the frame number still gets changed
        const nextFrameCoordinates = this._getNextFrameCoordinates(animationName, currentFps);
        
        if(this._calculatedDrawDimensions.height === 0 || this._calculatedDrawDimensions.width === 0)
            return;
        
        canvasContext.drawImage(
            this.animations[animationName].spritesheet, 
			nextFrameCoordinates.x,
			nextFrameCoordinates.y,
			nextFrameCoordinates.width,
			nextFrameCoordinates.height,
			this._calculatedDrawPositions.x,
			this._calculatedDrawPositions.y,
			this._calculatedDrawDimensions.width,
			this._calculatedDrawDimensions.height
        );
    }
    
    /**
     * Draws the text content of the linked model
     * @param text the text content, and the details required to draw it
     * @param modelPosition the x/y/z values (in units) of the model
     * @param graphicEngine the graphic engine used by the level
     */
    drawText(textContent:ITextContent, modelPosition:IDrawPositions&{z:number}, graphicEngine:IGraphicEngine):void
    {
        graphicEngine.drawText(textContent, modelPosition, "scaled");
    }
    
    /**
     * Draws the model's hit boxes
     * @param color the color to use when drawing the boxes
     * @param hitBoxes the hit boxes to draw
     * @param graphicEngine the graphic engine used by the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    drawHitBoxes(color:string, hitBoxes:IHitBox[], graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void
    {
        const originalStrokeColor = canvasContext.strokeStyle;
        canvasContext.strokeStyle = color;
        
        hitBoxes.forEach(box => {
            const { x, y, width, height } = this._getDrawPositionsAndDimensions(box, graphicEngine);
            canvasContext.strokeRect(x, y, width, height);
        });
        
        canvasContext.strokeStyle = originalStrokeColor;
    }
    
    /**
     * Calculates the positions/dimensions to use when drawing the model/hitbox
     * @param modelCoordinates the coordinates (including Z-axis position) of the object to draw
     * @param graphicEngine the graphic engine used by the level
     * @returns The correct positions/dimensions to use when drawing the object
     */
	private _getDrawPositionsAndDimensions(
        modelCoordinates:originalModelCoordinates,
        graphicEngine:IGraphicEngine
    ):IDrawPositions&IDrawDimensions
	{
        return graphicEngine.getScaledDrawPositionsAndDimensions(modelCoordinates);
	}
	
    /**
     * Gets the coordinates of the next frame on the spritesheet
     * @param animationName the name of the animation to draw
     * @param currentFps the current FPS of the game
     * @returns The coordinates of the next frame on the spritesheet
     */
    private _getNextFrameCoordinates(animationName:string, currentFps:number):IDrawPositions&IDrawDimensions
    {
        const animation = this.animations[animationName];
        
        if(animation.frameCoordinates.length > 1 || animation.onAnimationEnd) {
            let nextFrameIndex = animation.currentFrameIndex;
            
            //First, we need to determine how many game-loop frames we need to wait before we move on to the next 
            //frame of this sprite's animation. This is to ensure that the sprite's animation remains consistent
            //if the game's fps changes (It also means that the sprite can have a different fps to the game-loop).
            animation.nextCount = Math.floor(currentFps / animation.fps);
            
            // Change the frame to the next one, if it is time to
            if(animation.waitCount >= animation.nextCount)
            {
                if(animation.fps > currentFps)
                    //If the sprite has more frames per second than the current game fps,
                    //skip the necessary amount of frames to make up for that.
                    nextFrameIndex += Math.floor(animation.fps / currentFps);
                else
                    //If the sprite has less or equal frames per second to the game-loop's fps,
                    //we can just move to the next frame now.
                    nextFrameIndex++;
                
                animation.waitCount = 0;
            }
            
            animation.waitCount++;
            animation.currentFrameIndex = nextFrameIndex;
            
            // Have we gone past the last frame in this sprite's animation?
            const lastFrameIndex = animation.frameCoordinates.length - 1;
            if(nextFrameIndex > lastFrameIndex)
            {   
                if(animation.onAnimationEnd) {
                    animation.onAnimationEnd();
                    animation.currentFrameIndex = lastFrameIndex;
                } else {
                    animation.currentFrameIndex = 0;
                }
            }
        }
		
        return animation.frameCoordinates[animation.currentFrameIndex];
    }
}