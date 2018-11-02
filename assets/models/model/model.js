class Model {
    
    //constructor is run before the engines are initialised (load() is run afterwards)
    constructor(){
        this.state; //string with the current state of the model
        this.anims; //object of all the animations (returned by registerAnim())
        
        this.x;
        this.y;
        this.z;
        this.xSpeed;
        this.ySpeed;
        this.zSpeed;
        
        this.loadNextFrame = false; //needed when loading images
    }
    
    
    registerAnim(path, frameCount, fps, width, height)
    {
        let anim = {
            path: path,
            frameCount: frameCount,
            frames: [],
            waitCount: 0, //used when waiting to move to next frame
            nextCount: (kernel.fps / fps) - 1, //when to move to the next frame (done so anim and game can have different fps)
            currentFrame: 0,
            height: height,
            width: width
        };
        
        for(let i = 0; i < anim.frameCount; i++)
        {
            anim.frames[i] = new Image();
            anim.frames[i].src = anim.path + "/" + i + ".png";
        }
        return anim;
    }
    
    nextFrame()
    {
        let frame = this.anims[this.state].frames[this.anims[this.state].currentFrame];
        
        //change the frame to the next one
        if(this.anims[this.state].waitCount == this.anims[this.state].nextCount)
        {
            if(this.anims[this.state].currentFrame == this.anims[this.state].frameCount - 1) //if frame is last one
            {
                this.anims[this.state].currentFrame = 0;
            } else {
                this.anims[this.state].currentFrame++;
            }
            this.anims[this.state].waitCount = 0;
        }
        this.anims[this.state].waitCount++;
        
        return frame;
    }
    
    draw()
    {
        kernel.graphicEn.gameCtx.drawImage(this.nextFrame(), this.x, this.y, this.anims[this.state].width, this.anims[this.state].height);
    }
}