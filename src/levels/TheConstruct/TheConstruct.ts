import ASLevel from '../ASLevel/ASLevel';
import IModel from '../../../Kernel/entities/Model/IModel';
import TheConstructLoadingScreen from '../LoadingScreens/TheConstructLoadingScreen/TheConstructLoadingScreen';
import Kernel from '../../../Kernel/Kernel';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import ASModel from '../../models/ASModel/ASModel';
import NeonPidgeon from '../../models/Monsters/NeonPidgeon/NeonPidgeon';
import Falcon from '../../models/Monsters/Falcon/Falcon';
import Ghost from '../../models/Monsters/Ghost/Ghost';
import LavaBall from '../../models/Monsters/attacks/LavaBall/LavaBall';
import BabyDragon from '../../models/Monsters/BabyDragon/BabyDragon';
import Lightning from '../../models/Monsters/attacks/Lightning/Lightning';
import ElectricSeahorse from '../../models/Monsters/ElectricSeahorse/ElectricSeahorse';
import ElectricHornet from '../../models/Monsters/ElectricHornet/ElectricHornet';
import Monster from '../../models/Monster/Monster';
import Shocker from '../../models/Obstacles/Shocker/Shocker';
import IEventManager from '../../../Kernel/entities/Level/IEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';

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

        // this.obstacleManager.setPlayerModel(this.player);
        // this.obstacleManager.setObstacleModelRange(models.length, models.length + 100);
        // this.obstacleManager.setCurrentObstacleCount(5);
        
        // let obstacleRange = this.obstacleManager.obstacleModelRange;
        // for(let i = obstacleRange.from; i <= obstacleRange.to; i++)
        // {
		// 	models.push(new Shocker("yellow", "static"));
        // }
		
		// this.patternManager.setPatternDefaults(obstacleRange.from, obstacleRange.to);
        
        return models;
    }
    
    load(
        frameManager:IFrameManager,
        eventManager:IEventManager,
        pointerEventManager:IPointerEventManager
    ):void
    {
        super.load(frameManager, eventManager, pointerEventManager);
        
        const assetHandler = Kernel.getInstance().assetHandler;
        
        this.tunnelSprite = assetHandler.loadImage("/levels/TheConstruct/images/theConstructTunnel.png");
        this.tunnelSpriteLength = 60;
        
        this.groundManager.load(
            "/levels/TheConstruct/images/ground.png",
            50,
            50
        );
        
        this.backgroundImage = assetHandler.loadImage("/levels/TheConstruct/images/testBackground.png");
        this.insideLightMaskImage = assetHandler.loadImage("/levels/TheConstruct/images/tunnelLightMask.png");
        this.insideLightMaskLuminosity = 0.25;
        this.outsideLightMaskImage = assetHandler.loadImage("/levels/TheConstruct/images/testBackgroundMask.png");
        this.outsideLightMaskLuminosity = 0;
        
        this.assetsToUnload.push(
            "/levels/TheConstruct/images/theConstructTunnel.png",
            "/levels/TheConstruct/images/testBackground.png",
            "/levels/TheConstruct/images/testBackgroundMask.png",
            "/levels/TheConstruct/images/tunnelLightMask.png",
            "/levels/TheConstruct/images/ground.png"
        );
    }
    
    prepare():void
    {
        super.prepare();
        
        this.outsideVisible = true;
        
        this.patternManager.clearPatterns();
        
        // this.tunnelManager.createStartingTunnel([
        //     this.tunnelManager.newTunnelPart(this.tunnelSprite, this.tunnelSpriteLength)
        // ]);
    }
    
    
    act():void
    {
        super.act();
        
        // const levelActiveSeconds = Kernel.getInstance().totalLevelActiveMilliseconds / 1000;
        // if(levelActiveSeconds < 30)
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