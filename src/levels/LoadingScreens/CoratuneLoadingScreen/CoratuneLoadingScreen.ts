import LoadingScreen from '../../LoadingScreen/LoadingScreen';
import Vevania from '../../Vevania/Vevania';

/**
 * The loading screen for Coratune
 */
export default class CoratuneLoadingScreen extends LoadingScreen
{
    constructor()
    {
        super();
        
        this.LevelToLoad = Vevania;
        this.backgroundImagePath = "/levels/LoadingScreens/CoratuneLoadingScreen/images/background.png";
    }
};