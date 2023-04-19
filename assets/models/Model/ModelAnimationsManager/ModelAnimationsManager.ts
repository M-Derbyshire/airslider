import Kernel from '../../../../Kernel/Kernel';
import IKernel from '../../../../Kernel/IKernel';
import IModel from '../IModel';
import IHelpers from '../../../../Kernel/helpers/IHelpers';
import ICamera from '../../../../engines/GraphicEn/ICamera';
import IAnimation from './IAnimation';
import IAnimationDetails from './IAnimationDetails';
import IFrameCoordinates from './IFrameCoordinates';
import IModelAnimationsManager, { AnimationsObject } from './IModelAnimationsManager';

/**
 * Manages a model's animations
 */
export default class ModelAnimationsManager implements IModelAnimationsManager {
    
    private _model:IModel;
    private _kernel:IKernel;
    private _helpers:IHelpers;
    private _camera:ICamera;
    private _canvasCtx:CanvasRenderingContext2D;
    
    /**
     * The animations created for the model
     */
    animations:AnimationsObject;
    
    /**
     * A map of spritesheets, used by the animations. The asset filepath is the key
     */
    sheetMap:Map<string, HTMLImageElement>;
    
    /**
     * Constructor
     * @param model The model that this is used by
     */
    constructor(model:IModel)
    {
        this._model = model;
        this._kernel = Kernel.getInstance();
        this._helpers = this._kernel.helpers;
        
        this._camera;
        this._canvasCtx;
        
        this.animations;
        this.sheetMap = new Map<string, HTMLImageElement>();
    }
    
    /**
     * Loads this animation manager
     * @param canvasCtx The 2D canvas context
     * @param camera The game's camera
     */
    load(canvasCtx:CanvasRenderingContext2D, camera:ICamera):void
    {
        this._camera = camera;
        this._canvasCtx = canvasCtx;
    }
    
    /**
     * Creates and returns a new animation
     * @param animationDetails The details needed to create this animation
     * @returns The newly created animation
     */
    createAnimation({sheetPath, fps, drawWidth, drawHeight, frameCoordinates, xOffset = 0, yOffset = 0, nextAnim = ""}:IAnimationDetails):IAnimation
    {
        if(!this.sheetMap.has(sheetPath))
            this.sheetMap.set(sheetPath, this._kernel.loadImage(sheetPath));
        
        let anim:IAnimation = {
			spritesheet: this.sheetMap.get(sheetPath)!,
			frameCoordinates,
            fps,
            waitCount: 0, //increased when waiting to move to next frame
            nextCount: 0, //when waitCount equals this, move to the next frame (done so anim and game can have different fps. This is set on every new game-loop frame)
            currentFrameIndex: 0,
            height: drawHeight,
            width: drawWidth,
            xOffset, //change position for consistency
            yOffset,
            nextAnim, //used to follow through from one anim into another (this is the name of the next state)
        };
        
        return anim;
    }
    
    /**
     * Registers an array of animations with this manager
     * @param animations The animations to register with this manager
     */
    registerAnimations(animations:AnimationsObject):void
    {
        //animations will be an object of animations (the property names are the state names),
        //created with the createAnimation() method.
        this.animations = animations;
    }
    
