class ModelAnimationsManager {
    constructor(model)
    {
        this.model = model;
        this.kernel = Kernel.getInstance();
        this.animations;
    }
    
    registerAnimations(animations)
    {
        this.animations = animations;
    }
    
    createAnimation({path, frameCount, fps, width, height, xOffset = 0, yOffset = 0, nextAnim = ""})
    {
        let anim = {
            path: path,
            frameCount: frameCount,
            frames: [],
            fps: fps,
            waitCount: 0, //used when waiting to move to next frame
            nextCount: 0, //when to move to the next frame (done so anim and game can have different fps. this is set on every new frame)
            currentFrame: 0,
            height: height,
            width: width,
            xOffset: xOffset, //change position for consistency
            yOffset: yOffset,
            nextAnim: nextAnim, //used to follow through from one anim into another
        };
        
        for(let i = 0; i < anim.frameCount; i++)
        {
            anim.frames[i] = kernel.loadImage(anim.path + "/" + i + ".png");
        }
        
        return anim;
    }
    
    drawNextFrame()
    {
        this.kernel.graphicEn.gameCtx.drawImage(
            this.kernel.loadedAssets[this.getNextFrame()][1], 
            zCalc.x(this.model.x, this.model.z), 
            zCalc.y(this.model.y, this.model.z), 
            zCalc.width(this.model.width, this.model.z), 
            zCalc.height(this.model.height, this.model.z)
        );
    }
    
    getNextFrame()
    {
        this.animations[this.model.state].nextCount = Math.floor(kernel.fps / this.animations[this.model.state].fps);
        
        //change the frame to the next one
        if(this.animations[this.model.state].waitCount >= this.animations[this.model.state].nextCount)
        {
            if(this.animations[this.model.state].fps > kernel.fps)
            {
                this.animations[this.model.state].currentFrame += Math.floor(this.animations[this.model.state].fps / kernel.fps);
            } else {
                this.animations[this.model.state].currentFrame++;
            }
            
            if(this.animations[this.model.state].currentFrame > this.animations[this.model.state].frameCount - 1) //if frame is last one
            {
                this.animations[this.model.state].currentFrame = 0;
                if(this.animations[this.model.state].nextAnim != "") //change the state if this shouldn't be looped
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