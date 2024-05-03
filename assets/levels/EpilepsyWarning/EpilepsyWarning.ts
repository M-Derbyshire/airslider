import Level from '../Level/Level';
import WarningScreenTexts from '../../HUDs/WarningScreenTexts/WarningScreenTexts';
import { KernelStatus } from '../../../Kernel/KernelStatus';
import TheConstructLoadingScreen from '../LoadingScreens/TheConstructLoadingScreen/TheConstructLoadingScreen';

/**
 * A level that acts as a neurosensitivity warning
 */
export default class EpilepsyWarning extends Level
{
    private _backgroundColor:string = "#ffffaa";
    private _textColor:string = "#dd0000";
    private _titleText:string = "WARNING: Neurosensitivity/Epilepsy";
    private _bodyText:string = `This game contains flashing images.
It may potentially trigger seizures in people with photosensitive epilepsy.
Player discretion is advised.`;
    private _continueText:string = "Click Here To Continue";

    constructor()
	{
		super();
        
        this.HUD = new WarningScreenTexts(
            this._titleText, 
            this._bodyText,
            this._continueText,
            this._textColor,
            () => this.kernel.unloadCurrentLevel()
        );
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
        this.kernel.graphicEngine.camera.setColors(this._backgroundColor, "#000000");
        this.kernel.loadLevel(new TheConstructLoadingScreen());
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        // We don't want this level to pause (e.g. on the browser changing to another tab)
        if(this.kernel.status === KernelStatus.PrePaused)
            this.kernel.toggleGamePause();
    }
};