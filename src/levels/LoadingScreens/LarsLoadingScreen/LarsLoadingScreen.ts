import Lars from '../../Lars/Lars';
import LoadingScreen from '../../LoadingScreen/LoadingScreen';

/**
 * The loading screen for Lars
 */
export default class LarsLoadingScreen extends LoadingScreen
{
    constructor()
    {
        super();
        
        this.LevelToLoad = Lars;
        this.backgroundImagePath = "/levels/LoadingScreens/LarsLoadingScreen/images/background.png";
    }
};