import { IDamageFlashImages } from '../../../../HUDs/components/DamageFlash/DamageFlash';
import ASModel from '../../../ASModel/ASModel';
import IModel from '../../../Model/IModel';

/**
 * The lighting used by the ElectricSeahorse
 */
export default class Lightning extends ASModel {
    
    protected color:keyof IDamageFlashImages; // The image used by the DamageFlash
    
    private _damageValue:number;
    
    /**
     * Constructor
     */
    constructor()
    {
        super();
        
        this.color = "yellow";
        this.zSpeed = 1; //value required for Tarian to recognise hit
        
        //See the act method for explanation of the below
        this._damageValue = 4;
        this.damageDealt = 0;
    }
    
    load():void
    {
        super.load();
        
        const spritesheetPath = "/assets/models/monsters/attacks/Lightning/anim/lightning-spritesheet.png";
        
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
    }
    
    prepare():void
    {
        super.prepare();
        
        this.state = "shock";
        this.active = false;
    }
    
    act():void
    {
        //With most other models, the collision will end after one frame (because of the attacks movement).
        //However, in this instance, that's not the case, so we need to account for the frame rate.
        //Players can take this damage over multiple frames at a time, and we don't want people taking more damage on higher framerates.
        //Therefore, during the gameplay, the actual damage dealt will be the _damageValue, modified with the frame rate.
        this.damageDealt = this._damageValue / this.kernel.fps;
    }
    
    hitPlayerEventAction(otherModel:IModel):void {} //no action actually required
}