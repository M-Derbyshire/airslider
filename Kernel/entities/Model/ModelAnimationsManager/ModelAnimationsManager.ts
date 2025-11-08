import IModelAnimationsManager, { AnimationsObject, IAnimation, IAnimationDetails, originalModelCoordinates } from './IModelAnimationsManager';
import IGraphicEngine, { IDrawDimensions, IDrawPositions, ITextContent } from "../../../engines/GraphicEngine/IGraphicEngine";
import IAssetHandler from '../../../AssetHandler/IAssetHandler';
import Kernel from '../../../Kernel';
import { IHitBox } from '../IModel';

/**
 * Manages a model's animations
 */
export default class ModelAnimationsManager implements IModelAnimationsManager {
    private _assetHandler:IAssetHandler; // The game's asset handler
    private _canvasCtx:CanvasRenderingContext2D; // The context of the canvas that the game is being drawn on
    private _graphicEngine:IGraphicEngine; // The graphic engine used by the level
    
    /**
     * The animations created for the model (each animation will be a property -- the property name 
     * is the model state for that animation)
     */
    animations:AnimationsObject;
    
    /**
     * Constructor
     * @param assetHandler The game's asset handler
     * @param canvasCtx The context of the canvas that the game is being drawn on
     * @param graphicEngine The graphic engine used by the level
     */
    constructor(assetHandler:IAssetHandler, canvasCtx:CanvasRenderingContext2D, graphicEngine:IGraphicEngine)
    {
        this._assetHandler = assetHandler;
        this._canvasCtx = canvasCtx;
        this._graphicEngine = graphicEngine;
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
        onAnimationEnd,
        xOffset = 0, 
        yOffset = 0
    }:IAnimationDetails):IAnimation
    {
        let anim:IAnimation = {
			spritesheet: this._assetHandler.loadImage(sheetPath),
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
        this.animations = animations;
    }
    
    /**
     * Draws the correct frame of the animation (moving to the next frame if it's time to do so)
     * @param animationName the name of the animation to draw
     * @param modelCoordinates the model's current coordinates, including its Z-axis position
     */
    drawNextFrame(animationName:string, modelCoordinates:originalModelCoordinates):void
    {
        // We want to call this, even if we don't need to draw the model, so the frame number still gets changed
        const nextFrameCoordinates = this._getNextFrameCoordinates(animationName);
        
		const drawPositions = this.getDrawPositionsAndDimensions(modelCoordinates);
        if(drawPositions.height === 0 || drawPositions.width === 0)
            return;
        
        this._canvasCtx.drawImage(
            this.animations[animationName].spritesheet, 
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
     * @param text the text content, and the details required to draw it
     * @param modelPosition the x/y/z values (in units) of the model
     */
    drawText(textContent:ITextContent, modelPosition:IDrawPositions&{z:number}):void
    {
        this._graphicEngine.drawText(textContent, modelPosition, "scaled");
    }
    
    /**
     * Draws the model's hit boxes
     * @param color the color to use when drawing the boxes
     * @param hitBoxes the hit boxes to draw
     */
    drawHitBoxes(color:string, hitBoxes:IHitBox[]):void
    {
        const originalStrokeColor = this._canvasCtx.strokeStyle;
        this._canvasCtx.strokeStyle = color;
        
        hitBoxes.forEach(box => {
            const { x, y, width, height } = this.getDrawPositionsAndDimensions(box);
            this._canvasCtx.strokeRect(x, y, width, height);
        });
        
        this._canvasCtx.strokeStyle = originalStrokeColor;
    }
    
    /**
     * Calculates the positions/dimensions to draw the model (or hit box)
     * @param modelCoordinates the model's current coordinates, along with the model's z position
     * @returns The correct positions/dimensions to draw the sprite at
     */
	getDrawPositionsAndDimensions(modelCoordinates:originalModelCoordinates):IDrawPositions&IDrawDimensions
	{
        return this._graphicEngine.getScaledDrawPositionsAndDimensions(modelCoordinates);
	}
	
    /**
     * Gets the coordinates of the next frame on the spritesheet
     * @param animationName the name of the animation to draw
     * @returns The coordinates of the next frame on the spritesheet
     */
    private _getNextFrameCoordinates(animationName:string):IDrawPositions&IDrawDimensions
    {
        const gameFps = Kernel.getInstance().fps;
        
        const animation = this.animations[animationName];
        
        if(animation.frameCoordinates.length > 1 || animation.onAnimationEnd) {
            let currentFrameIndex = animation.currentFrameIndex;
            
            //First, we need to determine how many game-loop frames we need to wait before we move on to the next 
            //frame of this sprite's animation. This is to ensure that the sprite's animation remains consistent
            //if the game's fps changes (It also means that the sprite can have a different fps to the game-loop).
            animation.nextCount = Math.floor(gameFps / animation.fps);
            
            // Change the frame to the next one, if it is time to
            if(animation.waitCount >= animation.nextCount)
            {
                if(animation.fps > gameFps)
                    //If the sprite has more frames per second than the current game fps,
                    //skip the necessary amount of frames to make up for that.
                    currentFrameIndex += Math.floor(animation.fps / gameFps);
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
                
                if(animation.onAnimationEnd)
                    animation.onAnimationEnd();
                
                return animation.frameCoordinates[animation.frameCoordinates.length - 1];
            }
        }
		
        return animation.frameCoordinates[animation.currentFrameIndex];
    }
}