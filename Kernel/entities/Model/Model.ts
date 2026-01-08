import IModel, { IHitBox } from './IModel';
import IModelAnimationsManager from './ModelAnimationsManager/IModelAnimationsManager';
import Kernel from '../../Kernel';
import { IDrawDimensions, IDrawPositions, ITextContent } from '../../engines/GraphicEngine/IGraphicEngine';
import UnitHelper from '../../utils/UnitHelper';
import { IEntitySound } from '../types';

/**
 * An object in the game (such as a character, monster, power-up, etc)
 */
export default class Model implements IModel
{
    protected animationManager:IModelAnimationsManager;
    protected assetsToUnload:string[]; // File paths of assets that need to be released when this is unloaded
    protected sounds:IEntitySound[]; // Sounds that need to be added to the sound engine, during preparation
    protected hitBoxDrawColor:string; // If this is set to a color string, we'll draw the boxes from this.getHitBoxes() with that color
    
    private _state:string; // The current "state" of the model. This is also the name of the animation to use when drawing
    
    private _x:number; // The x position (in units) of the model
    private _y:number; // The y position (in units) of the model
    private _z:number; // The z position (in units) of the model
    private _xSpeed:number; // The speed of the model, on the x axis
    private _ySpeed:number; // The speed of the model, on the y axis
    private _zSpeed:number; // The speed of the model, on the z axis
    
    /**
     * Details for displaying an entity's text content
     */
    text:ITextContent;
    
    /**
     * Is the model currently active?
     */
    active:boolean;
    
    /**
     * Should this model be displayed?
     */
    display:boolean;
    
    /**
     * The index of this model in the Kernel's array of models
     */
    loadedIndex:number;
    
    /**
     * The current width of the model
     */
    get width() 
    {
        return this.animationManager.animations[this._state]?.width ?? 0;
    }
    
    /**
     * The current height of the model
     */
    get height() 
    {
        return this.animationManager.animations[this._state]?.height ?? 0;
    }
    
    /**
     * The x position of the model (in units)
     */
    get x()
    {
        return this._x ?? 0;
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
        return this._y ?? 0;
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
        return this._z ?? 0;
    }
    set z(newValue)
    {
        this._z = newValue;
    }
    
    /**
     * The calculated X/Y pixel values to be used when drawing the model
     */
    get calculatedDrawPositions():IDrawPositions
    {
        return this.animationManager.calculatedDrawPositions;
    }
    
    /**
     * The calculated width/height pixel values to be used when drawing the model
     */
    get calculatedDrawDimensions():IDrawDimensions
    {
        return this.animationManager.calculatedDrawDimensions;
    }
    
    /**
     * The speed of the model, on the x axis
     */
    get xSpeed()
    {
        return this._xSpeed ?? 0;
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
        return this._ySpeed ?? 0;
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
        return this._zSpeed ?? 0;
    }
    set zSpeed(newValue)
    {
        this._zSpeed = newValue;
    }
    
    /**
     * The current state of the model (the name of the state is the same as the name of the animation that should be drawn)
     */
    get state() 
    {
        return this._state ?? "";
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
    
    constructor()
    {
        this.assetsToUnload = [];
        this.sounds = [];
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
        const soundEngine = Kernel.getInstance().soundEngine;
        
        this.display = true;
        this.active = false;
        
        this.text = {
            content: "",
            x: 0, // relative to the model's x position
            y: 0, // relative to the model's y position
            size: 30, // in pixels
            font: "Arial",
            color: "red",
            style: "bolder", // See the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
            alignment: "left",
            lineGap: 0
        };
        
        this.sounds.forEach(sound => soundEngine.addSound(sound.key, sound.asset));
    }
    
    /**
     * Unloads any assets used by the model
     */
    unload():void
    {
        const assetHandler = Kernel.getInstance().assetHandler;
        this.assetsToUnload.forEach(asset => assetHandler.releaseAsset(asset));
    }
    
    /**
     * Calculates and stores the positions/dimensions to use when drawing the model (these can be accessed via the
     * calculatedDrawPositions and calculatedDrawDimensions properties)
     */
    precalculateDrawPositionsAndDimensions():void
    {
        this.animationManager.precalculateDrawPositionsAndDimensions(this);
    }
    
    /**
     * Draws the model's sprite, using the precalculated pixel positions/dimensions
     */
    draw():void
    {
        this.animationManager.drawNextFrame(this.state);
        
        if(this.text.content)
            this.animationManager.drawText(this.text, this);
        
        if(this.hitBoxDrawColor)
            this.animationManager.drawHitBoxes(this.hitBoxDrawColor, this.getHitBoxes());
    }
    
    /**
     * Runs any extra event checks specific to this model
     */
    checkForExtraEvents():void {}
    
    /**
    * Determines if the mouse pointer is overlapping this model.
    * @param pointX the x position (within the canvas's space) of the mouse pointer 
    * @param pointY the y position (within the canvas's space) of the mouse pointer
    * @returns true if it is overlapping, false if not
    */
    isPointerOverlapping(pointX:number, pointY:number):boolean
	{
        // To improve performance, we're using the coordinates from the previous frame
		const { x, y } = this.animationManager.calculatedDrawPositions;
        const { width, height } = this.animationManager.calculatedDrawDimensions;
		
		return (
			pointX > x && pointX < (x + width) && 
			pointY > y && pointY < (y + height)
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
    moveLeft(speed = this.xSpeed):void
    {
        this.x -= UnitHelper.speed(speed);
    }
    
    /**
     * Moves the model to the right
     * @param speed the speed of the movement
     */
    moveRight(speed = this.xSpeed):void
    {
        this.x += UnitHelper.speed(speed);
    }
    
    /**
     * Moves the model up
     * @param speed the speed of the movement
     */
    moveUp(speed = this.ySpeed):void
    {
        this.y -= UnitHelper.speed(speed);
    }
    
    /**
     * Moves the model down
     * @param speed the speed of the movement
     */
    moveDown(speed = this.ySpeed):void
    {
        this.y += UnitHelper.speed(speed);
    }
    
    /**
     * Moves the model further into the distance
     * @param speed the speed of the movement
     */
    moveIn(speed = this.zSpeed):void
    {
        this.z += UnitHelper.speed(speed);
    }
    
    /**
     * Moves the model closer to the camera
     * @param speed the speed of the movement
     */
    moveOut(speed = this.zSpeed):void
    {
        this.z -= UnitHelper.speed(speed);
    }
}