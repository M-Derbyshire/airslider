import Kernel from '../../../../Kernel/Kernel';
import IModelAnimationsManager, { IFrameCoordinates } from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Obstacle, { obstacleModes } from '../../Obstacle/Obstacle';
import Tarian from '../../Tarian/Tarian';

export default class Jellyfish extends Obstacle
{
    /**
     * Constructor
     * @param mode The obstacle's mode
     * @param speedX The X-axis speed of the obstacle. This needs to be quite high (1000-2000+) for sweeping
     * @param homingZStart At what Z-axis position should the homing movement begin (in "home" mode)?
     * @param playerModel The player model. This can be null, as it is only needed for "home" mode
     */
    constructor(mode:obstacleModes, speedX:number, homingZStart:number, playerModel:Tarian|null = null)
    {
        super(mode, homingZStart, speedX, playerModel);
        
        this.damageDealt = 2;
        this.state = "moving";
        this.speedModifier = 3;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const spritesheetPath = "/models/Obstacles/Jellyfish/anim/spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        const coordinateWidth = 332;
        const coordinateHeight = 481;
        const drawWidth = 100;
        const drawHeight = 225;
        
        this.animationManager.registerAnimations({
            splatter: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
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
                sheetPath: spritesheetPath,
                frameCoordinates: this._getMovingAnimationFrameCoordinates(coordinateWidth, coordinateHeight),
                fps: 30,
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
            this.state = "splatter";
        else
            this.state = "moving";
    }
    
    /**
     * Generates the frame coordinates for the moving animation
     * @param width the width of the obstacle, on the spritesheet
     * @param height the height of the obstacle, on the spritesheet
     * @returns an array of frame coordinates, to be used for the moving animation
     */
    private _getMovingAnimationFrameCoordinates(width:number, height:number):IFrameCoordinates[]
    {
        // We want the animation to go forwards through the frames, but
        // then we want to play the same frames again in reverse
        
        const animFrameCoordinates:IFrameCoordinates[] = [];
        const firstFrameIndex = 0;
        const animFrameCount = 4;
        
        for(let i = firstFrameIndex; i < animFrameCount; i++) {
            const frameY = height * i;
            
            animFrameCoordinates.push({
                x: 0,
                y: frameY,
                width: width,
                height: height
            });
        }
        
        const reverseAnimFrameCoordinates = [...animFrameCoordinates].reverse();
        
        return [
            ...animFrameCoordinates,
            ...reverseAnimFrameCoordinates
        ];
    }
}