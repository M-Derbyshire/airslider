import Lars from '../../Lars/Lars';
import LoadingScreen from '../../LoadingScreen/LoadingScreen';

/**
 * The loading screen for Neonus
 */
export default class NeonusLoadingScreen extends LoadingScreen
{
    constructor()
    {
        super();
        
        this.LevelToLoad = Lars;
        this.backgroundImagePath = "/levels/LoadingScreens/NeonusLoadingScreen/images/background.png";
    }
};