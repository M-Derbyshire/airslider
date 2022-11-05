import ASModel from '/assets/models/ASModel/ASModel';

export default class Lightning extends ASModel {
    
    constructor()
    {
        super(ASModel);
        
        this.color = "yellow"; //Used for the damage flash hud component
        this.zSpeed = 1; //value required for Tarian to recognise hit
        
        //See the act method for explanation of the below
        this._damageValue = 4;
        this.damageDealt = 0;
    }
    
    load()
    {
        super.load();
        
        const spritesheetPath = "/assets/models/monsters/attacks/Lightning/anim/lightning-spritesheet.png";
        
        this._assetsToUnload.push(spritesheetPath);
        
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
    
    prepare()
    {
        super.prepare();
        this.reset();
    }
    
    reset()
    {
        this.state = "shock";
        this.active = false;
    }
    
    act()
    {
        //With most other models, the collision will end after one frame (because of the attacks movement).
        //However, in this instance, that's not the case, so we need to account for the frame rate.
        //Players can take this damage over multiple frames at a time, and we don't want people taking more damage on higher framerates.
        //Therefore, during the gameplay, the actual damage dealt will be the _damageValue, modified with the frame rate.
        this.damageDealt = this._damageValue / this.kernel.fps;
    }
    
    hitPlayerEventAction(otherModel){} //no action actually required
}