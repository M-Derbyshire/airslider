class TheConstruct extends Level
{
    constructor()
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
        
        // models.push(new NeonPidgeon(0));
        // models.push(new Falcon(0));
        // models.push(new LavaBall());
        // models.push(new BabyDragon(0, 1));
        models.push(new Werewolf(0));
        this.monsterIndex = 1;
        
        for(let i = this.shockerIndexes.from; i <= this.shockerIndexes.to; i++)
        {
            models.push(new Shocker("yellow", "static"));
        }
        
        return models;
    }
    
    load()
    {
        this.setGround(
            kernel.rootPath + "/assets/levels/theConstruct/images/ground.png",
            yUnit(50)
        );
        
        this._background = kernel.loadImage(kernel.rootPath + "/assets/levels/theConstruct/images/testBackground.png");
        kernel.graphicEn.setStaticBackground(this._background);
        
        this.outsideLightMask = kernel.loadImage(kernel.rootPath + "/assets/levels/theConstruct/images/testBackgroundMask.png");
        this.outsideLightBrightness = 0;
        
        this.outsideVisible = false;
        
        //these are set in level
        kernel.graphicEn.lightMask = this.tunnelLightMask;
        kernel.graphicEn.lightLuminosity = this.tunnelLightBrightness;
        
        // this.createStartingTunnel([
        //     this.newTunnelPart("#0000ff", 60),
        //     this.newTunnelPart("#000000", 15)
        // ]);
    }
    
    act()
    {
        this.updateLevelSpeed(); //keeps level speed consistent via fps
        
        //if outside/inside changes, change light mask
        this.checkLightMask();
        
        // if(getTotalSeconds() <= 37)
        // {
        //     this.sendShockers(this.shockerIndexes.from, this.shockerIndexes.to);
        // }
        
        // if(getTotalSeconds() <= 43)
        // {
        //     //tunnel stuff
        //     this.continueTunnel([
        //         this.newTunnelPart("#0000ff", 60),
        //         this.newTunnelPart("#000000", 15)
        //     ]);
        // }
        
        if(kernel.level.levelSpeed > 0 && getTotalSeconds() >= 0 && getTotalSeconds() <= 1 && !kernel.loadedModels[this.monsterIndex].entering)
        {
            kernel.loadedModels[this.monsterIndex].start();
        }
        
        if(kernel.level.levelSpeed > 0 && getTotalSeconds() >= 30 && getTotalSeconds() <= 31 && !kernel.loadedModels[this.monsterIndex].exiting && kernel.loadedModels[this.monsterIndex].active)
        {
            kernel.loadedModels[this.monsterIndex].stop();
        }
    }
}