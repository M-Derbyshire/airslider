import Kernel from '/kernel/kernel';
import Tarian from '/assets/models/Tarian/Tarian';
import NeonPidgeon from '/assets/models/Monsters/NeonPidgeon/NeonPidgeon';
import Falcon from '/assets/models/Monsters/Falcon/Falcon';
import BabyDragon from '/assets/models/Monsters/BabyDragon/BabyDragon';
import LavaBall from '/assets/models/Monsters/attacks/LavaBall/LavaBall';
import Werewolf from '/assets/models/Monsters/Werewolf/Werewolf';
import ElectricMine from '/assets/models/ElectricMine/ElectricMine';
import Shocker from '/assets/models/Shocker/Shocker';
import Frame from '/engines/GraphicEn/Frame';
import Level from '/assets/levels/Level/Level';

export default class TheConstruct extends Level
{
    constructor()
    {
        super(Level);
    }
    
    getModels()
    {
        let models = [];
        
        models.push(new Tarian()); //add main character (has to be 0)
        
        // models.push(new NeonPidgeon(models[0]));
        // models.push(new Falcon(models[0]));
        models.push(new Werewolf(models[0]));
		// models.push(new LavaBall());
		// models.push(new BabyDragon(models[0], models[models.length - 1]));
		this.monster = models[models.length - 1];

        this.shockerManager.setShockerModelRange(2, 13);
        this.shockerManager.setCurrentShockerCount(10);
        let shockerRange = this.shockerManager.shockerModelRange;
        for(let i = shockerRange.from; i <= shockerRange.to; i++)
        {
            // models.push(new ElectricMine());
			models.push(new Shocker("yellow", "static"));
        }
		
		//const modelWidth = 100; //Set explicitly here, as models not yet loaded
		//this.patternManager.setPatternDefaults(shockerRange.from, shockerRange.to, modelWidth);
        
        return models;
    }
    
    load(canvas, canvasCtx, camera, frameManager)
    {
        super.load(canvas);
        
        this._frameManager = frameManager;
        
        this.tunnelSprite = this.kernel.loadImage("/assets/levels/theConstruct/images/theConstructTunnel.png");
        this.tunnelSpriteLength = 60;
        
        this.ground.set(
            canvasCtx,
            camera,
            "/assets/levels/theConstruct/images/ground.png",
            this.helpers.unit.yUnit(50)
        );
        
        this.tunnelManager.load(camera);
        this.road.load(canvasCtx, camera);
        
        
        //Setup the frame for the level
        const unitsWithinCamera = this.kernel.unitsWithinCamera;
        let frame = new Frame(canvasCtx, camera, 0, 0, unitsWithinCamera, unitsWithinCamera);
        
        const frameBackgroundIndex = frame.loadBackground("/assets/levels/theConstruct/images/testBackground.png");
        frame.setBackgroundImage(frameBackgroundIndex);
        
        this.outsideLightMaskIndex = frame.loadLightMask(
            "/assets/levels/theConstruct/images/testBackgroundMask.png",
            0
        );
        this.tunnelLightMaskIndex = frame.loadLightMask(
            "/assets/levels/level/images/tunnelLightMask.png",
            0.25
        );
        
        this.frameIndex = this._frameManager.addFrame(frame);
        
        
        this.outsideVisible = true;
        
        this.tunnelManager.createStartingTunnel([
            this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
        ]);
    }
    
    act()
    {
        this.updateLevelSpeed(); //keeps level speed consistent via fps
        
        //if outside/inside changes, change light mask
        this.checkLightMask();
		
		// this.patternManager.sendPatterns();
        
        if(this.helpers.time.getTotalSeconds() <= 37)
        {
            this.shockerManager.sendShockers();
        }
        
        
        this.tunnelManager.continueTunnel([
            this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
            this.tunnelManager.newTunnelPart(null, this.tunnelSpriteLength)
        ]);
        
		
		//Start the monster going straight away
		if(this.helpers.time.getTotalSeconds() >= 0 && this.helpers.time.getTotalSeconds() <= 1)
		{
			this.monster.start();
		}
		
		
		//Set a pattern of electric mines going
        // if(this.levelSpeed > 0 && this.helpers.time.getTotalSeconds() >= 0 && this._levelSection < 1)
        // {
		// 	this._levelSection = 1;
			
		// 	const levelCenter = (this.rightEdge / 2) + (this.leftEdge / 2);
			
		// 	this.patternManager.addRepeatingPattern(20, 10, 10000, [
		// 		{ fromPosition: levelCenter-100, toPosition: levelCenter-100 },
		// 		{ fromPosition: levelCenter-50, toPosition: levelCenter-50 },
		// 		{ fromPosition: levelCenter, toPosition: levelCenter },
		// 		{ fromPosition: levelCenter+50, toPosition: levelCenter+50 },
		// 		{ fromPosition: levelCenter+100, toPosition: levelCenter+100 },
		// 		{ fromPosition: levelCenter+50, toPosition: levelCenter+50 },
		// 		{ fromPosition: levelCenter, toPosition: levelCenter },
		// 		{ fromPosition: levelCenter-50, toPosition: levelCenter-50 }
		// 	]);
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
        // }
    }
}