import Kernel from '../../../../Kernel/Kernel';
import IModelAnimationsManager, { IFrameCoordinates } from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Obstacle from '../../Obstacle/Obstacle';

export default class RockBall extends Obstacle
{
    /**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     * @param mode The obstacle's mode
     * @param speedX The x speed of the obstacle. This needs to be quite high (1000-2000+) for sweeping
     */
    constructor(modelAnimationsManager:IModelAnimationsManager, mode:"static"|"sweep", speedX:number)
    {
        super(modelAnimationsManager, mode, 0, speedX, null);
        
        this.damageDealt = 2;
        this.state = "spin";
        this.speedModifier = 3;
        
        this.maxBounceSpeed = 240;
        this.bounceDeceleration = 500;
    }
    
    load():void
    {
        super.load();
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const spritesheetPath = "/models/Obstacles/RockBall/anim/rockball-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        this.spritesheet = assetHandler.loadImage(spritesheetPath);
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/fire.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    registerAnimations():void
    {
        super.registerAnimations();
        
        const coordinateDiameter = 300;
        const drawDiameter = 100;
        
        const brokenFrameCoordinates:IFrameCoordinates[] = [
            {
                x: 0,
                y: 0,
                width: coordinateDiameter,
                height: coordinateDiameter
            }
        ];
        
        this.animationManager.registerAnimations({
            broken: this.animationManager.createAnimation({
                spritesheet: this.spritesheet,
                frameCoordinates: brokenFrameCoordinates,
                fps: 1,
                drawWidth: drawDiameter,
                drawHeight: drawDiameter
            }),
            spin: this.animationManager.createAnimation({
                spritesheet: this.spritesheet,
                frameCoordinates: this._getSpinAnimationFrameCoordinates(coordinateDiameter),
                fps: 15,
                drawWidth: drawDiameter,
                drawHeight: drawDiameter
            })
        });
    }
    
    act():void
    {
        super.act();
        
        // When the player-collision status is reset to false, the model's state should also be reset
        if(this.hasCollidedWithPlayer)
            this.state = "broken";
        else
            this.state = "spin";
    }
    
    /**
     * Generates the frame coordinates for the spin animation
     * @param diameter the diameter of the rock ball, on the spritesheet
     * @returns an array of frame coordinates, to be used for the spin animation
     */
    private _getSpinAnimationFrameCoordinates(diameter:number):IFrameCoordinates[]
    {
        const spinFrameCoordinates:IFrameCoordinates[] = [];
        const spinFrameFirstIndex = 1;
        const spinFrameCount = 27;
        
        for(let i = spinFrameFirstIndex; i <= spinFrameCount; i++) {
            const frameY = diameter * i;
            
            spinFrameCoordinates.push({
                x: 0,
                y: frameY,
                width: diameter,
                height: diameter
            });
        }
        
        return spinFrameCoordinates;
    }
}