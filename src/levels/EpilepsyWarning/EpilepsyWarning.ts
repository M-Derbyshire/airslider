import Level from '../../../Kernel/entities/Level/Level';
import WarningScreenTexts from '../../HUDs/WarningScreenTexts/WarningScreenTexts';
import Kernel from '../../../Kernel/Kernel';
import { KernelStatus } from '../../../Kernel/IKernel';
import ForurnLoadingScreen from '../LoadingScreens/ForurnLoadingScreen/ForurnLoadingScreen';

/**
 * A level that acts as a photosensitivity warning
 */
export default class EpilepsyWarning extends Level
{
    private _backgroundColor:string = "#ffffaa";
    private _textColor:string = "#dd0000";
    private _titleText:string = "WARNING: Photosensitivity/Epilepsy";
    private _bodyText:string = `This game contains flashing imagery.
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
            () => Kernel.getInstance().unloadCurrentLevel()
        );
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();
        
        const kernel = Kernel.getInstance();
        
        kernel.graphicEngine.camera.setColors(this._backgroundColor, "#000000");
        kernel.loadLevel(new ForurnLoadingScreen());
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();
        
        const kernel = Kernel.getInstance();
        
        // We don't want this level to pause (e.g. on the browser changing to another tab)
        if(kernel.status === KernelStatus.PrePaused)
            kernel.toggleGamePause();
    }
};