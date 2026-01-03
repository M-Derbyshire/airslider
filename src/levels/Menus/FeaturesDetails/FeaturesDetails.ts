import Level from '../../../../Kernel/entities/Level/Level';
import Kernel from '../../../../Kernel/Kernel';
import FeaturesDetailsHUD from '../../../HUDs/FeaturesDetailsHUD/FeaturesDetailsHUD';
import ForurnLoadingScreen from '../../LoadingScreens/ForurnLoadingScreen/ForurnLoadingScreen';

/**
 * A level that provides details on different features (e.g. the fullscreen mode)
 */
export default class FeaturesDetails extends Level
{
    constructor()
    {
        super();
        
        this.isPauseable = false;
        
        const onContinue = () => Kernel.getInstance().unloadCurrentLevel();
        this.HUD = new FeaturesDetailsHUD(onContinue);
    }
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
        const kernel = Kernel.getInstance();
        
        kernel.loadLevel(new ForurnLoadingScreen());
    }
};