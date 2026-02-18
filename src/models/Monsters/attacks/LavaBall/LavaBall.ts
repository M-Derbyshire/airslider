import ASModel from '../../../ASModel/ASModel';
import IModelAnimationsManager from '../../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Tarian from '../../../Tarian/Tarian';
import { IHitBox } from '../../../../../Kernel/entities/Model/IModel';
import IAssetHandler from '../../../../../Kernel/AssetHandler/IAssetHandler';

/**
 * The Dragon's lava ball attack
 */
export default class LavaBall extends ASModel {
    
    protected playerModel:Tarian; // The player's model
    protected damageFlashImage!:HTMLImageElement; // The image used by the DamageFlash HUD Component
    
    /**
     * Constructor
     * @param playerModel The player's model
     * @param modelAnimationsManager manages the animations for the model
     */
    constructor(playerModel:Tarian, modelAnimationsManager:IModelAnimationsManager)
    {
        super(modelAnimationsManager);
        
        this.playerModel = playerModel;
        this.damageDealt = 10;
    }
    
    /**
     * Loads the assets for the model
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void
    {
        super.load(assetHandler);
        
        const spritesheetPath = "/models/monsters/attacks/LavaBall/anim/lavaBomb-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        this.spritesheet = assetHandler.loadImage(spritesheetPath);
        
        const damageFlashSpritesheet = "/HUDComponents/DamageFlash/images/fire.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashSpritesheet);
        this.assetsToUnload.push(damageFlashSpritesheet);
    }
    
    registerAnimations():void
    {
        super.registerAnimations();
        
        const ballWidth = 30;
        const ballHeight = 40;
        
        this.animationManager.registerAnimations({
            drop: this.animationManager.createAnimation({
                spritesheet: this.spritesheet!,
                fps: 24,
                drawWidth: ballWidth,
                drawHeight: ballHeight,
				frameCoordinates: [
					{ x: 0, y: 0, width: 65, height: 59 }
				]
            }),
            break: this.animationManager.createAnimation({
                spritesheet: this.spritesheet!,
                fps: 24,
                drawWidth: ballWidth,
                drawHeight: ballHeight,
                onAnimationEnd: () => this.state = "none",
				frameCoordinates: [
					{ x: 0, y: 0, width: 65, height: 59 },
					{ x: 0, y: 60, width: 65, height: 59 },
					{ x: 0, y: 120, width: 65, height: 59 },
					{ x: 0, y: 180, width: 65, height: 59 },
				]
            }),
            none: this.animationManager.createAnimation({
                spritesheet: this.spritesheet!,
                fps: 24,
                drawWidth: 0,
                drawHeight: 0,
				frameCoordinates: [
					{ x: 0, y: 0, width: 0, height: 0 }
				]
            }),
        });
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
            this.moveDown();
            this.moveRight(); // the X speed may be a negative number, to move left
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
        const xSpeedLimit = 450; // A limit on the x speed (regardless of direction)
        
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
     * Creates and returns the current array of hit boxes for the model.
     * @returns An array of box's that can be used for events (e.g. boxes covering a character, for use by collision events)
     */
    getHitBoxes():IHitBox[]
    {
        if(this.state === "drop")
            return super.getHitBoxes();
        
        // If the ball has collided with the player (or the ground), we no longer want to trigger collision events
        return [];
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
     * Runs any extra event checks specific to this model
     */
    checkForExtraEvents():void
    {
        super.checkForExtraEvents();
        
        if(this.hasHitGround())
            this.hitEventAction();
    }
}