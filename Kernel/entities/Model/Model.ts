import IModel, { IHitBox } from './IModel';
import IModelAnimationsManager from './ModelAnimationsManager/IModelAnimationsManager';
import IGraphicEngine, { IDrawDimensions, IDrawPositions, ITextContent } from '../../engines/GraphicEngine/IGraphicEngine';
import UnitHelper from '../../utils/UnitHelper';
import { IEntitySound } from '../types';
import IAssetHandler from '../../AssetHandler/IAssetHandler';
import ISoundEngine from '../../engines/SoundEngine/ISoundEngine';

/**
 * An object in the game (such as a character, monster, power-up, etc)
 */
export default class Model implements IModel
{
    protected animationManager:IModelAnimationsManager;
    protected assetsToUnload:string[]; // File paths of assets that need to be released when this is unloaded
    protected sounds:IEntitySound[]; // Sounds that need to be added to the sound engine, during preparation
    protected hitBoxDrawColor?:string; // If this is set to a color string, we'll draw the boxes from this.getHitBoxes() with that color
    
    private _state:string; // The current "state" of the model. This is also the name of the animation to use when drawing
    
    /**
     * Details for displaying an entity's text content
     */
    text!:ITextContent;
    
    /**
     * Is the model currently active?
     */
    active:boolean;
    
    /**
     * Should this model be displayed?
     */
    display:boolean;
    
    /**
     * The current width of the model
     */
    get width() 
    {
        return this.animationManager.animations[this._state]?.width;
    }
    
    /**
     * The current height of the model
     */
    get height() 
    {
        return this.animationManager.animations[this._state]?.height;
    }
    
    /**
     * The x position of the model (in units)
     */
    x:number;
    
    /**
     * The y position of the model (in units)
     */
    y:number;
    
    /**
     * The z position of the model
     */
    z:number
    
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
    xSpeed:number
    
    /**
     * The speed of the model, on the y axis
     */
    ySpeed:number
    
    /**
     * The speed of the model, on the z axis
     */
    zSpeed:number;
    
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
            this.x += this.animationManager.animations[newValue].xOffset;
            this.y += this.animationManager.animations[newValue].yOffset;
        }
        
        this._state = newValue;
    }
    
    /**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     */
    constructor(modelAnimationsManager:IModelAnimationsManager)
    {
        this.animationManager = modelAnimationsManager;
        
        this.assetsToUnload = [];
        this.sounds = [];
        
        this._state = "";
        
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.zSpeed = 0;
        
        this.display = true;
        this.active = false;
    }
    
    /**
     * Runs the model's actions. This is ran on every frame.
     */
    act():void {}
    
    /**
     * Loads the assets for the model
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void {}
    
    /**
     * Registers the animations for the model
     */
    registerAnimations():void {}
    
    /**
     * Registers the sounds used by the model (these should be added to the sounds array during loading)
     * @param soundEngine the sound engine for the level 
     */
    registerSounds(soundEngine:ISoundEngine):void
    {
        this.sounds.forEach(sound => soundEngine.addSound(sound.key, sound.asset));
    }
    
    /**
     * Prepares the model, before the gameplay of the level starts
     */
    prepare():void
    {
        this.animationManager.clearAllAnimations();
        this.registerAnimations();
        
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
    }
    
    /**
     * Unloads any assets used by the model
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    unload(assetHandler:IAssetHandler):void
    {
        this.assetsToUnload.forEach(asset => assetHandler.releaseAsset(asset));
    }
    
    /**
     * Calculates and stores the positions/dimensions to use when drawing the model (these can be accessed via the
     * calculatedDrawPositions and calculatedDrawDimensions properties)
     * @param graphicEngine the graphic engine used by the level
     */
    precalculateDrawPositionsAndDimensions(graphicEngine:IGraphicEngine):void
    {
        this.animationManager.precalculateDrawPositionsAndDimensions(this, graphicEngine);
    }
    
    /**
     * Draws the model's sprite, using the precalculated pixel positions/dimensions
     * @param graphicEngine the graphic engine used by the level
     * @param canvasContext the 2D context from the HTML canvas element
     * @param currentFps the current FPS of the game
     */
    draw(
        graphicEngine:IGraphicEngine,
        canvasContext:CanvasRenderingContext2D,
        currentFps:number
    ):void
    {
        this.animationManager.drawNextFrame(this.state, canvasContext, currentFps);
        
        if(this.text.content)
            this.animationManager.drawText(this.text, this, graphicEngine);
        
        if(this.hitBoxDrawColor)
            this.animationManager.drawHitBoxes(this.hitBoxDrawColor, this.getHitBoxes(), graphicEngine, canvasContext);
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
    protected moveLeft(speed = this.xSpeed):void
    {
        this.x -= UnitHelper.consistentSpeed(speed);
    }
    
    /**
     * Moves the model to the right
     * @param speed the speed of the movement
     */
    protected moveRight(speed = this.xSpeed):void
    {
        this.x += UnitHelper.consistentSpeed(speed);
    }
    
    /**
     * Moves the model up
     * @param speed the speed of the movement
     */
    protected moveUp(speed = this.ySpeed):void
    {
        this.y -= UnitHelper.consistentSpeed(speed);
    }
    
    /**
     * Moves the model down
     * @param speed the speed of the movement
     */
    protected moveDown(speed = this.ySpeed):void
    {
        this.y += UnitHelper.consistentSpeed(speed);
    }
    
    /**
     * Moves the model further into the distance
     * @param speed the speed of the movement
     */
    protected moveIn(speed = this.zSpeed):void
    {
        this.z += UnitHelper.consistentSpeed(speed);
    }
    
    /**
     * Moves the model closer to the camera
     * @param speed the speed of the movement
     */
    protected moveOut(speed = this.zSpeed):void
    {
        this.z -= UnitHelper.consistentSpeed(speed);
    }
}