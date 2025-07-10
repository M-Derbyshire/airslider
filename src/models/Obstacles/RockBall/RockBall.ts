import Kernel from '../../../../Kernel/Kernel';
import IFrameCoordinates from '../../../../Kernel/entities/Model/ModelAnimationsManager/IFrameCoordinates';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import UnitHelper from '../../../../Kernel/utils/UnitHelper';
import Obstacle from '../../Obstacle/Obstacle';

export default class RockBall extends Obstacle
{
    protected maxBounceSpeed:number; // Sets the maximum upward speed for the ball's bounce
    protected bounceDeceleration:number; // Controls how quickly the bounce of the ball decelerates
    protected lowestBouncePosition:number; // The closest the ball can be to the ground when bouncing
    
    /**
     * Constructor
     */
    constructor()
    {
        super("static", 0, 0, null);
        
        this.damageDealt = 2;
        this.state = "spin";
        
        this.maxBounceSpeed = 480;
        this.bounceDeceleration = 500;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const spritesheetPath = "/models/Obstacles/RockBall/anim/rockball-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
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
                sheetPath: spritesheetPath,
                frameCoordinates: brokenFrameCoordinates,
                fps: 1,
                drawWidth: drawDiameter,
                drawHeight: drawDiameter
            }),
            spin: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                frameCoordinates: this._getSpinAnimationFrameCoordinates(coordinateDiameter),
                fps: 15,
                drawWidth: drawDiameter,
                drawHeight: drawDiameter
            })
        });
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/fire.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    prepare(): void {
        super.prepare();
        
        this.lowestBouncePosition = Kernel.getInstance().settings.unitsWithinCameraY;
        this.y = this.lowestBouncePosition - this.height;
        this.ySpeed = this.maxBounceSpeed;
    }
    
    act():void
    {
        super.act();
        
        // When the player-collision status is reset to false, the model's state should also be reset
        if(this.hasCollidedWithPlayer) {
            this.state = "broken";
        } else {
            this.state = "spin";
            this._bounceBall();
        }
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
    
    /**
     * Creates the bouncing effect for the ball
     */
    private _bounceBall():void
    {
        const maxValidYPos = this.lowestBouncePosition - this.height;
        if(this.y >= maxValidYPos) {
            this.y = maxValidYPos;
            this.ySpeed = this.maxBounceSpeed;
        }
        
        this.moveUp();
        
        // When the ySpeed goes negative, the ball will start to come back down
        const realBounceDeceleration = UnitHelper.speed(this.bounceDeceleration);
        this.ySpeed -= realBounceDeceleration;
    }
}