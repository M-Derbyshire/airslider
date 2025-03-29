import LoadingScreen from '../../LoadingScreen/LoadingScreen';
import TheConstruct from '../../TheConstruct/TheConstruct';

/**
 * The loading screen for Forurn
 */
export default class ForurnLoadingScreen extends LoadingScreen
{
    constructor()
	{
		super();
        
        this.LevelToLoad = TheConstruct;
        this.backgroundImagePath = "/levels/LoadingScreens/ForurnLoadingScreen/images/background.png";
	}
};