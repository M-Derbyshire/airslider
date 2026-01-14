import Kernel from '../../../../Kernel/Kernel';
import IModelAnimationsManager, { IFrameCoordinates } from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Obstacle, { obstacleModes } from '../../Obstacle/Obstacle';
import Tarian from '../../Tarian/Tarian';

export default class Skeleton extends Obstacle
{
    /**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     * @param mode The obstacle's mode
     * @param speedX The X-axis speed of the obstacle. This needs to be quite high (1000-2000+) for sweeping
     * @param homingZStart At what Z-axis position should the homing movement begin (in "home" mode)?
     * @param playerModel The player model. This can be null, as it is only needed for "home" mode
     */
    constructor(
        modelAnimationsManager:IModelAnimationsManager,
        mode:obstacleModes,
        speedX:number,
        homingZStart:number,
        playerModel:Tarian|null = null
    )
    {
        super(modelAnimationsManager, mode, homingZStart, speedX, playerModel);
        
        this.damageDealt = 2;
        this.state = "moving";
        this.speedModifier = 3;
        
        this.maxBounceSpeed = 120;
        this.bounceDeceleration = 250;
    }
    
    load():void
    {
        super.load();
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const spritesheetPath = "/models/Obstacles/Skeleton/anim/skeleton-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        this.spritesheet = assetHandler.loadImage(spritesheetPath);
        
        const coordinateWidth = 200;
        const coordinateHeight = 451;
        const drawWidth = 100;
        const drawHeight = 225;
        
        this.animationManager.registerAnimations({
            broken: this.animationManager.createAnimation({
                spritesheet: this.spritesheet,
                frameCoordinates: [
                    {
                        x: 0,
                        y: coordinateHeight * 4,
                        width: coordinateWidth,
                        height: coordinateHeight
                    }
                ],
                fps: 1,
                drawWidth,
                drawHeight
            }),
            moving: this.animationManager.createAnimation({
                spritesheet: this.spritesheet,
                frameCoordinates: this._getMovingAnimationFrameCoordinates(coordinateWidth, coordinateHeight),
                fps: 12,
                drawWidth,
                drawHeight
            })
        });
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/standard.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    act():void
    {
        super.act();
        
        // When the player-collision status is reset to false, the model's state should also be reset
        if(this.hasCollidedWithPlayer)
            this.state = "broken";
        else
            this.state = "moving";
    }
    
    /**
     * Generates the frame coordinates for the moving animation
     * @param width the width of the skeleton, on the spritesheet
     * @param height the height of the skeleton, on the spritesheet
     * @returns an array of frame coordinates, to be used for the moving animation
     */
    private _getMovingAnimationFrameCoordinates(width:number, height:number):IFrameCoordinates[]
    {
        // The animation has the skull opening its jaw.
        // After that, we want to reverse those frames to get it closing again.
        
        const jawOpeningFrameCoordinates:IFrameCoordinates[] = [];
        const firstFrameIndex = 0;
        const jawOpeningFrameCount = 4;
        
        for(let i = firstFrameIndex; i < jawOpeningFrameCount; i++) {
            const frameY = height * i;
            
            jawOpeningFrameCoordinates.push({
                x: 0,
                y: frameY,
                width: width,
                height: height
            });
        }
        
        const jawClosingFrameCoordinates = [...jawOpeningFrameCoordinates].reverse();
        
        return [
            ...jawOpeningFrameCoordinates,
            ...jawClosingFrameCoordinates
        ];
    }
}