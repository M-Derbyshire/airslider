import Kernel from '../../../../../Kernel/Kernel';
import ASModel from '../../../ASModel/ASModel';
import IModel from '../../../../../Kernel/entities/Model/IModel';
import IModelAnimationsManager from '../../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Tarian from '../../../Tarian/Tarian';

/**
 * The Dragon's lava ball attack
 */
export default class LavaBall extends ASModel {
    
    protected playerModel:Tarian; // The player's model
    protected damageFlashImage:HTMLImageElement; // The image used by the DamageFlash HUD Component
    
    /**
     * Constructor
     * @param playerModel The player's model
     */
    constructor(playerModel:Tarian)
    {
        super();
        
        this.playerModel = playerModel;
        this.damageDealt = 2;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const ballWidth = 30;
        const ballHeight = 40;
        
        const spritesheetPath = "/models/monsters/attacks/LavaBall/anim/lavaBomb-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            drop: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: ballWidth,
                drawHeight: ballHeight,
				frameCoordinates: [
					{ x: 0, y: 0, width: 65, height: 59 }
				]
            }),
            break: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: ballWidth,
                drawHeight: ballHeight,
                nextAnimation: "none",
				frameCoordinates: [
					{ x: 0, y: 0, width: 65, height: 59 },
					{ x: 0, y: 60, width: 65, height: 59 },
					{ x: 0, y: 120, width: 65, height: 59 },
					{ x: 0, y: 180, width: 65, height: 59 },
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
        
        const damageFlashSpritesheet = "/HUDComponents/DamageFlash/images/fire.png";
        this.damageFlashImage = Kernel.getInstance().loadImage(damageFlashSpritesheet);
        this.assetsToUnload.push(damageFlashSpritesheet);
    }
    
    prepare():void
    {
        super.prepare();
        
        this.active = false;
        this.state = "drop";
        this.ySpeed = 0;
    }
    
    act():void
    {
        if(this.state === "drop")
        {
            this.moveDown(this.ySpeed);
            this.moveRight(this.xSpeed); // this may be a negative number, to move left
        }
        else if(this.state === "none")
        {
            this.active = false;
        }
    }
    
    /**
     * A monster can aim the lava ball at the player using this, before it is dropped
     */
    aimAtPlayer():void
    {
        const speedMultiplier = 2.25; // Change this to affect the speed of the ball
        const xSpeedLimit = 250; // A limit on the x speed (regardless of direction)
        
        // We need to determine the distance between the ball and the player
        const playerXCenter = (this.playerModel.width / 2) + this.playerModel.x;
        const thisXCenter = (this.width / 2) + this.x;
        const distanceToPlayerXCenter = playerXCenter - thisXCenter; // This can be a negative value, if it needs to move left
        const distanceToPlayerY = this.playerModel.y - (this.y + this.height);
        
        // Now we can calculate the x/y speed needed to get to the player
        this.xSpeed = distanceToPlayerXCenter * speedMultiplier;
        this.ySpeed = distanceToPlayerY * speedMultiplier;
        
        // We want to limit the x speed (regardless of the direction)
        if(Math.abs(this.xSpeed) > xSpeedLimit)
            this.xSpeed = (this.xSpeed > 0) ? xSpeedLimit : -xSpeedLimit;
    }
    
    /**
     * Handles collision with the player or the ground
     */
    hitEventAction():void
    {
        if(this.state === "drop")
            this.state = "break";
    }
    
    /**
     * Any extra event checks specific to this model
     */
    protected extraEvents():void
    {
        super.extraEvents();
        
        if(this.hasHitGround())
            this.hitEventAction();
    }
}