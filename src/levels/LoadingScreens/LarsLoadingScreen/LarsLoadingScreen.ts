import Forurn from '../../Forurn/Forurn';
import LoadingScreen from '../../LoadingScreen/LoadingScreen';

/**
 * The loading screen for Lars
 */
export default class LarsLoadingScreen extends LoadingScreen
{
    constructor()
    {
        super();
        
        this.LevelToLoad = Forurn;
        this.backgroundImagePath = "/levels/LoadingScreens/LarsLoadingScreen/images/background.png";
    }
};