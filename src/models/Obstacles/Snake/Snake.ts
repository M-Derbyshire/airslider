import IAssetHandler from '../../../../Kernel/AssetHandler/IAssetHandler';
import { IHitBox } from '../../../../Kernel/entities/Model/IModel';
import IModelAnimationsManager, { IFrameCoordinates } from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Obstacle from '../../Obstacle/Obstacle';

export default class Snake extends Obstacle
{
    /**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     */
    constructor(modelAnimationsManager:IModelAnimationsManager)
    {
        super(modelAnimationsManager, "static", 0, 0, null);
        
        this.damageDealt = 2;
        this.state = "slither";
    }
    
    /**
     * Loads the assets for the model
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        const spritesheetPath = "/models/Obstacles/Snake/anim/snake-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        this.spritesheet = assetHandler.loadImage(spritesheetPath);
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/standard.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    registerAnimations():void
    {
        super.registerAnimations();
        
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
                spritesheet: this.spritesheet!,
                frameCoordinates: slitherFrameCoordinates,
                fps: 24,
                drawWidth,
                drawHeight
            }),
            dead: this.animationManager.createAnimation({
                spritesheet: this.spritesheet!,
                frameCoordinates: deadFrameCoordinates,
                fps: 1,
                drawWidth,
                drawHeight
            })
        });
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