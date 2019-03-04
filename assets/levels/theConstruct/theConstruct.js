class TheConstruct extends Level
{
    constructor()
    {
        super(Level);
        
        this.shockerCount = 7;
        this.shockerIndexes = {
            from: 0,
            to: 0
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
        this.monsterIndex = 1;
        
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
        
        this.outsideVisible = true;
        
        kernel.graphicEn.setLightMask(this.outsideLightMask);
        kernel.graphicEn.setLightLuminosity(this.outsideLightBrightness);
    }
    
    act()
    {
        this.framesPassed++;
        
        //if outside/inside changes, change light mask
        this.checkLightMask();
        
        if(this.framesPassed == secondsToFrames(2))
        {
            kernel.loadedModels[this.monsterIndex].start();
        }
        
        if(this.framesPassed == minutesToFrames(1))
        {
            kernel.loadedModels[this.monsterIndex].stop();
        }
    }
}