import Tarian from '../../models/Tarian/Tarian';
import NeonPidgeon from '../../models/Monsters/NeonPidgeon/NeonPidgeon';
import Falcon from '../../models/Monsters/Falcon/Falcon';
import BabyDragon from '../../models/Monsters/BabyDragon/BabyDragon';
import LavaBall from '../../models/Monsters/attacks/LavaBall/LavaBall';
import Ghost from '../../models/Monsters/Ghost/Ghost';
import Shocker from '../../models/Shocker/Shocker';
import ElectricSeahorse from '../../models/Monsters/ElectricSeahorse/ElectricSeahorse';
import Lightning from '../../models/Monsters/attacks/Lightning/Lightning';
import Frame from '../../../engines/GraphicEn/Frame';
import ASLevel from '../ASLevel/ASLevel';
import TarianExplosion from '../../models/TarianExplosion/TarianExplosion';
import ElectricHornet from '../../models/Monsters/ElectricHornet/ElectricHornet';
import IModel from '../../models/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import ICamera from '../../../engines/GraphicEn/ICamera';
import IFrameManager from '../../../engines/GraphicEn/IFrameManager';
import Monster from '../../models/Monster/Monster';

/**
 * Testing/development level
 */
export default class TheConstruct extends ASLevel
{
    /**
     * Constructor
     */
    constructor()
    {
        super();
        
        this.levelClosingSectionNumber = 3;
    }
    
    getModels():IModel[]
    {
        const stdModels = super.getModels();
        
        let models:ASModel[] = [];
        
		this.player = new Tarian();
        
        models.push(this.player); //add main character (has to be 0)
        models.push(new TarianExplosion(this.player));
        
        models.push(new NeonPidgeon(this.player, true));
        models.push(new NeonPidgeon(this.player));
        // models.push(new Falcon(models[0]));
        // models.push(new Ghost(models[0]));
		// models.push(new LavaBall(models[0]));
        // models.push(new LavaBall(models[0]));
		// models.push(new BabyDragon(models[0], models[models.length - 1], models[models.length - 2]));
        // models.push(new Lightning());
        // models.push(new Lightning());
        // models.push(new ElectricSeahorse(player, models[models.length - 2], models[models.length - 1]));
        // models.push(new ElectricHornet(player));
		this.monsters = [
            models[models.length - 1] as Monster,
            models[models.length - 2] as Monster
        ];

        // this.shockerManager.setShockerModelRange(models.length, models.length + 10);
        // this.shockerManager.setCurrentShockerCount(10);
        // let shockerRange = this.shockerManager.shockerModelRange;
        // for(let i = shockerRange.from; i <= shockerRange.to; i++)
        // {
		// 	models.push(new Shocker("yellow", "static"));
        // }
		
		// const modelWidth = 100; //Set explicitly here, as models not yet loaded
		// this.patternManager.setPatternDefaults(shockerRange.from, shockerRange.to, modelWidth);
        
        return [...models, ...stdModels];
    }
    
    load(canvas:HTMLCanvasElement, canvasCtx:CanvasRenderingContext2D, camera:ICamera, frameManager:IFrameManager):void
    {
        super.load(canvas, canvasCtx, camera, frameManager);
        
        this.frameManager = frameManager;
        
        this.tunnelSprite = this.kernel.loadImage("/assets/levels/TheConstruct/images/theConstructTunnel.png");
        this.tunnelSpriteLength = 60;
        
        this.ground.load(
            "/assets/levels/TheConstruct/images/ground.png",
            50,
            50
        );
        
        this.tunnelManager.load(camera);
        this.road.load(canvasCtx, camera);
        
        
        //Setup the frame for the level
        const unitsWithinCamera = this.kernel.unitsWithinCamera;
        let frame = new Frame(canvasCtx, camera, 0, 0, unitsWithinCamera, unitsWithinCamera);
        
        const frameBackgroundIndex = frame.loadBackground("/assets/levels/TheConstruct/images/testBackground.png");
        frame.setBackgroundImage(frameBackgroundIndex);
        
        this.outsideLightMaskIndex = frame.loadLightMask(
            "/assets/levels/TheConstruct/images/testBackgroundMask.png",
            0
        );
        this.tunnelLightMaskIndex = frame.loadLightMask(
            "/assets/levels/Level/images/tunnelLightMask.png",
            0.25
        );
        
        this.assetsToUnload.push(
            "/assets/levels/TheConstruct/images/theConstructTunnel.png",
            "/assets/levels/TheConstruct/images/testBackground.png",
            "/assets/levels/TheConstruct/images/testBackgroundMask.png",
            "/assets/levels/Level/images/tunnelLightMask.png",
            "/assets/levels/TheConstruct/images/ground.png"
        );
        
        
        this.frameIndex = this.frameManager.addFrame(frame);
        
        
        this.outsideVisible = true;
    }
    
