import Kernel from '../../../Kernel/Kernel';
import IModel from './IModel';
import IKernel from '../../../Kernel/IKernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import IModelAnimationsManager from './ModelAnimationsManager/IModelAnimationsManager';
import ITextContent from '../../../engines/GraphicEn/ITextContent';
import IHitBox from './IHitBox';

/**
 * An object in the game (such as a character, monster, power-up, etc)
 */
export default class Model implements IModel {
    protected kernel: IKernel;
    protected helpers: IHelpers;
    protected animationManager: IModelAnimationsManager;
    protected assetsToUnload:string[]; // File paths of assets that need to be released when this is unloaded
    protected drawHitBoxes:boolean; // If we set this to true, we'll draw the boxes from this.getHitBoxes()
    
    private _state:string; // The current "state" of the model. This is also the name of the animation to use when drawing
    private _active:boolean; // Is this model currently active?
    private _display:boolean; // Should this model be displayed?
    
    private _x:number; // The x position (in units) of the model
    private _y:number; // The y position (in units) of the model
    private _z:number; // The z position (in units) of the model
    private _xSpeed:number; // The speed of the model, on the x axis
    private _ySpeed:number; // The speed of the model, on the y axis
    private _zSpeed:number; // The speed of the model, on the z axis
    
    private _loadedIndex:number; // The index of this model in the Kernel's array of models
    
    /**
     * Details for displaying an entity's text content
     */
    text:ITextContent;
    
    constructor()
    {    
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.assetsToUnload = [];
    }
    
    /**
     * The current width of the model
     */
    get width() 
    {
        return this.animationManager.animations[this._state].width;
    }
    
    /**
     * The current height of the model
     */
    get height() 
    {
        return this.animationManager.animations[this._state].height;
    }
    
    /**
     * Is the model currently active?
     */
    get active() 
    {
        return this._active;
    }
    set active(newValue)
    {
        this._active = newValue;
    }
    
    /**
     * Should this model be displayed?
     */
    get display()
    {
        return this._display;
    }
    set display(newValue)
    {
        this._display = newValue;
    }
    
    /**
     * The x position of the model (in units)
     */
    get x()
    {
        return this._x;
    }
    set x(newValue)
    {
        this._x = newValue;
    }
    
    /**
     * The y position of the model (in units)
     */
    get y()
    {
        return this._y;
    }
    set y(newValue)
    {
        this._y = newValue;
    }
    
    /**
     * The z position of the model
     */
    get z()
    {
        return this._z;
    }
    set z(newValue)
    {
        this._z = newValue;
    }
    
    /**
     * The speed of the model, on the x axis
     */
    get xSpeed()
    {
        return this._xSpeed;
    }
    set xSpeed(newValue)
    {
        this._xSpeed = newValue;
    }
    
    /**
     * The speed of the model, on the y axis
     */
    get ySpeed()
    {
        return this._ySpeed;
    }
    set ySpeed(newValue)
    {
        this._ySpeed = newValue;
    }
    
    /**
     * The speed of the model, on the z axis
     */
    get zSpeed()
    {
        return this._zSpeed;
    }
    set zSpeed(newValue)
    {
        this._zSpeed = newValue;
    }
    
    /**
     * The index of this model in the Kernel's array of models
     */
    get loadedIndex()
    {
        return this._loadedIndex;
    }
    set loadedIndex(newValue)
    {
        this._loadedIndex = newValue;
    }
    
    /**
     * The current state of the model (the name of the state is the same as the name of the animation that should be drawn)
     */
    get state() 
    {
        return this._state;
    }
    set state(newValue)
    {
        if(this.animationManager?.animations && this.animationManager.animations[newValue])
        {
            this._x += this.animationManager.animations[newValue].xOffset;
            this._y += this.animationManager.animations[newValue].yOffset;
        }
        
        this._state = newValue;
    }
    
    /**
     * Runs the model's actions. This is ran on every frame.
     */
    act():void {}
    
    /**
     * Loads everything for the model 
     * @param animationManager The animation manager for the model
     */
    load(animationManager:IModelAnimationsManager):void 
    {
        this.animationManager = animationManager;
    }
    
    /**
     * Prepares the model, before the gameplay of the level starts
     */
    prepare():void
    {
        this._display = true;
        this.drawHitBoxes = false;
        
        this.text = {
            content: "",
            x: 0, // relative to the model's x position
            y: 0, // relative to the model's y position
            size: 30, // in pixels
            font: "Arial",
            color: "red",
            style: "bolder", // See the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
        };
    }
    
    /**
     * Unloads any assets used by the model
     */
    unload():void
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
    }
    
    /**
     * Draws the model
     */
    draw():void
    {
        this.animationManager.drawNextFrame();
        
        if(this.text.content)
            this.animationManager.drawText();
        
        if(this.drawHitBoxes)
            this.animationManager.drawHitBoxes();
    }
    
    /**
     * Runs any extra event checks specific to this model. These checks should be ran by the extraEvents() method
     */
    checkForExtraEvents():void
    {
        this.extraEvents();
    }
    
    /**
     * Any extra event checks specific to this model
     */
    protected extraEvents():void {}
    
    /**
    * Determines if the mouse pointer is overlapping this model.
    * @param pointX the x position (within the canvas's space) of the mouse pointer 
    * @param pointY the y position (within the canvas's space) of the mouse pointer
    * @returns true if it is overlapping, false if not
    */
    isPointerOverlapping(pointX:number, pointY:number):boolean
	{
		const drawPositions = this.animationManager.getDrawPositionsAndDimensions(this);
		
		return (
			pointX > drawPositions.x && pointX < (drawPositions.x + drawPositions.width) && 
			pointY > drawPositions.y && pointY < (drawPositions.y + drawPositions.height)
		);
	}
    
    /**
     * Creates and returns the current array of hit boxes for the model.
     * @returns An array of box's that can be used for events (e.g. boxes covering a character, for use by collision events)
     */
    getHitBoxes():IHitBox[]
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
    moveLeft(speed:number):void
    {
        this.x -= this.helpers.unit.xSpeed(speed);
    }
    
    /**
     * Moves the model to the right
     * @param speed the speed of the movement
     */
    moveRight(speed:number):void
    {
        this.x += this.helpers.unit.xSpeed(speed);
    }
    
    /**
     * Moves the model up
     * @param speed the speed of the movement
     */
    moveUp(speed:number):void
    {
        this.y -= this.helpers.unit.ySpeed(speed);
    }
    
    /**
     * Moves the model down
     * @param speed the speed of the movement
     */
    moveDown(speed:number):void
    {
        this.y += this.helpers.unit.ySpeed(speed);
    }
    
    /**
     * Moves the model further into the distance
     * @param speed the speed of the movement
     */
    moveIn(speed:number):void
    {
        this.z += this.helpers.zCalc.speed(speed, this.kernel.fps);
    }
    
    /**
     * Moves the model closer to the camera
     * @param speed the speed of the movement
     */
    moveOut(speed:number):void
    {
        this.z -= this.helpers.zCalc.speed(speed, this.kernel.fps);
    }
}