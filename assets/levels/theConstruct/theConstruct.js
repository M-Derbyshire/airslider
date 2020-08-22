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
        models.push(new Falcon(0));
        // models.push(new BabyDragon(0, 2));
        // models.push(new LavaBall());
        // models.push(new Werewolf(0));
        this.monsterIndex = 1;

        this.shockerManager.setShockerModelRange(2, 17);
        this.shockerManager.setCurrentShockerCount(15);
        
        let shockerRange = this.shockerManager.shockerModelRange;
        for(let i = shockerRange.from; i <= shockerRange.to; i++)
        {
            models.push(new Shocker("yellow", "static"));
        }
        
        return models;
    }
    
    load(canvasCtx, camera)
    {
        super.load();
        
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
        
        this.frameIndex = this.kernel.graphicEn.frameManager.addFrame(frame);
        
        
        
        this.outsideVisible = false;
        
        this.tunnelManager.createStartingTunnel([
            this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
        ]);
    }
    
    act()
    {
        this.updateLevelSpeed(); //keeps level speed consistent via fps
        
        //if outside/inside changes, change light mask
        this.checkLightMask();
        
        if(this.helpers.time.getTotalSeconds() <= 37)
        {
            // this.shockerManager.sendShockers();
        }
        
        //tunnel stuff
        this.tunnelManager.continueTunnel([
            this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
            this.tunnelManager.newTunnelPart(-1, this.tunnelSpriteLength)
        ]);
        
        if(this.kernel.level.levelSpeed > 0 && this.helpers.time.getTotalSeconds() >= 0 && this.helpers.time.getTotalSeconds() <= 1 && !this.kernel.loadedModels[this.monsterIndex].entering)
        {
            this.outsideVisible = true;
            this.kernel.loadedModels[this.monsterIndex].start();
        }
        
        if(this.kernel.level.levelSpeed > 0 && this.helpers.time.getTotalSeconds() >= 30 && this.helpers.time.getTotalSeconds() <= 31 && !this.kernel.loadedModels[this.monsterIndex].exiting && this.kernel.loadedModels[this.monsterIndex].active)
        {
            this.kernel.loadedModels[this.monsterIndex].stop();
        }
    }
}