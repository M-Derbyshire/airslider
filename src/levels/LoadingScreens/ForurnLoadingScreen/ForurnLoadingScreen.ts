import Forurn from '../../Forurn/Forurn';
import LoadingScreen from '../../LoadingScreen/LoadingScreen';

/**
 * The loading screen for Forurn
 */
export default class ForurnLoadingScreen extends LoadingScreen
{
    constructor()
	{
		super();
        
        this.LevelToLoad = Forurn;
        this.backgroundImagePath = "/levels/LoadingScreens/ForurnLoadingScreen/images/background.png";
	}
};