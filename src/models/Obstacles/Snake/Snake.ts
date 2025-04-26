import Kernel from '../../../../Kernel/Kernel';
import IFrameCoordinates from '../../../../Kernel/entities/Model/ModelAnimationsManager/IFrameCoordinates';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
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
        
        const coordinateWidth = 100;
        const coordinateHeight = 238;
        const drawWidth = 100;
        const drawHeight = 238;
        
        const slitherFrameCoordinates:IFrameCoordinates[] = [
            {
                x: 0,
                y: 0,
                width: coordinateWidth,
                height: coordinateHeight
            },
            {
                x: 0,
                y: 239,
                width: coordinateWidth,
                height: coordinateHeight
            },
            {
                x: 0,
                y: 478,
                width: coordinateWidth,
                height: coordinateHeight
            },
            {
                x: 0,
                y: 239,
                width: coordinateWidth,
                height: coordinateHeight
            },
        ];
        
        const deadFrameCoordinates:IFrameCoordinates[] = [
            {
                x: 0,
                y: 717,
                width: coordinateWidth,
                height: coordinateHeight
            }
        ];
        
        this.animationManager.registerAnimations({
            slither: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                frameCoordinates: slitherFrameCoordinates,
                fps: 24,
                drawWidth,
                drawHeight
            }),
            dead: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                frameCoordinates: deadFrameCoordinates,
                fps: 1,
                drawWidth,
                drawHeight
            })
        });
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/none.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    prepare(): void {
        super.prepare();
        
        this.setYPositionFromBottom(this.height / 2);
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
}