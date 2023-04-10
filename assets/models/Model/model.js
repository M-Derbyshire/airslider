import Kernel from '/Kernel/kernel';
import ModelAnimationsManager from './ModelAnimationsManager/ModelAnimationsManager';

/**
 * An object in the game (such as a character, monster, power-up, etc)
 */
export default class Model {
    
    /**
     * Constructor
     */
    constructor(){
        
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        this.animationManager = new ModelAnimationsManager(this);
        
        this.assetsToUnload = []; // file paths of assets that need to be released when this is unloaded
        
        this.drawBoundaryBoxes = false; // If we set this to true, we'll draw the boxes from this.getBoundaryBoxes()
        
        /**
         * Details for displaying an entity's text content
         */
        this.text = {
            content: "",
            x: 0, // relative to model x
            y: 0, // relative to model y
            size: 30, // in pixels
            font: "Arial",
            color: "red",
            style: "bolder", // See the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
        };
        
        this._state; //string with the current state of the model
        this._active; //is this active
        this._display = true; //should this be drawn
        
        this._x;
        this._y;
        this._z;
        this._xSpeed;
        this._ySpeed;
        this._zSpeed;
        
        this._loadedIndex; //will hold current index in this.kernel.loadedModels
    }
    
    //getters and setters --------------------------------------
    
    /**
     * The current width of the model
     */
    get width() {return this.animationManager.animations[this._state].width;}
    
    /**
     * The current height of the model
     */
    get height() {return this.animationManager.animations[this._state].height;}
    
    /**
     * Is the model currently active?
     */
    get active() {return this._active;}
    set active(newVal) {this._active = newVal;}
    
    /**
     * Should this model be displayed?
     */
    get display() {return this._display;}
    set display(newVal) {this._display = newVal;}
    
    /**
     * The x position of the model (in units)
     */
    get x() {return this._x;}
    set x(x) {this._x = x;}
    
    /**
     * The y position of the model (in units)
     */
    get y() {return this._y;}
    set y(y) {this._y = y;}
    
    /**
     * The z position of the model
     */
    get z() {return this._z;}
    set z(z) {this._z = z;}
    
    /**
     * The speed of the model, on the x axis
     */
    get xSpeed() {return this._xSpeed;}
    set xSpeed(speed) {this._xSpeed = speed;}
    
    /**
     * The speed of the model, on the y axis
     */
    get ySpeed() {return this._ySpeed;}
    set ySpeed(speed) {this._ySpeed = speed;}
    
    /**
     * The speed of the model, on the z axis
     */
    get zSpeed() {return this._zSpeed;}
    set zSpeed(speed) {this._zSpeed = speed;}
    
    /**
     * The index of this model in the Kernel's array of models
     */
    get loadedIndex() {return this._loadedIndex;}
    set loadedIndex(newVal) {this._loadedIndex = newVal;}
    
    /**
     * The current state of the model (the name of the state is the same as the name of the animation that should be drawn)
     */
    get state() {return this._state;}
    set state(state)
    {
        this._x += this.animationManager.animations[state].xOffset;
        this._y += this.animationManager.animations[state].yOffset;
        this._state = state;
    }
    
    //-----------------------------------------------------------
    
    /**
     * Runs the model's actions. This is ran on every frame.
     */
    act() {}
    
    /**
     * Loads and sets up the model 
     */
    load() {}
    
    /**
     * Prepares the model, before the gameplay starts
     */
    prepare() {}
    
    /**
     * Unloads any assets used by the model
     */
    unload()
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
    }
    
    /**
     * Loads the model's animation manager
     * @param canvasCtx The 2D canvas context
     * @param camera The game's camera
     */
    loadAnimationsManager(canvasCtx, camera)
    {
        this.animationManager.load(canvasCtx, camera);
    }
    
    /**
     * Draws the model's sprite
     */
    draw()
    {
        this.animationManager.drawNextFrame();
        
        if(this.text.content)
            this.animationManager.drawText();
        
        if(this.drawBoundaryBoxes)
            this.animationManager.drawBoundaryBoxes();
    }
    
    /**
     * Runs any extra events specific to this model. These event checks should be called in the extraEvents method
     */
    checkForExtraEvents()
    {
        if(this.extraEvents)
        {
            this.extraEvents();
        }
    }
    
    /**
    * Is the mouse pointer overlapping this model?
    * @param pointX the x position (within the canvas's space) of the mouse pointer 
    * @param pointY the y position (within the canvas's space) of the mouse pointer
    * @returns true if it is overlapping, false if not
    */
    isPointerOverlapping(pointX, pointY)
	{
		const drawPositions = this.animationManager.getDrawPositionsAndDimensions(this);
		
		return (
			pointX > drawPositions.x && pointX < (drawPositions.x + drawPositions.width) && 
			pointY > drawPositions.y && pointY < (drawPositions.y + drawPositions.height)
		);
	}
    
    /**
     * Creates and returns the current array of boundary boxes for the model.
     * @returns An array of box's that can be used for events (e.g. boxes covering a character, for use by collision events)
     */
    getBoundaryBoxes():IBoundaryBox
    {
        return [
            {
                x: this.x,
                y: this.y,
                z: this.z,
                width: this.width,
                height: this.height
            }
        ];
    }
    
    /**
     * Moves the model to the left
     * @param speed the speed of the movement
     */
    moveLeft(speed)
    {
        this.x -= this.helpers.unit.xSpeed(speed);
    }
    
    /**
     * Moves the model to the right
     * @param speed the speed of the movement
     */
    moveRight(speed)
    {
        this.x += this.helpers.unit.xSpeed(speed);
    }
    
    /**
     * Moves the model up
     * @param speed the speed of the movement
     */
    moveUp(speed)
    {
        this.y -= this.helpers.unit.ySpeed(speed);
    }
    
    /**
     * Moves the model down
     * @param speed the speed of the movement
     */
    moveDown(speed)
    {
        this.y += this.helpers.unit.ySpeed(speed);
    }
    
    /**
     * Moves the model further into the distance
     * @param speed the speed of the movement
     */
    moveIn(speed)
    {
        this.z += this.helpers.zCalc.speed(speed, this.kernel.fps);
    }
    
    /**
     * Moves the model closer to the camera
     * @param speed the speed of the movement
     */
    moveOut(speed)
    {
        this.z -= this.helpers.zCalc.speed(speed, this.kernel.fps);
    }
	
}