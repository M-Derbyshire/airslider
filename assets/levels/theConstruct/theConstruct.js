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
        models.push(new Werewolf(0));
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
    
    load()
    {
        this.tunnelSprite = this.kernel.loadImage("/assets/levels/theConstruct/images/theConstructTunnel.png");
        this.tunnelSpriteLength = 60;
        
        this.ground.set(
            "/assets/levels/theConstruct/images/ground.png",
            this.helpers.unit.yUnit(50)
        );
        
        this._background = this.kernel.loadImage("/assets/levels/theConstruct/images/testBackground.png");
        this.kernel.graphicEn.setStaticBackground(this._background);
        
        this.outsideLightMask = this.kernel.loadImage("/assets/levels/theConstruct/images/testBackgroundMask.png");
        this.outsideLightBrightness = 0;
        
        this.outsideVisible = false;
        
        //these are set in level
        this.kernel.graphicEn.lightMask = this.tunnelLightMask;
        this.kernel.graphicEn.lightLuminosity = this.tunnelLightBrightness;
        
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
            this.shockerManager.sendShockers();
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