import ASModel from '../ASModel/ASModel';
import IModelAnimationsManager from '../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import { RacerColor } from './RacerColor';

/**
 * A racer on the track
 */
export default class Racer extends ASModel
{
    private _color:RacerColor;
    
    private _initialZ:number; // The z position of this model at the start of the level
    private _initialXCenter:number; // The x position (centered) of this model at the start of the level
    
    /**
     * Constructor
     * 
     * @param zPosition The initial z position of the model
     * @param xCenterPosition The x position that the model should be initially centered at
     */
    constructor(color:RacerColor, zPosition:number, xCenterPosition:number)
	{
		super();
        
        this._color = color;
        this._initialXCenter = xCenterPosition;
        this._initialZ = zPosition;
	}
    
    /**
     * Loads everything for the model 
     * @param animationManager The animation manager for the model
     */
    load(animationManager:IModelAnimationsManager):void 
    {
        super.load(animationManager);
        
        const spritesheetPath = "/models/Racer/anim/racers-spritesheet.png";
        
        // All the frames share the same width/height.
        const frameWidth = 92;
        const frameHeight = 119;
        
        // There are 3 versions of the same animation (different colours) on the spritesheet.
        
        const colorXPositions = { // These are the same for every frame of each version
            [RacerColor.Blue]: 0,
            [RacerColor.Red]: 92,
            [RacerColor.Yellow]: 184
        };
        const xPosition = colorXPositions[this._color];
        
        const frameYPositions = [1, 120, 242, 364]; // These are the same for every color
        
        this.animationManager.registerAnimations({
            forward: this.animationManager.createAnimation({
                sheetPath: spritesheetPath, 
                fps: 24,
                drawWidth: 120,
                drawHeight: 170,
				frameCoordinates: [
					{ x: xPosition, y: frameYPositions[0], width: frameWidth, height: frameHeight },
					{ x: xPosition, y: frameYPositions[1], width: frameWidth, height: frameHeight },
					{ x: xPosition, y: frameYPositions[2], width: frameWidth, height: frameHeight },
					{ x: xPosition, y: frameYPositions[3], width: frameWidth, height: frameHeight }
				]
            })
        });
    }
    
    /**
     * Prepares the model, before the gameplay of the level starts
     */
    prepare():void
    {
        super.prepare();
        
        this.active = true;
        this.state = "forward";
        
        this.zSpeed = 0;
        
        this.z = this._initialZ;
        this.x = this._initialXCenter - (this.width / 2);
        this.setYPositionFromBottom(this.height);
    }
    
    /**
     * Runs the model's actions. This is ran on every frame.
     */
    act():void
    {
        super.act();
        
        this.moveIn(this.zSpeed);
    }
};