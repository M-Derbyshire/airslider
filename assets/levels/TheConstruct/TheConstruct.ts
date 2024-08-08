import Tarian from '../../models/Tarian/Tarian';
import NeonPidgeon from '../../models/Monsters/NeonPidgeon/NeonPidgeon';
import Falcon from '../../models/Monsters/Falcon/Falcon';
import BabyDragon from '../../models/Monsters/BabyDragon/BabyDragon';
import LavaBall from '../../models/Monsters/attacks/LavaBall/LavaBall';
import Ghost from '../../models/Monsters/Ghost/Ghost';
import Shocker from '../../models/Obstacles/Shocker/Shocker';
import ElectricSeahorse from '../../models/Monsters/ElectricSeahorse/ElectricSeahorse';
import Lightning from '../../models/Monsters/attacks/Lightning/Lightning';
import Frame from '../../../engines/GraphicEngine/Frame';
import ASLevel from '../ASLevel/ASLevel';
import ElectricHornet from '../../models/Monsters/ElectricHornet/ElectricHornet';
import IModel from '../../models/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import ICamera from '../../../engines/GraphicEngine/ICamera';
import IFrameManager from '../../../engines/GraphicEngine/IFrameManager';
import Monster from '../../models/Monster/Monster';
import EventManager from '../Level/EventManager';
import PointerEventManager from '../Level/PointerEventManager';
import TheConstructLoadingScreen from '../LoadingScreens/TheConstructLoadingScreen/TheConstructLoadingScreen';
import Kernel from '../../../Kernel/Kernel';

/**
 * Testing/development level
 */
export default class TheConstruct extends ASLevel
{
    /**
     * Constructor
     */
    constructor()
    {
        super();
        
        this.NextLevelLoadingScreen = TheConstructLoadingScreen;
    }
    
    getModels():IModel[]
    {
        let models = super.getModels() as ASModel[];
        
        // const lowerPidgeon = new NeonPidgeon(this.player);
        // models.push(lowerPidgeon);
        // models.push(new NeonPidgeon(this.player, lowerPidgeon));
        
        // models.push(new Falcon(models[0]));
        // models.push(new Ghost(this.player));
		// models.push(new LavaBall(this.player));
        // models.push(new LavaBall(this.player));
		// models.push(new BabyDragon(this.player, models[models.length - 1] as LavaBall, models[models.length - 2] as LavaBall));
        // models.push(new Lightning());
        // models.push(new Lightning());
        // models.push(new ElectricSeahorse(this.player, models[models.length - 2] as Lightning, models[models.length - 1] as Lightning));
        models.push(new ElectricHornet(this.player));
		this.monsters = [
            models[models.length - 1] as Monster,
            // models[models.length - 2] as Monster
        ];

        this.obstacleManager.setPlayerModel(this.player);
        this.obstacleManager.setObstacleModelRange(models.length, models.length + 100);
        this.obstacleManager.setCurrentObstacleCount(5);
        
        let obstacleRange = this.obstacleManager.obstacleModelRange;
        for(let i = obstacleRange.from; i <= obstacleRange.to; i++)
        {
			models.push(new Shocker("yellow", "static"));
        }
		
		this.patternManager.setPatternDefaults(obstacleRange.from, obstacleRange.to);
        
        return models;
    }
    
    load(
        frameManager:IFrameManager,
        eventManager:EventManager,
        pointerEventManager:PointerEventManager
    ):void
    {
        super.load(frameManager, eventManager, pointerEventManager);
        
        const kernel = Kernel.getInstance();
        
        this.tunnelSprite = kernel.loadImage("/assets/levels/TheConstruct/images/theConstructTunnel.png");
        this.tunnelSpriteLength = 60;
        
        this.groundManager.load(
            "/assets/levels/TheConstruct/images/ground.png",
            50,
            50
        );
        
        this.roadManager.load();
        
        //Setup the frame for the level
        const unitsWithinCamera = kernel.unitsWithinCamera;
        let frame = new Frame(0, 0, unitsWithinCamera, unitsWithinCamera);
        
        const frameBackgroundIndex = frame.loadBackground("/assets/levels/TheConstruct/images/testBackground.png");
        frame.setBackgroundImage(frameBackgroundIndex);
        
        this.outsideLightMaskIndex = frame.loadLightMask(
            "/assets/levels/TheConstruct/images/testBackgroundMask.png",
            0
        );
        this.tunnelLightMaskIndex = frame.loadLightMask(
            "/assets/levels/TheConstruct/images/tunnelLightMask.png",
            0.25
        );
        
        this.assetsToUnload.push(
            "/assets/levels/TheConstruct/images/theConstructTunnel.png",
            "/assets/levels/TheConstruct/images/testBackground.png",
            "/assets/levels/TheConstruct/images/testBackgroundMask.png",
            "/assets/levels/TheConstruct/images/tunnelLightMask.png",
            "/assets/levels/TheConstruct/images/ground.png"
        );
        
        this.frameIndex = this.frameManager.addFrame(frame);
    }
    
    prepare():void
    {
        super.prepare();
        
        const kernel = Kernel.getInstance();
        
        this.outsideVisible = true;
        
        this.patternManager.setStartingZPosition(kernel.helpers.zCalc.vanishingPointDepth);
        this.patternManager.clearPatterns();
        
        // this.tunnelManager.createStartingTunnel([
        //     this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength)
        // ]);
    }
    
    
    act():void
    {
        super.act();
        
        // if(this.helpers.time.getTotalSeconds() < 30)
        // {
        //     this.tunnelManager.continueTunnel([
        //         this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength),
        //         this.tunnelManager.newTunnelPart(null, this.tunnelSpriteLength)
        //     ]);
        // }
        
        // Send some shockers
        // this.levelSection(
        //     "obstacles",
        //     15000,
        //     25000,
        //     null,
        //     () => this.obstacleManager.sendObstacle(),
        //     null
        // );
		
		// Runs the monster sequence
        this.levelSection(
            "monster", 
            15000, 
            90000, 
            () => this.monsters.forEach(monster => monster.start()),
            null,
            () => this.monsters.forEach(monster => monster.stop())
        );
		
		
		//Set a pattern of shockers going
        // this.levelSection(
        //     "obstaclePattern",
        //     15000,
        //     25000,
        //     () => {
        //         const levelCenter = (this.rightEdge / 2) + (this.leftEdge / 2);
                
        //         this.patternManager.addRepeatingPattern(200, 10, [
        //             { fromPosition: levelCenter-500, toPosition: levelCenter-150 },
        //             { fromPosition: levelCenter-500, toPosition: levelCenter-100 },
        //             { fromPosition: levelCenter-500, toPosition: levelCenter-50 },
        //             { fromPosition: levelCenter-500, toPosition: levelCenter-100 },
        //             { fromPosition: levelCenter-500, toPosition: levelCenter-150 },
        //         ]);
        //         this.patternManager.addRepeatingPattern(200, 10, [
        //             { fromPosition: levelCenter+200, toPosition: levelCenter+200 }
        //         ]);
        //         // this.patternManager.addRepeatingPattern(500, 10, [
        //         //     { fromPosition: levelCenter-200, toPosition: levelCenter-200 }
        //         // ]);
        //     },
        //     () => this.patternManager.sendPatterns(),
        //     () => this.patternManager.clearPatterns()
        // );
        
        // Run the closing sequence
        this.levelEndSection(95000);
        // this.levelEndSection(15000);
    }
}