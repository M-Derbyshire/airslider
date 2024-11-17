import Kernel from '../../../../../Kernel/Kernel';
import ASModel from '../../../ASModel/ASModel';
import IModel from '../../../../../Kernel/entities/Model/IModel';
import IModelAnimationsManager from '../../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';

/**
 * The lighting attack used by the ElectricSeahorse
 */
export default class Lightning extends ASModel {
    
    protected damageFlashImage:HTMLImageElement; // The image used by the DamageFlash HUD component
    
    private _damageValue:number; // this.damageDealt is calculated every frame using this (see the act() method)
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const spritesheetPath = "/models/monsters/attacks/Lightning/anim/lightning-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            shock: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 12,
                drawWidth: 40,
                drawHeight: 850,
				frameCoordinates: [
					{ x: 0, y: 0, width: 76, height: 499 },
					{ x: 92, y: 0, width: 76, height: 499 },
					{ x: 183, y: 0, width: 76, height: 499 }
				]
            })
        });
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/yellow.png";
        this.damageFlashImage = Kernel.getInstance().loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    prepare():void
    {
        super.prepare();
        
        this.state = "shock";
        this.active = false;
        
        //See the act() method for an explanation of the below
        this._damageValue = 4;
        this.damageDealt = 0;
    }
    
    act():void
    {
        //With most other models, the collision will end after one frame (because of the attack's movement).
        //However, in this instance, that's not the case, so we need to account for the frame rate.
        //Players can take this damage over multiple frames at a time, and we don't want people taking more damage on higher framerates.
        //Therefore, during the gameplay, the actual damage dealt will be the _damageValue, modified with the frame rate.
        this.damageDealt = this._damageValue / Kernel.getInstance().fps;
    }
    
    hitPlayerEventAction(otherModel:IModel):void {} // no action actually required
}