class Model {
    
    //constructor is run before the engines are initialised (load() is run afterwards)
    constructor(){
        
        //Set kernel in the loadSuper() method, as it gets used in the inidivual model's load(),
        //and loadSuper() is run first. Due to the way ES6 JS works, you cannot set this in this
        //constructor, as you cannot pass an argument to a subclass constructor on to its parent. 
        this.kernel;
        
        this._state; //string with the current state of the model
        this._active; //is this active
        this._display = true; //should this be drawn
        this.animationManager; //Set this in loadSuper(), as requires the model's kernel reference
        
        this._x;
        this._y;
        this._z;
        this._xSpeed;
        this._ySpeed;
        this._zSpeed;
        
        this.events = []; //will hold array of events objects
        this._loadedIndex; //will hold current index in this.kernel.loadedModels
        
        this.damageDealt = 0;
    }
    
    //getters and setters --------------------------------------
    
    get width() {return this.animationManager.animations[this._state].width;}
    get height() {return this.animationManager.animations[this._state].height;}
    
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
        this._x += this.animationManager.animations[state].xOffset;
        this._y += this.animationManager.animations[state].yOffset;
        this._state = state;
    }
    
    //-----------------------------------------------------------
    
    //meant to be overridden
    load() {}
    levelStopped() {}
    act() {}
    
    loadSuper()
    {
        this.kernel = kernel;
        this.animationManager = new ModelAnimationsManager(this);
    }
    
    //takes models array related to event, and action (which is a function) 
    registerEvent(relatedModels, action)
    {
        this.events.push({
            models: this.kernel.loadedModels.filter((model, index) => {
                if(relatedModels.includes(model.constructor.name) && index != this.loadedIndex)
                {
                    return true;
                }
            }),
            check: action
        });
    }
    
    draw()
    {
        this.animationManager.drawNextFrame();
    }
    
    checkEvents()
    {
        this.events.forEach((event) => {
            for(let i = 0; i < event.models.length; i++)
            {
                event.check(this.kernel.loadedModels[this.loadedIndex], event.models[i], this.kernel);
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
        this.z += zCalc.speed(speed, this.kernel.fps);
    }
    
    moveOut(speed)
    {
        this.z -= zCalc.speed(speed, this.kernel.fps);
    }
}