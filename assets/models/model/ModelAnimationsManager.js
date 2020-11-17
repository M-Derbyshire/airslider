class ModelAnimationsManager {
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
    
    createAnimation({path, frameCount, fps, width, height, xOffset = 0, yOffset = 0, nextAnim = ""})
    {
        let anim = {
            path: path,
            frameCount: frameCount,
            frames: [],
            fps: fps,
            waitCount: 0, //increased when waiting to move to next frame
            nextCount: 0, //when waitCount equals this, move to the next frame (done so anim and game can have different fps. This is set on every new game-loop frame)
            currentFrame: 0,
            height: height,
            width: width,
            xOffset: xOffset, //change position for consistency
            yOffset: yOffset,
            nextAnim: nextAnim, //used to follow through from one anim into another (this is the name of the next state)
        };
        
        for(let i = 0; i < anim.frameCount; i++)
        {
            anim.frames[i] = this.kernel.loadImage(anim.path + "/" + i + ".png");
        }
        
        return anim;
    }
    
    drawNextFrame()
    {
        //Draw the image, taking into account the z-axis when setting the size/positions
		const preZCalcX = this.helpers.unit.xUnit(this._camera.unitCameraPositionCalc.x(this.model.x)) + this._camera.canvasPositionX;
		const preZCalcY = this.helpers.unit.yUnit(this._camera.unitCameraPositionCalc.y(this.model.y)) + this._camera.canvasPositionY;
		const preZCalcWidth = this.helpers.unit.xUnit(this.model.width);
		const preZCalcHeight = this.helpers.unit.yUnit(this.model.height);
		
        this._canvasCtx.drawImage(
            this.kernel.loadedAssets[this.getNextFrameIndex()].asset, 
            this.helpers.zCalc.x(preZCalcX, this.model.z), 
            this.helpers.zCalc.y(preZCalcY, this.model.z), 
            this.helpers.zCalc.width(preZCalcWidth, this.model.z), 
            this.helpers.zCalc.height(preZCalcHeight, this.model.z)
        );
    }
    
    getNextFrameIndex()
    {
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
                this.animations[this.model.state].currentFrame += Math.floor(this.animations[this.model.state].fps / this.kernel.fps);
            } else {
                //If the sprite has less or equal frames per second to the game-loop's fps,
                //we can just move to the next frame now.
                this.animations[this.model.state].currentFrame++;
            }
            
            //Is this the last frame in this sprite animation?
            if(this.animations[this.model.state].currentFrame > this.animations[this.model.state].frameCount - 1)
            {
                this.animations[this.model.state].currentFrame = 0;
                
                //If this animation isn't looped, but has another animation to switch to, change the state
                if(this.animations[this.model.state].nextAnim != "")
                {
                    this.model.state = this.animations[this.model.state].nextAnim;
                }
            }
            
            this.animations[this.model.state].waitCount = 0;
        }
        
        this.animations[this.model.state].waitCount++;
        
        return this.animations[this.model.state].frames[this.animations[this.model.state].currentFrame];
    }
}