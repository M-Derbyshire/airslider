import Level from '../../Level/Level';
import CreditsHUD from '../../../HUDs/CreditsHUD/CreditsHUD';

/**
 * The level for the Credits screen
 */
export default class Credits extends Level
{
    constructor()
	{
		super();
        
        this.HUD = new CreditsHUD();
	}
};