class Level
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.controlInitialiser = new ControlsInitialiser();
        
        this._eventManager = new EventManager(new EventCheckContainer, new ModelExtraEventManager);
        this._frameManager; //Set in subclass load method
        
        this.road = new LevelRoad();
        this.roadColor = "#999999";
        
        this.shockerManager = new ShockerManager();
		this.patternManager = new ModelXPositionPatternManager();
        
        this.ground = new LevelGround();
        
        this.tunnelManager = new LevelTunnel();
        
        this._HUD; //the Heads Up Display for the level
        this._HUD = new MainHUD();
        
		//The section the level is currently on
		this._levelSection = 0;
		
        //The edges of the playable area
        this.leftEdge;
        this.rightEdge;
        
        this.monsterIndex;
        
        this._musicRef;
        
        this.outsideVisible = false;
        
        this.frameIndex;
        
        this.tunnelLightMaskIndex;
        this.outsideLightMaskIndex;
        
        this.levelSpeed;
        this.levelSpeedRaw;
        this.initialLevelSpeedRaw;
    }
    
    //set things that can only be done after the engines are constructed
    load(canvas)
    {
        //These are the events that are valid across all levels
        this._eventManager.registerEventsArray([
            { 
                eventCheckMethodName: "zCollisionEventCheck",
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: Shocker,
                class2EventActionName: "zCollisionEventAction"
            },
			{ 
                eventCheckMethodName: "zCollisionEventCheck",
                class1: Tarian,
                class1EventActionName: "zCollisionElectricMineEventAction",
                class2: ElectricMine,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheckMethodName: "hitPlayerOrGroundEventCheck",
                class1: NeonPidgeon,
                class1EventActionName: "hitPlayerOrGroundEventAction",
                class2: Tarian,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheckMethodName: "neonPidgeonOverlappingEventCheck",
                class1: NeonPidgeon,
                class1EventActionName: "neonPidgeonOverlappingEventAction",
                class2: Tarian,
                class2EventActionName: "" //Doesn't have one, and doesn't try to call one
            },
            { 
                eventCheckMethodName: "zCollisionEventCheck",
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: LavaBall,
                class2EventActionName: "hitPlayerEventAction"
            },
            { 
                eventCheckMethodName: "hitPlayerOrGroundEventCheck",
                class1: Falcon,
                class1EventActionName: "hitPlayerOrGroundEventAction",
                class2: Tarian,
                class2EventActionName: "zCollisionEventAction"
            },
            { 
                eventCheckMethodName: "zCollisionEventCheck",
                class1: Tarian,
                class1EventActionName: "zCollisionEventAction",
                class2: Werewolf,
                class2EventActionName: "zCollisionEventAction"
            },
        ]);
        
        this.leftEdge = 0;
        this.rightEdge = this.kernel.unitsWithinCamera;
        this.shockerManager.setAreaEdges(this.leftEdge, this.rightEdge);
        
        this.helpers.zCalc.setVanishPoint(
            () => { return canvas.width / 2; }, 
            () => { return canvas.height / 2; }
        );
        
        this.initialLevelSpeedRaw = 600;
        this.levelSpeedRaw = this.initialLevelSpeedRaw; //Can be used if you need to check for a change in level speed, or to change it
        this.updateLevelSpeed();
        
        //Setup the controls
        //The main character in this game is always index 0
        this.controlInitialiser.keyboardControls(0);
        this.controlInitialiser.touchControls(0);
        
        this._HUD.modelIndexes.push(0);
		
		this.patternManager.setStartingZPosition(this.helpers.zCalc.vPointDepth);
    }
    
    loadHUD(canvasCtx, camera)
    {
        this._HUD.load(canvasCtx, camera);
    }
    
    get HUD() { return this._HUD; }
    
    //meant to be overridden
    getModels(){}
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
            this.tunnelManager.tunnel.length > 1 && 
            this.tunnelManager.tunnel[this.tunnelManager.tunnel.length - 1].z <= 0 &&
            this.tunnelManager.tunnel[this.tunnelManager.tunnel.length - 2].imageIndex !== -1
        )
        {
            this._frameManager.getFrameByIndex(this.frameIndex).setLightMaskImage(
                this.tunnelLightMaskIndex
            );
        } else {
            this._frameManager.getFrameByIndex(this.frameIndex).setLightMaskImage(
                this.outsideLightMaskIndex
            );
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
            this.ground.draw(this.levelSpeed);
        }
        
        this.tunnelManager.draw(this.levelSpeed);
        this.road.draw(this.roadColor);
    }
    
    drawFront()
    {
        
        
        if(this.extraDrawFront)
        {
            this.extraDrawFront();
        }
    }
    
    checkForEvents()
    {
        this._eventManager.checkForEvents();
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