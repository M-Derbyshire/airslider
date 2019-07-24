class TheConstruct extends Level
{
    constructor()
    {
        super(Level);
        
        this.shockerCount = 24; //this is actually required, as you can change it to change difficulty during the level
        this.shockerIndexes = {
            from: 3,
            to: 27
        };
    }
    
    getModels()
    {
        let models = [];
        
        models.push(new Tarian()); //add main character (has to be 0)
        controlConstructor.keyboardControls(0);
        controlConstructor.touchControls(0);
        this.HUD.modelIndexes.push(0);
        
        //models.push(new NeonPidgeon(0));
        //models.push(new Falcon(0));
        models.push(new LavaBall());
        models.push(new BabyDragon(0, 1));
        this.monsterIndex = 2;
        
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
        
        this.background = kernel.loadImage(kernel.rootPath + "/assets/levels/theConstruct/images/testBackground.png");
        kernel.graphicEn.setStaticBackground(this.background);
        
        this.outsideLightMask = kernel.loadImage(kernel.rootPath + "/assets/levels/theConstruct/images/testBackgroundMask.png");
        this.outsideLightBrightness = 0;
        
        this.outsideVisible = false;
        
        //these are set in level
        kernel.graphicEn.setLightMask(this.tunnelLightMask);
        kernel.graphicEn.setLightLuminosity(this.tunnelLightBrightness);
        
        this.createStartingTunnel([
            this.newTunnelPart("#0000ff", 60),
            this.newTunnelPart("#000000", 15)
        ]);
    }
    
    act()
    {
        this.updateLevelSpeed(); //keeps level speed consistent via fps
        this.framesPassed++;
        
        //if outside/inside changes, change light mask
        this.checkLightMask();
        
        if(getTotalSeconds() <= 37)
        {
            this.sendShockers(this.shockerIndexes.from, this.shockerIndexes.to);
        }
        
        if(getTotalSeconds() <= 43)
        {
            //tunnel stuff
            this.continueTunnel([
                this.newTunnelPart("#0000ff", 60),
                this.newTunnelPart("#000000", 15)
            ]);
        }
        
        if(getTotalSeconds() >= 43 && getTotalSeconds() <= 44 && this.tunnel[this.tunnel.length - 1].color !== "clear")
        {
            this.continueTunnel([
                this.newTunnelPart("clear", 1)
            ]);
        }
        
        if(!this.outsideVisible && getTotalSeconds() >= 44 && getTotalSeconds() <= 45)
        {
            this.outsideVisible = true;
        }
        
        if(kernel.level.levelSpeed > 0 && getTotalSeconds() >= 45 && getTotalSeconds() <= 46 && !kernel.loadedModels[this.monsterIndex].entering)
        {
            kernel.loadedModels[this.monsterIndex].start();
        }
        
        if(kernel.level.levelSpeed > 0 && getTotalSeconds() >= 110 && getTotalSeconds() <= 111 && !kernel.loadedModels[this.monsterIndex].exiting && kernel.loadedModels[this.monsterIndex].active)
        {
            kernel.loadedModels[this.monsterIndex].stop();
        }
        
        if(kernel.level.levelSpeed > 0 && getTotalSeconds() >= 118)
        {
            this.sendShockers(this.shockerIndexes.from, this.shockerIndexes.to);
            
            //tunnel stuff
            this.continueTunnel([
                this.newTunnelPart("#0000ff", 80),
                this.newTunnelPart("#000000", 20),
                this.newTunnelPart("clear", 80),
                this.newTunnelPart("#000000", 20)
            ]);
        }
    }
}