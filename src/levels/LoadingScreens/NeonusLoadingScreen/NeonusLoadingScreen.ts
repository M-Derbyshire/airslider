import LoadingScreen from '../../LoadingScreen/LoadingScreen';
import Neonus from '../../Neonus/Neonus';

/**
 * The loading screen for Neonus
 */
export default class NeonusLoadingScreen extends LoadingScreen
{
    constructor()
    {
        super();
        
        this.LevelToLoad = Neonus;
        this.backgroundImagePath = "/levels/LoadingScreens/NeonusLoadingScreen/images/background.png";
    }
};