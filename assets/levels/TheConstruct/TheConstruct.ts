import Tarian from '../../models/Tarian/Tarian';
import NeonPidgeon from '../../models/Monsters/NeonPidgeon/NeonPidgeon';
import Falcon from '../../models/Monsters/Falcon/Falcon';
import BabyDragon from '../../models/Monsters/BabyDragon/BabyDragon';
import LavaBall from '../../models/Monsters/attacks/LavaBall/LavaBall';
import Ghost from '../../models/Monsters/Ghost/Ghost';
import Shocker from '../../models/Shocker/Shocker';
import ElectricSeahorse from '../../models/Monsters/ElectricSeahorse/ElectricSeahorse';
import Lightning from '../../models/Monsters/attacks/Lightning/Lightning';
import Frame from '../../../engines/GraphicEn/Frame';
import ASLevel from '../ASLevel/ASLevel';
import ElectricHornet from '../../models/Monsters/ElectricHornet/ElectricHornet';
import IModel from '../../models/Model/IModel';
import ASModel from '../../models/ASModel/ASModel';
import ICamera from '../../../engines/GraphicEn/ICamera';
import IFrameManager from '../../../engines/GraphicEn/IFrameManager';
import Monster from '../../models/Monster/Monster';
import EventManager from '../Level/EventManager';
import PointerEventManager from '../Level/PointerEventManager';

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

        this.shockerManager.setPlayerModel(this.player);
        this.shockerManager.setShockerModelRange(models.length, models.length + 100);
        this.shockerManager.setCurrentShockerCount(5);
        
        let shockerRange = this.shockerManager.shockerModelRange;
        for(let i = shockerRange.from; i <= shockerRange.to; i++)
        {
			models.push(new Shocker("yellow", "static"));
        }
		
		this.patternManager.setPatternDefaults(shockerRange.from, shockerRange.to);
        
        return models;
    }
    
    load(
        camera:ICamera, 
        frameManager:IFrameManager,
        eventManager:EventManager,
        pointerEventManager:PointerEventManager
    ):void
    {
        super.load(camera, frameManager, eventManager, pointerEventManager);
        
        this.tunnelSprite = this.kernel.loadImage("/assets/levels/TheConstruct/images/theConstructTunnel.png");
        this.tunnelSpriteLength = 60;
        
        this.groundManager.load(
            "/assets/levels/TheConstruct/images/ground.png",
            50,
            50
        );
        
        this.tunnelManager.load(camera);
        this.roadManager.load(camera);
        
        //Setup the frame for the level
        const unitsWithinCamera = this.kernel.unitsWithinCamera;
        let frame = new Frame(camera, 0, 0, unitsWithinCamera, unitsWithinCamera);
        
        const frameBackgroundIndex = frame.loadBackground("/assets/levels/TheConstruct/images/testBackground.png");
        frame.setBackgroundImage(frameBackgroundIndex);
        
        this.outsideLightMaskIndex = frame.loadLightMask(
            "/assets/levels/TheConstruct/images/testBackgroundMask.png",
            0
        );
        this.tunnelLightMaskIndex = frame.loadLightMask(
            "/assets/levels/ASLevel/images/tunnelLightMask.png",
            0.25
        );
        
        this.assetsToUnload.push(
            "/assets/levels/TheConstruct/images/theConstructTunnel.png",
            "/assets/levels/TheConstruct/images/testBackground.png",
            "/assets/levels/TheConstruct/images/testBackgroundMask.png",
            "/assets/levels/Level/images/tunnelLightMask.png",
            "/assets/levels/TheConstruct/images/ground.png"
        );
        
        this.frameIndex = this.frameManager.addFrame(frame);
    }
    
    prepare():void
    {
        super.prepare();
        
        this.outsideVisible = true;
        
        this.patternManager.setStartingZPosition(this.helpers.zCalc.vPointDepth);
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
        this.levelSection(
            "shockers",
            15000,
            25000,
            null,
            () => this.shockerManager.sendShockers(),
            null
        );
		
		// Runs the monster sequence
        // this.levelSection(
        //     "monster", 
        //     15000, 
        //     90000, 
        //     () => this.monsters.forEach(monster => monster.start()),
        //     null,
        //     () => this.monsters.forEach(monster => monster.stop())
        // );
		
		
		//Set a pattern of shockers going
        // this.levelSection(
        //     "shockerPattern",
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
    }
}