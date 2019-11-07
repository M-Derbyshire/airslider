class Model {
    
    //constructor is run before the engines are initialised (load() is run afterwards)
    constructor(){
        this._state; //string with the current state of the model
        this.anims; //object of all the animations (returned by registerAnim())
        this._active; //is this active
        this._display = true; //should this be drawn
        
        this._x;
        this._y;
        this._z;
        this._xSpeed;
        this._ySpeed;
        this._zSpeed;
        
        this.events = []; //will hold array of events objects
        this._loadedIndex; //will hold current index in kernel.loadedModels
        
        this.damageDealt = 0;
    }
    
    //getters and setters --------------------------------------
    
    get width() {return this.anims[this._state].width;}
    get height() {return this.anims[this._state].height;}
    
    get active() {return this._active;}
    set active(newVal) {this._active = newVal;}
    
    get display() {return this._display;}
    set display(newVal) {this._display = newVal;}
    
    get x() {return this._x;}
    set x(x) {this._x = x;}
    get y() {return this._y;}
    set y(y) {this._y = y;}
    get z() {return this._z;}
    set z(z) {this._z = z;}
    get xSpeed() {return this._xSpeed;}
    set xSpeed(speed) {this._xSpeed = speed;}
    get ySpeed() {return this._ySpeed;}
    set ySpeed(speed) {this._ySpeed = speed;}
    get zSpeed() {return this._zSpeed;}
    set zSpeed(speed) {this._zSpeed = speed;}
    
    get loadedIndex() {return this._loadedIndex;}
    set loadedIndex(newVal) {this._loadedIndex = newVal;}
    
    get state() {return this._state;}
    set state(state)
    {
        this._x += this.anims[state].xOffset;
        this._y += this.anims[state].yOffset;
        this._state = state;
    }
    
    //-----------------------------------------------------------
    
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
        this.anims[this.state].nextCount = Math.floor(kernel.fps / this.anims[this.state].fps);
        
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
                    this.state = this.anims[this._state].nextAnim;
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
            zCalc.width(this.width, this.z), 
            zCalc.height(this.height, this.z)
        );
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
        this.z += zCalc.speed(speed, kernel.fps);
    }
    
    moveOut(speed)
    {
        this.z -= zCalc.speed(speed, kernel.fps);
    }
}