import Coratune from '../../Coratune/Coratune';
import LoadingScreen from '../../LoadingScreen/LoadingScreen';

/**
 * The loading screen for Coratune
 */
export default class CoratuneLoadingScreen extends LoadingScreen
{
    constructor()
    {
        super();
        
        this.LevelToLoad = Coratune;
        this.backgroundImagePath = "/levels/LoadingScreens/CoratuneLoadingScreen/images/background.png";
    }
};