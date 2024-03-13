import IModelAnimationsManager from '../../Model/ModelAnimationsManager/IModelAnimationsManager';
import Obstacle, { obstacleModes } from '../../Obstacle/Obstacle';
import Tarian from '../../Tarian/Tarian';

/**
 * A shocker, that moves down the track to shock the player
 */
export default class Shocker extends Obstacle
{
    /**
     * The color of the shocker (also determines its width, as the purple shocker is wider)
     */
    color:string;
    
    /**
     * Constructor
     * @param color the color of the shocker (also determines its width, as the purple is wider)
     * @param mode The shocker's mode
     * @param speedX The x speed of the shocker. This needs to be quite high (1000-2000+) for sweeping, but 
     * much less for the homing
     * @param playerModel The player model. This can be null, as it is only needed for "home" mode
     */
    constructor(color:string, mode:obstacleModes, speedX:number = 0, playerModel:Tarian|null = null)
    {
        super(mode, 200, speedX, playerModel);
        
        this.color = color;
		this.damageDealt = 2;
        this.state = "shock";
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
		
        const spritesheetPath = "/assets/models/Obstacles/Shocker/anim/shocker-" + this.color + "-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
		let width;
		let frameCoordinates;
		
		if(this.color === "purple")
		{
			width = 300;
			frameCoordinates = [
				{ x: 0, y: 0, width: 783, height: 476 },
				{ x: 0, y: 475, width: 783, height: 476 },
				{ x: 0, y: 953, width: 783, height: 476 },
			];
		}
		else
		{
			width = 100;
			frameCoordinates = [
				{ x: 0, y: 0, width: 131, height: 238 },
				{ x: 0, y: 239, width: 131, height: 238 },
				{ x: 0, y: 478, width: 131, height: 238 },
			];
		}
        
        this.animationManager.registerAnimations({
            shock: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                frameCoordinates,
                fps: 24,
                drawWidth: width,
                drawHeight: 340,
            })
        });
        
        const damageFlashSpritesheet = "/assets/HUDs/components/DamageFlash/images/yellow.png";
        this.damageFlashImage = this.kernel.loadImage(damageFlashSpritesheet);
        this.assetsToUnload.push(damageFlashSpritesheet);
    }
}