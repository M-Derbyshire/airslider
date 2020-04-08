class TheConstruct extends Level
{
    constructor(kernel)
    {
        super(Level);
        
        this.shockerCount = 15; //this is actually required, as you can change it to change difficulty during the level
        this.shockerIndexes = {
            from: 2,
            to: 17
        };
    }
    
    getModels()
    {
        let models = [];
        
        models.push(new Tarian()); //add main character (has to be 0)
        controlConstructor.keyboardControls(0);
        controlConstructor.touchControls(0);
        this.HUD.modelIndexes.push(0);
        
        models.push(new NeonPidgeon(0));
        // models.push(new Falcon(0));
        // models.push(new BabyDragon(0, 2));
        // models.push(new LavaBall());
        // models.push(new Werewolf(0));
        this.monsterIndex = 1;

        
        for(let i = this.shockerIndexes.from; i <= this.shockerIndexes.to; i++)
        {
            models.push(new Shocker("yellow", "static"));
        }
        
        return models;
    }
    
    load()
    {
        this.tunnelSprite = this.kernel.loadImage("/assets/levels/theConstruct/images/theConstructTunnel.png");
        this.tunnelSpriteLength = 60;
        
        this.setGround(
            "/assets/levels/theConstruct/images/ground.png",
            yUnit(50)
        );
        
        this._background = this.kernel.loadImage("/assets/levels/theConstruct/images/testBackground.png");
        this.kernel.graphicEn.setStaticBackground(this._background);
        
        this.outsideLightMask = this.kernel.loadImage("/assets/levels/theConstruct/images/testBackgroundMask.png");
        this.outsideLightBrightness = 0;
        
        this.outsideVisible = false;
        
        //these are set in level
        this.kernel.graphicEn.lightMask = this.tunnelLightMask;
        this.kernel.graphicEn.lightLuminosity = this.tunnelLightBrightness;
        
        this.createStartingTunnel([
            this.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
        ]);
    }
    
    act()
    {
        this.updateLevelSpeed(); //keeps level speed consistent via fps
        
        //if outside/inside changes, change light mask
        this.checkLightMask();
        
        if(getTotalSeconds() <= 37)
        {
            this.sendShockers(this.shockerIndexes.from, this.shockerIndexes.to);
        }
        
        //tunnel stuff
        this.continueTunnel([
            this.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
            this.newTunnelPart(-1, this.tunnelSpriteLength)
        ]);
        
        if(this.kernel.level.levelSpeed > 0 && getTotalSeconds() >= 0 && getTotalSeconds() <= 1 && !this.kernel.loadedModels[this.monsterIndex].entering)
        {
            this.outsideVisible = true;
            this.kernel.loadedModels[this.monsterIndex].start();
        }
        
        if(this.kernel.level.levelSpeed > 0 && getTotalSeconds() >= 30 && getTotalSeconds() <= 31 && !this.kernel.loadedModels[this.monsterIndex].exiting && this.kernel.loadedModels[this.monsterIndex].active)
        {
            this.kernel.loadedModels[this.monsterIndex].stop();
        }
    }
}