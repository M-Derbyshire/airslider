import Kernel from '/kernel/kernel';

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
    
    createAnimation({sheetPath, fps, drawWidth, drawHeight, framesCoordinates, xOffset = 0, yOffset = 0, nextAnim = ""})
    {
        let anim = {
			spritesheet: this.kernel.loadImage(sheetPath),
            framesCoordinates: framesCoordinates,
            fps: fps,
            waitCount: 0, //increased when waiting to move to next frame
            nextCount: 0, //when waitCount equals this, move to the next frame (done so anim and game can have different fps. This is set on every new game-loop frame)
            currentFrameIndex: 0,
            height: drawHeight,
            width: drawWidth,
            xOffset: xOffset, //change position for consistency
            yOffset: yOffset,
            nextAnim: nextAnim, //used to follow through from one anim into another (this is the name of the next state)
        };
        
        return anim;
    }
    
    drawNextFrame()
    {
		//Need to call this here, as if this is an animation that changes state at the end,
		//the below settings (preZCalc* variables) may have the wrong width/height for the 
		//new animation.
		const nextFrameCoordinates = this.getNextFrameCoordinates();
		
        //Draw the image, taking into account the z-axis when setting the size/positions
		const preZCalcX = this.helpers.unit.xUnit(this._camera.unitCameraPositionCalc.x(this.model.x)) + this._camera.canvasPositionX;
		const preZCalcY = this.helpers.unit.yUnit(this._camera.unitCameraPositionCalc.y(this.model.y)) + this._camera.canvasPositionY;
		const preZCalcWidth = this.helpers.unit.xUnit(this.model.width);
		const preZCalcHeight = this.helpers.unit.yUnit(this.model.height);
		
        this._canvasCtx.drawImage(
            this.animations[this.model.state].spritesheet, 
			nextFrameCoordinates.x,
			nextFrameCoordinates.y,
			nextFrameCoordinates.width,
			nextFrameCoordinates.height,
            this.helpers.zCalc.x(preZCalcX, this.model.z), 
            this.helpers.zCalc.y(preZCalcY, this.model.z), 
            this.helpers.zCalc.width(preZCalcWidth, this.model.z), 
            this.helpers.zCalc.height(preZCalcHeight, this.model.z)
        );
    }
    
	//Returns the coordinates (x/y/width/height) of the next frame on the spritesheet
    getNextFrameCoordinates()
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
            
            //Is this the last frame in this sprite animation?
            if(currentFrameIndex > this.animations[this.model.state].framesCoordinates.length - 1)
            {
                currentFrameIndex = 0;
                
                //If this animation isn't looped, but has another animation to switch to, change the state
                if(this.animations[this.model.state].nextAnim != "")
                {
                    this.model.state = this.animations[this.model.state].nextAnim;
                }
            }
            
            this.animations[this.model.state].waitCount = 0;
        }
        
        this.animations[this.model.state].waitCount++;
        this.animations[this.model.state].currentFrameIndex = currentFrameIndex;
		
        return this.animations[this.model.state].framesCoordinates[currentFrameIndex];
    }
}