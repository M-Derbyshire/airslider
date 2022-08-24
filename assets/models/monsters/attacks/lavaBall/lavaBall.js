import ASModel from '/assets/models/ASModel/ASModel';

export default class LavaBall extends ASModel {
    constructor()
    {
        super(ASModel);
        
        this.active = false;
        this.damageDealt = 2;
        this.color = "fire";
        this.zSpeed = 1; //value required for Tarian to recognise hit
    }
    
    load()
    {
        super.load();
        
        let ballWidth = 30;
        let ballHeight = 40;
        
        this._assetsToUnload.push("/assets/models/monsters/attacks/lavaBall/anim/lavaBomb-spritesheet.png");
        
        this.animationManager.registerAnimations({
            drop: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/attacks/lavaBall/anim/lavaBomb-spritesheet.png",
                fps: 24,
                drawWidth: ballWidth,
                drawHeight: ballHeight,
				frameCoordinates: [
					{ x: 0, y: 0, width: 59, height: 59 }
				]
            }),
            break: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/attacks/lavaBall/anim/lavaBomb-spritesheet.png",
                fps: 24,
                drawWidth: ballWidth,
                drawHeight: ballHeight,
                nextAnim: "none",
				frameCoordinates: [
					{ x: 0, y: 0, width: 59, height: 59 },
					{ x: 0, y: 60, width: 59, height: 59 },
					{ x: 0, y: 120, width: 59, height: 59 },
					{ x: 0, y: 180, width: 59, height: 59 },
				]
            }),
            none: this.animationManager.createAnimation({
                sheetPath: "/assets/models/monsters/attacks/lavaBall/anim/lavaBomb-spritesheet.png",
                fps: 24,
                drawWidth: 0,
                drawHeight: 0,
				frameCoordinates: [
					{ x: 0, y: 0, width: 0, height: 0 }
				]
            }),
        });
        
        this.state = "drop";
        
    }
    
    prepare()
    {
        super.prepare();
        this.ySpeed = 2160;
    }
    
    act()
    {
        if(this.state == "drop")
        {
            this.moveDown(this.ySpeed);
        }
        
        if(this.y + this.height >= this.kernel.unitsWithinCamera && this.state === "drop")
        {
            this.setYPositionFromBottom(this.height);
            this.state = "break";
        }
        
        if(this.state === "none")
        {
            this.active = false;
        }
    }
    
    hitPlayerEventAction(otherModel)
    {
        if(this.state == "drop")
        {
            this.state = "break";
        }
    }
}