    prepare():void
    {
        super.prepare();
        
        // this.tunnelManager.createStartingTunnel([
        //     this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength)
        // ]);
    }
    
    
    act():void
    {
        super.act();
		
		this.patternManager.sendPatterns();
        
        if(this.helpers.time.getTotalSeconds() <= 37)
        {
            // this.shockerManager.sendShockers();
        }
        
        // this.tunnelManager.continueTunnel([
        //     this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
        //     this.tunnelManager.newTunnelPart(null, this.tunnelSpriteLength)
        // ]);
        
		
		//Start the monster going
		if(this.helpers.time.getTotalSeconds() >= 15 && this.levelSection === 1)
		{
			this.monsters.forEach(monster => monster.start());
            this.levelSection = 2;
		}
        
        //Stop the monster
        if(this.helpers.time.getTotalSeconds() >= 90 && this.levelSection === 2)
        {
            this.monsters.forEach(monster => monster.stop());
            
            if(this.monsters.every(monster => monster.active === false))
                this.levelSection = this.levelClosingSectionNumber;
        }
        
        // if(this.helpers.time.getTotalSeconds() >= 90 && this.levelSection === 2)
        // {
        //     this.levelSection = this.levelClosingSectionNumber;
        // }
		
		
		//Set a pattern of shockers going
        if(this.levelSpeed > 0 && this.helpers.time.getTotalSeconds() >= 0 && this.levelSection < 1)
        {
			// this.levelSection = 1;
			
			// const levelCenter = (this.rightEdge / 2) + (this.leftEdge / 2);
			
			// this.patternManager.addRepeatingPattern(20, 10, 10000, [
			// 	{ fromPosition: levelCenter-100, toPosition: levelCenter-100 },
			// 	{ fromPosition: levelCenter-50, toPosition: levelCenter-50 },
			// 	{ fromPosition: levelCenter, toPosition: levelCenter },
			// 	{ fromPosition: levelCenter+50, toPosition: levelCenter+50 },
			// 	{ fromPosition: levelCenter+100, toPosition: levelCenter+100 },
			// 	{ fromPosition: levelCenter+50, toPosition: levelCenter+50 },
			// 	{ fromPosition: levelCenter, toPosition: levelCenter },
			// 	{ fromPosition: levelCenter-50, toPosition: levelCenter-50 }
			// ]);
			// this.patternManager.addRepeatingPattern(50, 10, 10000, [
			// 	{ fromPosition: levelCenter+200, toPosition: levelCenter+200 }
			// ]);
			// this.patternManager.addRepeatingPattern(15, 10, 10000, [
			// 	{ fromPosition: levelCenter-300, toPosition: levelCenter+300 },
			// 	{ fromPosition: levelCenter-200, toPosition: levelCenter+200 },
			// 	{ fromPosition: levelCenter-100, toPosition: levelCenter+100 },
			// 	{ fromPosition: levelCenter, toPosition: levelCenter },
			// 	{ fromPosition: levelCenter-100, toPosition: levelCenter+100 },
			// 	{ fromPosition: levelCenter-200, toPosition: levelCenter+200 }
			// ]);
			// this.patternManager.addRepeatingPattern(15, 10, 10000, [
			// 	{ fromPosition: levelCenter-200, toPosition: levelCenter+200 }
			// ]);
        }
    }
}