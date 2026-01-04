import Level from '../../../../Kernel/entities/Level/Level';
import CreditsHUD from '../../../HUDs/CreditsHUD/CreditsHUD';

/**
 * The level for the Credits screen
 */
export default class Credits extends Level
{
    constructor()
	{
		super();
		
		this.isPauseable = false;
        
        this.HUD = new CreditsHUD();
	}
};