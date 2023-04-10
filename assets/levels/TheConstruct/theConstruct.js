import Kernel from '/Kernel/kernel';
import Tarian from '/assets/models/Tarian/Tarian';
import NeonPidgeon from '/assets/models/Monsters/NeonPidgeon/NeonPidgeon';
import Falcon from '/assets/models/Monsters/Falcon/Falcon';
import BabyDragon from '/assets/models/Monsters/BabyDragon/BabyDragon';
import LavaBall from '/assets/models/Monsters/attacks/LavaBall/LavaBall';
import Ghost from '/assets/models/Monsters/Ghost/Ghost';
import Shocker from '/assets/models/Shocker/Shocker';
import ElectricSeahorse from '/assets/models/Monsters/ElectricSeahorse/ElectricSeahorse';
import Lightning from '/assets/models/Monsters/attacks/Lightning/Lightning';
import Frame from '/engines/GraphicEn/Frame';
import ASLevel from '/assets/levels/ASLevel/ASLevel';
import TarianExplosion from '/assets/models/TarianExplosion/TarianExplosion';
import ElectricHornet from '/assets/models/Monsters/ElectricHornet/ElectricHornet';

export default class TheConstruct extends ASLevel
{
    constructor()
    {
        super(ASLevel);
        
        this.levelClosingSectionNumber = 3;
    }
    
    getModels()
    {
        const stdModels = super.getModels();
        
        let models = [];
        
		this.player = new Tarian();
        const playerExplosion = new TarianExplosion(this.player);
        models.push(this.player); //add main character (has to be 0)
        models.push(playerExplosion);
        
        // models.push(new NeonPidgeon(player, true));
        // models.push(new NeonPidgeon(player));
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
            // models[models.length - 1],
            // models[models.length - 2]
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
    
    load(canvas, canvasCtx, camera, frameManager)
    {
        super.load(canvas, canvasCtx, camera, frameManager);
        
        this.frameManager = frameManager;
        
        this._tunnelSprite = this.kernel.loadImage("/assets/levels/TheConstruct/images/theConstructTunnel.png");
        this._tunnelSpriteLength = 60;
        
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
    
    prepare()
    {
        super.prepare();
        
        // this.tunnelManager.createStartingTunnel([
        //     this.tunnelManager.newTunnelPart(this._tunnelSprite, this._tunnelSpriteLength)
        // ]);
    }
    
    
    act()
    {
        super.act();
		
		this.patternManager.sendPatterns();
        
        if(this.helpers.time.getTotalSeconds() <= 37)
        {
            // this.shockerManager.sendShockers();
        }
        
        // this.tunnelManager.continueTunnel([
        //     this.tunnelManager.newTunnelPart(this._tunnelSprite, this._tunnelSpriteLength),
        //     this.tunnelManager.newTunnelPart(null, this.tunnelSpriteLength)
        // ]);
        
		
		//Start the monster going
		if(this.helpers.time.getTotalSeconds() >= 15 && this.levelSection === 1)
		{
			this.monsters.forEach(monster => monster.start());
            this.levelSection = 2;
		}
        
        //Stop the monster
        // if(this.helpers.time.getTotalSeconds() >= 40 && this.levelSection === 2)
        // {
        //     this.monsters.forEach(monster => monster.stop());
        //     this.levelSection = this.levelClosingSectionNumber;
        // }
        
        if(this.helpers.time.getTotalSeconds() >= 25 && this.levelSection === 2)
        {
            this.levelSection = this.levelClosingSectionNumber;
        }
		
		
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