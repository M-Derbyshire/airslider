import LoadingScreen from '../../LoadingScreen/LoadingScreen';
import Vevania from '../../Vevania/Vevania';

/**
 * The loading screen for Vevania
 */
export default class VevaniaLoadingScreen extends LoadingScreen
{
    constructor()
    {
        super();
        
        this.LevelToLoad = Vevania;
        this.backgroundImagePath = "/levels/LoadingScreens/VevaniaLoadingScreen/images/background.png";
    }
};