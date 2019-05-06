class Model {
    
    //constructor is run before the engines are initialised (load() is run afterwards)
    constructor(){
        this.state; //string with the current state of the model
        this.anims; //object of all the animations (returned by registerAnim())
        this.active; //is this active
        this.display = true; //should this be drawn
        
        this.x;
        this.y;
        this.z;
        this.xSpeed;
        this.ySpeed;
        this.zSpeed;
        
        this.events = []; //will hold array of events objects
        this.loadedIndex; //will hold current index in kernel.loadedModels
        
        this.damageDealt = 0;
    }
    
    //meant to be overridden
    load() {}
    levelStopped() {}
    act() {}
    
    loadSuper()
    {
        
    }
    
    registerAnim({path, frameCount, fps, width, height, xOffset = 0, yOffset = 0, nextAnim = ""})
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
    
    //takes models array related to event, and action (which is a function) 
    registerEvent(relatedModels, action)
    {
        this.events.push({
            models: kernel.loadedModels.filter((model, index) => {
                if(relatedModels.includes(model.constructor.name) && index != this.loadedIndex)
                {
                    return true;
                }
            }),
            check: action
        });
    }
    
    nextFrame()
    {
        this.anims[this.state].nextCount = kernel.fps / this.anims[this.state].fps;
        
        //change the frame to the next one
        if(this.anims[this.state].waitCount >= this.anims[this.state].nextCount)
        {
            if(this.anims[this.state].fps > kernel.fps)
            {
                this.anims[this.state].currentFrame += Math.floor(this.anims[this.state].fps / kernel.fps);
            } else {
                this.anims[this.state].currentFrame++;
            }
            
            if(this.anims[this.state].currentFrame > this.anims[this.state].frameCount - 1) //if frame is last one
            {
                this.anims[this.state].currentFrame = 0;
                if(this.anims[this.state].nextAnim != "") //change the state if this shouldn't be looped
                {
                    this.changeState(this.anims[this.state].nextAnim);
                }
            }
            this.anims[this.state].waitCount = 0;
        }
        this.anims[this.state].waitCount++;
        
        return this.anims[this.state].frames[this.anims[this.state].currentFrame];
    }
    
    draw()
    {
        kernel.graphicEn.gameCtx.drawImage(
            kernel.loadedAssets[this.nextFrame()][1], 
            zCalc.x(this.x, this.z), 
            zCalc.y(this.y, this.z), 
            zCalc.width(this.anims[this.state].width, this.z), 
            zCalc.height(this.anims[this.state].height, this.z)
        );
    }
    
    changeState(state)
    {
        this.x += this.anims[state].xOffset;
        this.y += this.anims[state].yOffset;
        this.state = state;
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
    
    moveLeft(speed)
    {
        this.x -= xSpeed(speed);
    }
    
    moveRight(speed)
    {
        this.x += xSpeed(speed);
    }
    
    moveUp(speed)
    {
        this.y -= ySpeed(speed);
    }
    
    moveDown(speed)
    {
        this.y += ySpeed(speed);
    }
    
    moveIn(speed)
    {
        this.z += zCalc.speed(speed);
    }
    
    moveOut(speed)
    {
        this.z -= zCalc.speed(speed);
    }
}