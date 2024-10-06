import LoadingScreen from '../../LoadingScreen/LoadingScreen';
import TheConstruct from '../../TheConstruct/TheConstruct';

/**
 * The loading screen for TheConstruct
 */
export default class TheConstructLoadingScreen extends LoadingScreen
{
    constructor()
	{
		super();
        
        this.LevelToLoad = TheConstruct;
        this.backgroundImagePath = "/levels/LoadingScreens/TheConstructLoadingScreen/images/background.png";
	}
};