    /**
     * Draws the correct frame of the animation (moving to the next frame if it's time to do so)
     */
    drawNextFrame():void
    {
		//Need to call this here, as if this is an animation that changes state at the end,
		//the below settings (preZCalc* variables) may have the wrong width/height for the 
		//new animation.
		const nextFrameCoordinates = this._getNextFrameCoordinates();
		
        //Draw the image, taking into account the z-axis when setting the size/positions
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
    
    /**
     * Draws the text content of the linked model
     */
    drawText():void
    {
        const text = this._model.text;
            
        const origPositions = {
            x: this._model.x + text.x,
            y: this._model.y + text.y,
            z: this._model.z,
            width: 0,
            height: text.size
        }
        
        const calcPositions = this.getDrawPositionsAndDimensions(origPositions);
        
        this._canvasCtx.font = `${text.style} ${calcPositions.height}px ${text.font}`;
        this._canvasCtx.fillStyle = text.color;
        
        this._canvasCtx.fillText(text.content, calcPositions.x, calcPositions.y);
    }
    
    /**
     * Draws the model's boundary boxes
     */
    drawBoundaryBoxes():void
    {
        const boxes = this._model.getBoundaryBoxes();
        
        const originalStrokeColor = this._canvasCtx.strokeStyle;
        this._canvasCtx.strokeStyle = "red";
        
        boxes.forEach(box => {
            const { x, y, width, height } = this.getDrawPositionsAndDimensions(box);
            this._canvasCtx.strokeRect(x, y, width, height);
        });
        
        this._canvasCtx.strokeStyle = originalStrokeColor;
    }
    
    /**
     * Calculates the positions/dimensions to draw the model (or boundary box)
     * @param originalValues the model's current coordinates, along with the model's z position
     * @returns The correct positions/dimensions to draw the sprite at
     */
	getDrawPositionsAndDimensions(originalValues:IFrameCoordinates & { z:number }):IFrameCoordinates
	{
		const preZCalcX = this._helpers.unit.xUnit(this._camera.unitCameraPositionCalc.x(originalValues.x)) + this._camera.canvasPositionX;
		const preZCalcY = this._helpers.unit.yUnit(this._camera.unitCameraPositionCalc.y(originalValues.y)) + this._camera.canvasPositionY;
		const preZCalcWidth = this._helpers.unit.xUnit(originalValues.width);
		const preZCalcHeight = this._helpers.unit.yUnit(originalValues.height);
        
        const zCalcX = this._helpers.zCalc.x(preZCalcX, originalValues.z);
        const zCalcY = this._helpers.zCalc.y(preZCalcY, originalValues.z);
        const zCalcWidth = this._helpers.zCalc.width(preZCalcWidth, originalValues.z);
        const zCalcHeight = this._helpers.zCalc.height(preZCalcHeight, originalValues.z);
        
		return {
			x: zCalcX, 
            y: zCalcY, 
            width: zCalcWidth, 
            height: zCalcHeight
		};
	}
	
    /**
     * Gets the coordinates of the next frame on the spritesheet
     * @returns The coordinates of the next frame on the spritesheet
     */
    private _getNextFrameCoordinates():IFrameCoordinates
    {
		let currentFrameIndex = this.animations[this._model.state].currentFrameIndex;
		
        //First we need to set how many game-loop frames to wait for before we move on to the next frame
        //of this sprite's animation. This is to ensure that the sprite's animation remains consistent
        //if the game's fps changes (It also means that the sprite can have a different fps to the game-loop).
        this.animations[this._model.state].nextCount = Math.floor(this._kernel.fps / this.animations[this._model.state].fps);
        
        //change the frame to the next one, if it is time to
        if(this.animations[this._model.state].waitCount >= this.animations[this._model.state].nextCount)
        {
            if(this.animations[this._model.state].fps > this._kernel.fps)
            {
                //If the sprite has more frames per second than the current game fps,
                //skip the necessary amount of frames to make up for that.
                currentFrameIndex += Math.floor(this.animations[this._model.state].fps / this._kernel.fps);
            } else {
                //If the sprite has less or equal frames per second to the game-loop's fps,
                //we can just move to the next frame now.
                currentFrameIndex++;
            }
            
            this.animations[this._model.state].waitCount = 0;
        }
        
        this.animations[this._model.state].waitCount++;
		this.animations[this._model.state].currentFrameIndex = currentFrameIndex;
		
		//Is this the last frame in this sprite animation?
		if(currentFrameIndex > this.animations[this._model.state].frameCoordinates.length - 1)
		{
			//Reset the current animation
			this.animations[this._model.state].currentFrameIndex = 0;
			
			//If this animation isn't looped, but has another animation to switch to, change the state
			if(this.animations[this._model.state].nextAnim != "")
			{
				this._model.state = this.animations[this._model.state].nextAnim;
			}
		}
		
        return this.animations[this._model.state]
			.frameCoordinates[this.animations[this._model.state].currentFrameIndex];
    }
}