class TheConstruct extends Level
{
    constructor()
    {
        super(Level);
    }
    
    getModels()
    {
        let models = [];
        
        models.push(new Tarian()); //add main character (has to be 0)
        
        // models.push(new NeonPidgeon(0));
        // models.push(new Falcon(0));
        // models.push(new BabyDragon(0, 2));
        // models.push(new LavaBall());
        // models.push(new Werewolf(0));
        // this.monsterIndex = 1;

        this.shockerManager.setShockerModelRange(1, 40);
        this.shockerManager.setCurrentShockerCount(40);
        
        let shockerRange = this.shockerManager.shockerModelRange;
        for(let i = shockerRange.from; i <= shockerRange.to; i++)
        {
            models.push(new Shocker("yellow", "static"));
        }
		
		this.patternManager.setModelIndexRange(shockerRange.from, shockerRange.to);
        
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
        
        // this.tunnelManager.createStartingTunnel([
        //     this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
        // ]);
		
		this.patternManager
    }
    
    act()
    {
        this.updateLevelSpeed(); //keeps level speed consistent via fps
        
        //if outside/inside changes, change light mask
        this.checkLightMask();
		
		this.patternManager.sendPatterns();
        
        // if(this.helpers.time.getTotalSeconds() <= 37)
        // {
        //     this.shockerManager.sendShockers();
        // }
        
        //tunnel stuff
        // this.tunnelManager.continueTunnel([
        //     this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
        //     this.tunnelManager.newTunnelPart(-1, this.tunnelSpriteLength)
        // ]);
        
        if(this.levelSpeed > 0 && this.helpers.time.getTotalSeconds() >= 0 && this._levelSection < 1)
        {
			this._levelSection = 1;
			
			const levelCenter = (this.rightEdge / 2) + (this.leftEdge / 2);
			
			this.patternManager.addRepeatingPattern(10, 10000, [
				{ fromPosition: levelCenter-100, toPosition: levelCenter-100 },
				{ fromPosition: levelCenter-50, toPosition: levelCenter-50 },
				{ fromPosition: levelCenter, toPosition: levelCenter },
				{ fromPosition: levelCenter+50, toPosition: levelCenter+50 },
				{ fromPosition: levelCenter+100, toPosition: levelCenter+100 }
			]);
			// this.patternManager.addRepeatingPattern(10, 10000, [
			// 	{ fromPosition: levelCenter-100, toPosition: levelCenter+100 },
			// 	{ fromPosition: levelCenter-80, toPosition: levelCenter+80 },
			// 	{ fromPosition: levelCenter-60, toPosition: levelCenter+60 },
			// 	{ fromPosition: levelCenter-40, toPosition: levelCenter+40 },
			// 	{ fromPosition: levelCenter-20, toPosition: levelCenter+20 },
			// 	{ fromPosition: levelCenter, toPosition: levelCenter },
			// 	{ fromPosition: levelCenter-20, toPosition: levelCenter+20 },
			// 	{ fromPosition: levelCenter-40, toPosition: levelCenter+40 },
			// 	{ fromPosition: levelCenter-60, toPosition: levelCenter+60 },
			// 	{ fromPosition: levelCenter-80, toPosition: levelCenter+80 }
			// ]);
        }
    }
}