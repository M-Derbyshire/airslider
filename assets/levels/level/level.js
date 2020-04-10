class Level
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.controlInitialiser = new ControlsInitialiser();
        
        this.road = new LevelRoad();
        this.roadColor = "#999999";
        
        this.shockerManager = new ShockerManager();
        
        this.ground = new LevelGround();
        
        this.tunnel = new LevelTunnel();
        
        this._background = "white"; //use a color if nothing set in subclass (hence true on the next line)
        
        this.HUD; //the Heads Up Display for the level
        this.HUD = new MainHUD();
        
        //The edges of the playable area
        this.leftEdge;
        this.rightEdge;
        
        this.monsterIndex;
        
        this._musicRef;
        
        this.outsideVisible = false;
        
        this.tunnelLightMask;
        this.tunnelLightBrightness;
        this.outsideLightMask;
        this.outsideLightBrightness;
        
        this.levelSpeed;
        this.levelSpeedRaw;
        this.initialLevelSpeedRaw;
    }
    
    //set things that can only be done after the engines are constructed
    loadSuper()
    {
        this.leftEdge = 0;
        this.rightEdge = this.kernel.graphicEn.gameCan.width;
        this.shockerManager.setAreaEdges(this.leftEdge, this.rightEdge);
        
        this.helpers.zCalc.setVanishPoint(this.kernel.graphicEn.gameCan.width / 2, this.kernel.graphicEn.gameCan.height / 2, 1000);
        
        this.initialLevelSpeedRaw = 600;
        this.levelSpeedRaw = this.initialLevelSpeedRaw; //Can be used if you need to check for a change in level speed, or to change it
        this.updateLevelSpeed();
        
        this.tunnelLightMask = this.kernel.loadImage("/assets/levels/level/images/tunnelLightMask.png");
        this.tunnelLightBrightness = 0.25;
        
        //Setup the controls
        //The main character in this game is always index 0
        this.controlInitialiser.keyboardControls(0);
        this.controlInitialiser.touchControls(0);
        
        this.HUD.modelIndexes.push(0);
    }
    
    //meant to be overridden
    getModels(){}
    load(){}
    act(){}
    
    updateLevelSpeed()
    {
        if(this.levelSpeed != 0)
        {
            this.levelSpeed = this.helpers.zCalc.speed(this.levelSpeedRaw, this.kernel.fps); //need to use this in monsters for death
        }
    }
    
    checkLightMask()
    {
        if(
            this.tunnel.length > 1 && 
            this.tunnel[this.tunnel.length - 1].z <= 0 &&
            this.tunnel[this.tunnel.length - 2].imageIndex != -1
        )
        {
            this.kernel.graphicEn.lightMask = this.tunnelLightMask;
            this.kernel.graphicEn.lightLuminosity = this.tunnelLightBrightness;
        } else {
            this.kernel.graphicEn.lightMask = this.outsideLightMask;
            this.kernel.graphicEn.lightLuminosity = this.outsideLightBrightness;
        }
    }
    
    drawBack()
    {
        if(this.extraDrawBack)
        {
            this.extraDrawBack();
        }
        
        if(this.outsideVisible)
        {
            this.ground.draw();
        }
        
        this.tunnel.draw(this.levelSpeed);
        this.road.draw(this.roadColor);
    }
    
    drawFront()
    {
        
        
        if(this.extraDrawFront)
        {
            this.extraDrawFront();
        }
    }
    
    levelStop()
    {
        this.levelSpeedRaw = 0;
        
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            this.kernel.loadedModels[i].levelStopped();
        }
    }
}