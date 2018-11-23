class Model {
    
    //constructor is run before the engines are initialised (load() is run afterwards)
    constructor(){
        this.state; //string with the current state of the model
        this.anims; //object of all the animations (returned by registerAnim())
        this.active;
        
        this.x;
        this.y;
        this.z;
        this.xSpeed;
        this.ySpeed;
        this.zSpeed;
        
        this.events = []; //will hold array of events objects
        this.loadedIndex; //will hold current index in kernel.loadedModels
    }
    
    
    registerAnim(path, frameCount, fps, width, height, xOffset = 0, yOffset = 0)
    {
        let anim = {
            path: path,
            frameCount: frameCount,
            frames: [],
            waitCount: 0, //used when waiting to move to next frame
            nextCount: (kernel.fps / fps), //when to move to the next frame (done so anim and game can have different fps)
            currentFrame: 0,
            height: height,
            width: width,
            xOffset: xOffset, //change position for consistency
            yOffset: yOffset
        };
        
        for(let i = 0; i < anim.frameCount; i++)
        {
            anim.frames[i] = new Image();
            anim.frames[i].src = anim.path + "/" + i + ".png";
        }
        return anim;
    }
    
    //takes models array related to event, and action (which is a function) 
    registerEvent(relatedModels, action)
    {
        this.events.push({
            models: kernel.loadedModels.filter((model, index) => {
                if(relatedModels.includes(model.constructor.name))
                {
                    return index;
                }
            }),
            check: action
        }); 
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
        kernel.graphicEn.gameCtx.drawImage(this.nextFrame(), this.x, this.y + this.z, this.anims[this.state].width, this.anims[this.state].height);
    }
    
    changeState(state)
    {
        this.x += this.anims[state].xOffset;
        this.y += this.anims[state].yOffset;
        this.state = state;
    }
    
    move()
    {
        //meant to be overloaded
        //only created here for static models
    }
    
    checkEvents()
    {
        this.events.forEach((event) => {
            for(let i = 0; i < event.models.length; i++)
            {
                event.check(kernel.loadedModels[this.loadedIndex], event.models[i]);
            }
        });
        
        if(this.extraEvents)
        {
            this.extraEvents();
        }
    }
}