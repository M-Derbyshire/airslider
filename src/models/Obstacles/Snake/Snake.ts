import Kernel from '../../../../Kernel/Kernel';
import { IHitBox } from '../../../../Kernel/entities/Model/IModel';
import IModelAnimationsManager, { IFrameCoordinates } from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Obstacle from '../../Obstacle/Obstacle';

export default class Snake extends Obstacle
{
    /**
     * Constructor
     */
    constructor()
    {
        super("static", 0, 0, null);
        
        this.damageDealt = 2;
        this.state = "slither";
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const spritesheetPath = "/models/Obstacles/Snake/anim/snake-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        this.spritesheet = assetHandler.loadImage(spritesheetPath);
        
        const coordinateWidth = 200;
        const coordinateHeight = 476;
        const drawWidth = 200;
        const drawHeight = 550;
        
        const slitherFrameCoordinates:IFrameCoordinates[] = [
            {
                x: 0,
                y: 0,
                width: coordinateWidth,
                height: coordinateHeight
            },
            {
                x: 0,
                y: 477,
                width: coordinateWidth,
                height: coordinateHeight
            },
            {
                x: 0,
                y: 955,
                width: coordinateWidth,
                height: coordinateHeight
            },
            {
                x: 0,
                y: 477,
                width: coordinateWidth,
                height: coordinateHeight
            },
        ];
        
        const deadFrameCoordinates:IFrameCoordinates[] = [
            {
                x: 0,
                y: 1436,
                width: coordinateWidth,
                height: coordinateHeight
            }
        ];
        
        this.animationManager.registerAnimations({
            slither: this.animationManager.createAnimation({
                spritesheet: this.spritesheet,
                frameCoordinates: slitherFrameCoordinates,
                fps: 24,
                drawWidth,
                drawHeight
            }),
            dead: this.animationManager.createAnimation({
                spritesheet: this.spritesheet,
                frameCoordinates: deadFrameCoordinates,
                fps: 1,
                drawWidth,
                drawHeight
            })
        });
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/standard.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    prepare(): void {
        super.prepare();
        
        this.setYPositionFromBottom(this.height / 4);
    }
    
    act():void
    {
        super.act();
        
        // When the player-collision status is reset to false, the model's state should also be reset
        if(this.hasCollidedWithPlayer)
            this.state = "dead";
        else
            this.state = "slither";
    }
    
    getHitBoxes(): IHitBox[] {
        if(this.hasCollidedWithPlayer)
            return [];
        
        return [
            {
                x: this.x,
                y: this.y,
                z: this.z,
                width: this.width,
                height: this.height / 2
            }
        ];
    }
}