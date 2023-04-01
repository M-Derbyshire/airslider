import Level from '/assets/levels/Level/Level';
import LevelRoad from './LevelRoad';
import ShockerManager from './ShockerManager';
import ModelXPositionPatternManager from './ModelXPositionPatternManager';
import settings from '../../../settings/settings';
import LevelGround from './LevelGround';
import LevelTunnel from './LevelTunnel';
import Sign from '/assets/models/Sign/Sign';
import SignDisplay from '/assets/models/SignDisplay/SignDisplay';
import Tarian from '/assets/models/Tarian/Tarian';
import Shocker from '/assets/models/Shocker/Shocker';
import NeonPidgeon from '/assets/models/Monsters/NeonPidgeon/NeonPidgeon';
import LavaBall from '/assets/models/Monsters/attacks/LavaBall/LavaBall';
import Lightning from '/assets/models/Monsters/attacks/Lightning/Lightning';
import Falcon from '/assets/models/Monsters/Falcon/Falcon';
import Ghost from '/assets/models/Monsters/Ghost/Ghost';
import ElectricHornet from '/assets/models/Monsters/ElectricHornet/ElectricHornet';


export default class ASLevel extends Level {
	
	constructor()
	{
		super(Level);
		
		this.road = new LevelRoad();
        this.roadColor = "#999999";
        
        this.shockerManager = new ShockerManager();
		this.patternManager = new ModelXPositionPatternManager();
        
        this.ground;
        
        this.tunnelManager = new LevelTunnel();
        this._tunnelSprite;
        this._tunnelSpriteLength;
		
		this._levelSection = 0; // The section the level is currently on (0 is the opening sequence)
        this._levelClosingSectionNumber = 1; // The closing section number is defined by the child level.
        this._timeLevelClosingBeginMS = 0; // When (in milliseconds) did the closing sequence begin
		
        //The edges of the playable area
        this.leftEdge;
        this.rightEdge;
        
        this._monsters;
        this._player;
		
		this.outsideVisible = false;
		
		this.tunnelLightMaskIndex;
        this.outsideLightMaskIndex;
        
        this.levelMoving = false;
        this.levelSpeed;
        this.levelSpeedRaw;
        this.maxLevelSpeedRaw;
        this.levelSpeedAccl; // How quickly does the speed accelerate at the start?
        
        // Models/info for opening and closing of level
        this._startSign;
        this._startSignDisplay;
        this._finishSign;
        this._finishFlagsActive = false;
        this._signStartingZPosition = 50;
	}
    
    getModels()
    {
        this._startSign = new Sign("", this._signStartingZPosition, -1, true);
        this._startSignDisplay = new SignDisplay(this._startSign);
        this._finishSign = new Sign("FINISH", this.helpers.zCalc.vPointDepth, this._signStartingZPosition, false);
        
        return [
            this._startSign,
            this._startSignDisplay,
            this._finishSign
        ];
    }
	
	load(gameCanvas, gameContext, camera, frameManager)
	{
		super.load(gameCanvas, gameContext, camera, frameManager);
        
		this.leftEdge = 0;
        this.rightEdge = this.kernel.unitsWithinCamera;
        
        this.ground = new LevelGround(gameContext, camera);
        this._finishFlagsManager = new LevelGround(gameContext, camera, false); 
        
        this._finishFlagsManager.load(
            "/assets/levels/ASLevel/images/finish_flag.png",
            312,
            50,
            350
        );
		
        this._setupShockerManager(this.leftEdge, this.rightEdge);
		
		this._setupLevelSpeed();
		
		this._setupPatternManager();
	}
    
    prepare()
    {
        super.prepare();
        this.ground.setupGround();
        this._finishFlagsManager.setupGround();
        
        this._finishFlagsActive = false;
        this.levelMoving = false;
    }
    
    unload()
    {
        super.unload();
    }
	
	
	_setupPatternManager()
	{
		this.patternManager.setStartingZPosition(this.helpers.zCalc.vPointDepth);
	}
	
	_setupLevelSpeed()
	{
		//levelSpeedRaw can be used if you need to check for a change in level speed, or to change it
		this.maxLevelSpeedRaw = 600;
        this.levelSpeedRaw = 0;
        this.levelSpeedAccl = 600;
        this._updateLevelSpeed();
	}
	
