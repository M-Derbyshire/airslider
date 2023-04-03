import Kernel from '/Kernel/kernel';

export default class ModelAnimationsManager {
    constructor(model)
    {
        this.model = model;
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        //Set in load()
        this._camera;
        this._canvasCtx;
        
        this.animations;
        
        this.sheetMap = new Map(); //Stores the spritesheets. The key is the sheet path
    }
    
    load(canvasCtx, camera)
    {
        this._camera = camera;
        this._canvasCtx = canvasCtx;
    }
    
    registerAnimations(animations)
    {
        //animations will be an object of animations (the property names are the state names),
        //created with the below createAnimation() method.
        this.animations = animations;
    }
    
    createAnimation({sheetPath, fps, drawWidth, drawHeight, frameCoordinates, xOffset = 0, yOffset = 0, nextAnim = ""})
    {
        if(!this.sheetMap.has(sheetPath))
            this.sheetMap.set(sheetPath, this.kernel.loadImage(sheetPath));
        
        let anim = {
			spritesheet: this.sheetMap.get(sheetPath),
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
    
    drawNextFrame()
    {
		//Need to call this here, as if this is an animation that changes state at the end,
		//the below settings (preZCalc* variables) may have the wrong width/height for the 
		//new animation.
		const nextFrameCoordinates = this._getNextFrameCoordinates();
		
        //Draw the image, taking into account the z-axis when setting the size/positions
		const drawPositions = this._getDrawPositionsAndDimensions(this.model)
		
        this._canvasCtx.drawImage(
            this.animations[this.model.state].spritesheet, 
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
    
    drawText()
    {
        const text = this.model.text;
            
        const origPositions = {
            x: this.model.x + text.x,
            y: this.model.y + text.y,
            z: this.model.z,
            width: 0,
            height: text.size
        }
        
        const calcPositions = this._getDrawPositionsAndDimensions(origPositions);
        
        this._canvasCtx.font = `${text.style} ${calcPositions.height}px ${text.font}`;
        this._canvasCtx.fillStyle = text.color;
        
        this._canvasCtx.fillText(text.content, calcPositions.x, calcPositions.y);
    }
    
    drawBoundaryBoxes()
    {
        const boxes = this.model.getBoundaryBoxes();
        
        const originalStrokeColor = this._canvasCtx.strokeStyle;
        this._canvasCtx.strokeStyle = "red";
        
        boxes.forEach(box => {
            const { x, y, width, height } = this._getDrawPositionsAndDimensions(box);
            this._canvasCtx.strokeRect(x, y, width, height);
        });
        
        this._canvasCtx.strokeStyle = originalStrokeColor;
    }
    
    // Calculates the positions/dimensions to draw the model (or boundary box), and returns them as an object: { x, y, width, height }
    // The "originalValues" parameter needs to be an object: { x, y, z, width, height }
	_getDrawPositionsAndDimensions(originalValues)
	{
		const preZCalcX = this.helpers.unit.xUnit(this._camera.unitCameraPositionCalc.x(originalValues.x)) + this._camera.canvasPositionX;
		const preZCalcY = this.helpers.unit.yUnit(this._camera.unitCameraPositionCalc.y(originalValues.y)) + this._camera.canvasPositionY;
		const preZCalcWidth = this.helpers.unit.xUnit(originalValues.width);
		const preZCalcHeight = this.helpers.unit.yUnit(originalValues.height);
        
        const zCalcX = this.helpers.zCalc.x(preZCalcX, originalValues.z);
        const zCalcY = this.helpers.zCalc.y(preZCalcY, originalValues.z);
        const zCalcWidth = this.helpers.zCalc.width(preZCalcWidth, originalValues.z);
        const zCalcHeight = this.helpers.zCalc.height(preZCalcHeight, originalValues.z);
        
		return {
			x: zCalcX, 
            y: zCalcY, 
            width: zCalcWidth, 
            height: zCalcHeight
		};
	}
	
	//Returns the coordinates (x/y/width/height) of the next frame on the spritesheet
    _getNextFrameCoordinates()
    {
		let currentFrameIndex = this.animations[this.model.state].currentFrameIndex;
		
        //First we need to set how many game-loop frames to wait for before we move on to the next frame
        //of this sprite's animation. This is to ensure that the sprite's animation remains consistent
        //if the game's fps changes (It also means that the sprite can have a different fps to the game-loop).
        this.animations[this.model.state].nextCount = Math.floor(this.kernel.fps / this.animations[this.model.state].fps);
        
        //change the frame to the next one, if it is time to
        if(this.animations[this.model.state].waitCount >= this.animations[this.model.state].nextCount)
        {
            if(this.animations[this.model.state].fps > this.kernel.fps)
            {
                //If the sprite has more frames per second than the current game fps,
                //skip the necessary amount of frames to make up for that.
                currentFrameIndex += Math.floor(this.animations[this.model.state].fps / this.kernel.fps);
            } else {
                //If the sprite has less or equal frames per second to the game-loop's fps,
                //we can just move to the next frame now.
                currentFrameIndex++;
            }
            
            this.animations[this.model.state].waitCount = 0;
        }
        
        this.animations[this.model.state].waitCount++;
		this.animations[this.model.state].currentFrameIndex = currentFrameIndex;
		
		//Is this the last frame in this sprite animation?
		if(currentFrameIndex > this.animations[this.model.state].frameCoordinates.length - 1)
		{
			//Reset the current animation
			this.animations[this.model.state].currentFrameIndex = 0;
			
			//If this animation isn't looped, but has another animation to switch to, change the state
			if(this.animations[this.model.state].nextAnim != "")
			{
				this.model.state = this.animations[this.model.state].nextAnim;
			}
		}
		
        return this.animations[this.model.state]
			.frameCoordinates[this.animations[this.model.state].currentFrameIndex];
    }
}