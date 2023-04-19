import { IDamageFlashImages } from '../../../../HUDs/components/DamageFlash/DamageFlash';
import ASModel from '../../../ASModel/ASModel';
import IModel from '../../../Model/IModel';
import Tarian from '../../../Tarian/Tarian';

/**
 * The Dragon's lava ball attack
 */
export default class LavaBall extends ASModel {
    
    protected playerModel:Tarian;
    protected color:keyof IDamageFlashImages; // The image used by the DamageFlash
    
    private _initialYSpeed:number;
    
    /**
     * Constructor
     * @param playerModel The player's model
     */
    constructor(playerModel:Tarian)
    {
        super();
        
        this.playerModel = playerModel;
        this.active = false;
        this.damageDealt = 2;
        this.color = "fire";
        this.zSpeed = 1; // a value is required for Tarian to recognise hit
    }
    
    load():void
    {
        super.load();
        
        let ballWidth = 30;
        let ballHeight = 40;
        
        const spritesheetPath = "/assets/models/monsters/attacks/LavaBall/anim/lavaBomb-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            drop: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: ballWidth,
                drawHeight: ballHeight,
				frameCoordinates: [
					{ x: 0, y: 0, width: 59, height: 59 }
				]
            }),
            break: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
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
                sheetPath: spritesheetPath,
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
    
    prepare():void
    {
        super.prepare();
        this._initialYSpeed = 1000;
        this.ySpeed = this._initialYSpeed;
    }
    
    act():void
    {
        if(this.state == "drop")
        {
            this.moveDown(this.ySpeed);
            this.moveRight(this.xSpeed); //may be negative, to move left
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
    
    /**
     * The dragon can use this to aim the lava ball at the player, before it drops it
     */
    aimAtPlayer():void
    {
        const speedMultiplier = 2.25;
        const xSpeedLimit = 250; // A limit on the x speed
        
        // We need to calculate the x/y speed needed to get to the player (can be negative values)
        const distanceToPlayerTop = this.playerModel.y - (this.y + this.height);
        const playerXCenter = (this.playerModel.width / 2) + this.playerModel.x;
        const thisXCenter = (this.width / 2) + this.x;
        const distanceToPlayerXCentre = playerXCenter - thisXCenter;
        
        this.ySpeed = distanceToPlayerTop * speedMultiplier;
        this.xSpeed = distanceToPlayerXCentre * speedMultiplier;
        
        // We want to limit the x speed (in either direction)
        if(Math.abs(this.xSpeed) > xSpeedLimit)
        {
            this.xSpeed = (this.xSpeed > 0) ? xSpeedLimit : -xSpeedLimit;
        }
    }
    
    hitPlayerEventAction(otherModel:IModel):void
    {
        if(this.state == "drop")
        {
            this.state = "break";
        }
    }
}