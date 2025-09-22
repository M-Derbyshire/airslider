import LoadingScreen from '../../LoadingScreen/LoadingScreen';
import Neonus from '../../Neonus/Neonus';

/**
 * The loading screen for Vevania
 */
export default class VevaniaLoadingScreen extends LoadingScreen
{
    constructor()
    {
        super();
        
        this.LevelToLoad = Neonus;
        this.backgroundImagePath = "/levels/LoadingScreens/VevaniaLoadingScreen/images/background.png";
    }
};