import Kernel from '../../../../Kernel/Kernel';
import IKernel from '../../../../Kernel/IKernel';
import IModel from '../IModel';
import IHelpers from '../../../../Kernel/helpers/IHelpers';
import ICamera from '../../../../engines/GraphicEngine/ICamera';
import IAnimation from './IAnimation';
import IAnimationDetails from './IAnimationDetails';
import IFrameCoordinates from './IFrameCoordinates';
import IModelAnimationsManager, { AnimationsObject } from './IModelAnimationsManager';

/**
 * Manages a model's animations
 */
export default class ModelAnimationsManager implements IModelAnimationsManager {
    private _model:IModel; // A reference to the model
    private _kernel:IKernel; // A reference to the kernel
    private _helpers:IHelpers; // A reference to the helper objects, from the kernel
    private _camera:ICamera; // The level's camera
    private _canvasCtx:CanvasRenderingContext2D; // The 2D context from the canvas element
    
    /**
     * The animations created for the model (each animation will be a property -- the property name is the model state for that animation)
     */
    animations:AnimationsObject;
    
    /**
     * A map of spritesheets, used by the animations. The asset filepath is the key
     */
    sheetMap:Map<string, HTMLImageElement>;
    
    /**
     * Constructor
     * @param model The model that this is used by
     * @param canvasCtx The 2D canvas context
     * @param camera The level's camera
     */
    constructor(model:IModel, canvasCtx:CanvasRenderingContext2D, camera:ICamera)
    {
        this._kernel = Kernel.getInstance();
        this._helpers = this._kernel.helpers;
        
        this._model = model;
        this._camera = camera;
        this._canvasCtx = canvasCtx;
        
        this.sheetMap = new Map<string, HTMLImageElement>();
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
        if(!this.sheetMap.has(sheetPath))
            this.sheetMap.set(sheetPath, this._kernel.loadImage(sheetPath));
        
        let anim:IAnimation = {
			spritesheet: this.sheetMap.get(sheetPath)!,
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
		const nextFrameCoordinates = this._getNextFrameCoordinates();
		const drawPositions = this.getDrawPositionsAndDimensions(this._model);
		
        this._canvasCtx.drawImage(
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
    
    resetCurrentFrameNumber():void
    {
        this.animations[this._model.state].currentFrameIndex = 0;
    }
    
    /**
     * Draws the text content of the linked model
     */
    drawText():void
    {
        const text = this._model.text;
            
        const originalPositions = {
            x: this._model.x + text.x,
            y: this._model.y + text.y,
            z: this._model.z,
            width: 0,
            height: text.size
        }
        
        const calculatedPositions = this.getDrawPositionsAndDimensions(originalPositions);
        
        this._canvasCtx.font = `${text.style} ${calculatedPositions.height}px ${text.font}`;
        this._canvasCtx.fillStyle = text.color;
        
        this._canvasCtx.fillText(text.content, calculatedPositions.x, calculatedPositions.y);
    }
    
    /**
     * Draws the model's hit boxes
     */
    drawHitBoxes():void
    {
        const boxes = this._model.getHitBoxes();
        
        const originalStrokeColor = this._canvasCtx.strokeStyle;
        this._canvasCtx.strokeStyle = "red";
        
        boxes.forEach(box => {
            const { x, y, width, height } = this.getDrawPositionsAndDimensions(box);
            this._canvasCtx.strokeRect(x, y, width, height);
        });
        
        this._canvasCtx.strokeStyle = originalStrokeColor;
    }
    
    /**
     * Calculates the positions/dimensions to draw the model (or hit box)
     * @param originalValues the model's current coordinates, along with the model's z position
     * @returns The correct positions/dimensions to draw the sprite at
     */
	getDrawPositionsAndDimensions(originalValues:IFrameCoordinates & { z:number }):IFrameCoordinates
	{
        const { unit, zCalc } = this._helpers;
        const { unitCameraPositionCalc } = this._camera;
        
		const preZCalcX = unit.xUnit(unitCameraPositionCalc.x(originalValues.x)) + this._camera.canvasPositionX;
		const preZCalcY = unit.yUnit(unitCameraPositionCalc.y(originalValues.y)) + this._camera.canvasPositionY;
		const preZCalcWidth = unit.xUnit(originalValues.width);
		const preZCalcHeight = unit.yUnit(originalValues.height);
        
        const x = zCalc.x(preZCalcX, originalValues.z);
        const y = zCalc.y(preZCalcY, originalValues.z);
        const width = zCalc.width(preZCalcWidth, originalValues.z);
        const height = zCalc.height(preZCalcHeight, originalValues.z);
        
		return { x, y, width, height };
	}
	
    /**
     * Gets the coordinates of the next frame on the spritesheet
     * @returns The coordinates of the next frame on the spritesheet
     */
    private _getNextFrameCoordinates():IFrameCoordinates
    {
        const animation = this.animations[this._model.state];
		let currentFrameIndex = animation.currentFrameIndex;
		
        //First, we need to determine how many game-loop frames we need to wait before we move on to the next 
        //frame of this sprite's animation. This is to ensure that the sprite's animation remains consistent
        //if the game's fps changes (It also means that the sprite can have a different fps to the game-loop).
        animation.nextCount = Math.floor(this._kernel.fps / animation.fps);
        
        // Change the frame to the next one, if it is time to
        if(animation.waitCount >= animation.nextCount)
        {
            if(animation.fps > this._kernel.fps)
                //If the sprite has more frames per second than the current game fps,
                //skip the necessary amount of frames to make up for that.
                currentFrameIndex += Math.floor(animation.fps / this._kernel.fps);
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
			if(animation.nextAnimation != "")
				this._model.state = animation.nextAnimation;
		}
		
        return animation.frameCoordinates[animation.currentFrameIndex];
    }
}