	_setupShockerManager(leftEdge, rightEdge)
	{
		this.shockerManager.setAreaEdges(leftEdge, rightEdge);
		this.shockerManager.setPlayerModelIndex(0);
	}
	
	
	
	_registerLevelEvents()
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
                class1: ElectricHornet,
                class1EventActionName: "zCollisionEventAction",
                class2: Tarian,
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
                class2: Ghost,
                class2EventActionName: "zCollisionEventAction"
            },
            {
              eventCheckMethodName: "zCollisionEventCheck",
              class1: Tarian,
              class1EventActionName: "zCollisionEventAction",
              class2: Lightning,
              class2EventActionName: "hitPlayerEventAction"
            },
        ]);
	}
    
    act()
    {
        super.act();
        this._updateLevelSpeed(); //keeps level speed consistent via fps
        
        //if outside/inside changes, change light mask
        this._setLightMask();
        
        // Opening
        if(this._levelSection === 0)
        {
            this._levelOpening();
        }
        
        // closing
        if(this.levelMoving && this._levelSection === this._levelClosingSectionNumber)
        {
            this._levelClosing();
        }
    }
	
	_updateLevelSpeed()
    {
        if(this.levelMoving)
        {
            if(this.levelSpeedRaw < this.maxLevelSpeedRaw)
            {
                this.levelSpeedRaw += this.helpers.zCalc.speed(this.levelSpeedAccl, this.kernel.fps);
            } else {
                this.levelSpeedRaw = this.maxLevelSpeedRaw;
            }
            
            this.levelSpeed = this.helpers.zCalc.speed(this.levelSpeedRaw, this.kernel.fps);
        }
        else
        {
            this.levelSpeed = 0;
        }
    }
    
    _setLightMask()
    {
        if(
            this.tunnelManager.tunnel.length > 1 && 
            this.tunnelManager.tunnel[this.tunnelManager.tunnel.length - 1].z <= 0 &&
            this.tunnelManager.tunnel[this.tunnelManager.tunnel.length - 2].image
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
    
    // Start the forward movement of the level (increases until it reaches max)
    _levelMovementStart()
    {
        this.levelMoving = true;
        this.kernel.loadedModels[settings.playerModelIndex].canBeControlled = true;
    }
	
	levelStop()
    {
        this.levelMoving = false;
        
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            this.kernel.loadedModels[i].levelStopped();
        }
    }
    
    drawBack()
    {
        if(this.outsideVisible)
        {
            this.ground.draw(this.levelSpeed);
        }
        
        // Not doing this in the above if statement, because draw() needs to be called to add more flags
        if(this._finishFlagsActive)
            this._finishFlagsManager.draw(this.levelSpeed);
        
        this.tunnelManager.draw(this.levelSpeed);
        this.road.draw(this.roadColor);
    }
    
    // Opening and closing sequences for the levels
    _levelOpening()
    {
        // SignDisplay will start the countdown automatically
        
        if(this._startSignDisplay.state === "go")
        {
            this._levelMovementStart();
            this._levelSection++;
        }
    }
    
    _levelClosing()
    {
        // Start the finish flags, and record when the closing sequence began
        if(!this._timeLevelClosingBeginMS)
        {
            this._timeLevelClosingBeginMS = this.helpers.time.getTotalMilliseconds();
            this._finishFlagsActive = true;
        }
        
        // End the finish flags, before starting the sign's entrance
        if(!this._finishSign.active && this.helpers.time.getTotalMilliseconds() >= (this._timeLevelClosingBeginMS + 3500))
        {
            this._finishFlagsManager.removeGround();
        }
        
        // Trigger the finish sign's entrance
        if(!this._finishSign.active && this.helpers.time.getTotalMilliseconds() >= (this._timeLevelClosingBeginMS + 4000))
        {
            this._finishSign.active = true;
        }
        
        // If the sign is in position, stop the level
        if(this._finishSign.z === this._signStartingZPosition && this._player.zSpeed === 0)
        {
            this._player.zSpeed = this.levelSpeedRaw;
            this.levelMoving = false;
        }
        
        if(this._player.z > this.helpers.zCalc.vPointDepth)
            this.levelStop();
    }
}