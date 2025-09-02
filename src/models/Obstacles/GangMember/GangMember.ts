import Kernel from '../../../../Kernel/Kernel';
import IFrameCoordinates from '../../../../Kernel/entities/Model/ModelAnimationsManager/IFrameCoordinates';
import IModelAnimationsManager from '../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager';
import Obstacle from '../../Obstacle/Obstacle';

export default class GangMember extends Obstacle
{
    /**
     * Constructor
     * @param mode The obstacle's mode
     * @param speedX The X-axis speed of the obstacle. This needs to be quite high (1000-2000+) for sweeping
     */
    constructor(mode:"static"|"sweep", speedX:number)
    {
        super(mode, 0, speedX, null);
        
        this.damageDealt = 2;
        this.speedModifier = 3;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        const spritesheetPath = "/models/Obstacles/GangMember/anim/spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        // There are 2 states: "forward" and "fallen"
        const forwardCoordinateWidth = 94;
        const forwardCoordinateHeight = 120;
        const fallenCoordinateWidth = 153;
        const fallenCoordinateHeight = 51;
        
        const forwardDrawWidth = 129;
        const forwardDrawHeight = 166;
        const fallenDrawWidth = 185;
        const fallenDrawHeight = 132;
        
        const forwardFrameCoordinates:IFrameCoordinates[] = [
            {
                x: 0,
                y: 0,
                width: forwardCoordinateWidth,
                height: forwardCoordinateHeight
            },
            {
                x: 0,
                y: forwardCoordinateHeight,
                width: forwardCoordinateWidth,
                height: forwardCoordinateHeight
            },
            {
                x: 0,
                y: forwardCoordinateHeight * 2,
                width: forwardCoordinateWidth,
                height: forwardCoordinateHeight
            },
            {
                x: 0,
                y: forwardCoordinateHeight * 3,
                width: forwardCoordinateWidth,
                height: forwardCoordinateHeight
            },
        ];
        
        const fallenFrameCoordinates:IFrameCoordinates[] = [
            {
                x: 0,
                y: forwardCoordinateHeight * 4,
                width: fallenCoordinateWidth,
                height: fallenCoordinateHeight
            }
        ];
        
        this.animationManager.registerAnimations({
            forward: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                frameCoordinates: forwardFrameCoordinates,
                fps: 24,
                drawWidth: forwardDrawWidth,
                drawHeight: forwardDrawHeight
            }),
            fallen: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                frameCoordinates: fallenFrameCoordinates,
                fps: 1,
                drawWidth: fallenDrawWidth,
                drawHeight: fallenDrawHeight
            })
        });
        
        const damageFlashImagePath = "/HUDComponents/DamageFlash/images/none.png";
        this.damageFlashImage = assetHandler.loadImage(damageFlashImagePath);
        this.assetsToUnload.push(damageFlashImagePath);
    }
    
    prepare(): void {
        this.state = "forward";
        
        super.prepare();
        
        this._resetYPosition();
    }
    
    act():void
    {
        super.act();
        
        if(!this.hasCollidedWithPlayer)
            this.state = "forward";
    }
    
    hitEventAction():void
    {
        super.hitEventAction();
        
        this.state = "fallen";
        const xPosShift = this.width / 4;
        
        this.x -= xPosShift;
        this._resetYPosition();
    }
    
    /**
     * Has the gang-member fallen off of their board?
     */
    hasFallen():boolean
    {
        return this.state === "fallen";
    }
    
    private _resetYPosition():void
    {
        this.setYPositionFromBottom(this.height);
    }
}