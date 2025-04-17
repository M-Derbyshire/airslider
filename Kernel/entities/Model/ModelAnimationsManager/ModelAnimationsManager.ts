import IModel from '../IModel';
import IAnimation from './IAnimation';
import IAnimationDetails from './IAnimationDetails';
import IModelAnimationsManager, { AnimationsObject } from './IModelAnimationsManager';
import Kernel from '../../../Kernel';
import IDrawPositions from '../../../engines/GraphicEngine/IDrawPositions';
import IDrawDimensions from '../../../engines/GraphicEngine/IDrawDimensions';

/**
 * Manages a model's animations
 */
export default class ModelAnimationsManager implements IModelAnimationsManager {
    private _model:IModel; // A reference to the model
    
    /**
     * The animations created for the model (each animation will be a property -- the property name 
     * is the model state for that animation)
     */
    animations:AnimationsObject;
    
    /**
     * Constructor
     * @param model The model that this is used by
     */
    constructor(model:IModel)
    {
        this._model = model;
    }
    
    /**
     * Creates and returns a new animation
     * @param animationDetails The details needed to create this animation
     * @returns The newly created animation
     */
    createAnimation({
        sheetPath, 
        fps, 
        drawWidth, 
        drawHeight, 
        frameCoordinates, 
        xOffset = 0, 
        yOffset = 0, 
        nextAnimation = ""
    }:IAnimationDetails):IAnimation
    {
        const assetHandler = Kernel.getInstance().assetHandler;
        
        let anim:IAnimation = {
			spritesheet: assetHandler.loadImage(sheetPath),
			frameCoordinates,
            fps,
            waitCount: 0, // increased when waiting to move to the next frame
            nextCount: 0, // when waitCount equals this, move to the next frame (done so animation and game can have different fps. This is set on every new game-loop frame)
            currentFrameIndex: 0,
            height: drawHeight,
            width: drawWidth,
            xOffset,
            yOffset,
            nextAnimation, //used to follow through from one animation into another (this is the name of the next state)
        };
        
        return anim;
    }
    
    /**
     * Registers an array of animations with this manager
     * @param animations The animations to register with this manager
     */
    registerAnimations(animations:AnimationsObject):void
    {
        this.animations = animations;
    }
    
    /**
     * Draws the correct frame of the animation (moving to the next frame if it's time to do so)
     */
    drawNextFrame():void
    {
        // We want to call this, even if we don't need to draw the model, so the frame number still gets changed
        const nextFrameCoordinates = this._getNextFrameCoordinates();
        
		const drawPositions = this.getDrawPositionsAndDimensions(this._model);
        if(drawPositions.height === 0 || drawPositions.width === 0)
            return;
        
        Kernel.getInstance().canvasContext.drawImage(
            this.animations[this._model.state].spritesheet, 
			nextFrameCoordinates.x,
			nextFrameCoordinates.y,
			nextFrameCoordinates.width,
			nextFrameCoordinates.height,
			drawPositions.x,
			drawPositions.y,
			drawPositions.width,
			drawPositions.height
        );
    }
    
    /**
     * Draws the text content of the linked model
     */
    drawText():void
    {
        Kernel.getInstance().graphicEngine.drawText(
            this._model.text,
            this._model,
            "scaled"
        );
    }
    
    /**
     * Draws the model's hit boxes
     */
    drawHitBoxes():void
    {
        const canvasCtx = Kernel.getInstance().canvasContext;
        
        const boxes = this._model.getHitBoxes();
        
        const originalStrokeColor = canvasCtx.strokeStyle;
        canvasCtx.strokeStyle = "red";
        
        boxes.forEach(box => {
            const { x, y, width, height } = this.getDrawPositionsAndDimensions(box);
            canvasCtx.strokeRect(x, y, width, height);
        });
        
        canvasCtx.strokeStyle = originalStrokeColor;
    }
    
    /**
     * Calculates the positions/dimensions to draw the model (or hit box)
     * @param originalValues the model's current coordinates, along with the model's z position
     * @returns The correct positions/dimensions to draw the sprite at
     */
	getDrawPositionsAndDimensions(originalValues:IDrawPositions&IDrawDimensions&{ z:number }):IDrawPositions&IDrawDimensions
	{
        return Kernel.getInstance().graphicEngine.getScaledDrawPositionsAndDimensions(originalValues);
	}
	
    /**
     * Gets the coordinates of the next frame on the spritesheet
     * @returns The coordinates of the next frame on the spritesheet
     */
    private _getNextFrameCoordinates():IDrawPositions&IDrawDimensions
    {
        const kernel = Kernel.getInstance();
        
        const animation = this.animations[this._model.state];
        
        if(animation.frameCoordinates.length > 1 || animation.nextAnimation) {
            let currentFrameIndex = animation.currentFrameIndex;
            
            //First, we need to determine how many game-loop frames we need to wait before we move on to the next 
            //frame of this sprite's animation. This is to ensure that the sprite's animation remains consistent
            //if the game's fps changes (It also means that the sprite can have a different fps to the game-loop).
            animation.nextCount = Math.floor(kernel.fps / animation.fps);
            
            // Change the frame to the next one, if it is time to
            if(animation.waitCount >= animation.nextCount)
            {
                if(animation.fps > kernel.fps)
                    //If the sprite has more frames per second than the current game fps,
                    //skip the necessary amount of frames to make up for that.
                    currentFrameIndex += Math.floor(animation.fps / kernel.fps);
                else
                    //If the sprite has less or equal frames per second to the game-loop's fps,
                    //we can just move to the next frame now.
                    currentFrameIndex++;
                
                animation.waitCount = 0;
            }
            
            animation.waitCount++;
            animation.currentFrameIndex = currentFrameIndex;
            
            //Is this the last frame in this sprite animation?
            if(currentFrameIndex > animation.frameCoordinates.length - 1)
            {
                //Reset the current animation
                animation.currentFrameIndex = 0;
                
                //If this animation isn't looped, but has another animation to switch to, change the state
                if(animation.nextAnimation)
                    this._model.state = animation.nextAnimation;
            }
        }
		
        return animation.frameCoordinates[animation.currentFrameIndex];
    }
}