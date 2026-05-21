import Level from '../../../Kernel/entities/Level/Level';
import WarningScreenTexts from '../../HUDs/WarningScreenTexts/WarningScreenTexts';
import Kernel from '../../../Kernel/Kernel';
import ForurnLoadingScreen from '../LoadingScreens/ForurnLoadingScreen/ForurnLoadingScreen';
import FrameManager from '../../../Kernel/engines/GraphicEngine/FrameManager';
import ModelEventManager from '../../../Kernel/entities/Level/ModelEventManager';
import PointerEventManager from '../../../Kernel/entities/Level/PointerEventManager';
import KeyboardEventManager from '../../../Kernel/entities/Level/KeyboardEventManager';
import IFrameManager from '../../../Kernel/engines/GraphicEngine/IFrameManager';
import IModelEventManager from '../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../Kernel/entities/Level/IPointerEventManager';
import IKeyboardEventManager from '../../../Kernel/entities/Level/IKeyboardEventManager';

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

    /**
     * Constructor
     * @param frameManager The frame manager for the level
     * @param modelEventManager Manages the event monitoring between models
     * @param pointerEventManager Manages any events relating to mouse clicks
     * @param keyboardEventManager Manages any keyboard events
     */
    constructor(
        frameManager:IFrameManager,
        modelEventManager:IModelEventManager,
        pointerEventManager:IPointerEventManager,
        keyboardEventManager:IKeyboardEventManager
    )
	{
		super(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);
        
        this.isPauseable = false;
        
        this.HUD = new WarningScreenTexts(
            pointerEventManager,
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
    prepare()
    {
        super.prepare();
        
        const kernel = Kernel.getInstance();
        const camera = kernel.graphicEngine.camera;
        
        camera.setColors(this._backgroundColor, "#000000");
        
        const nextLevel = new ForurnLoadingScreen(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(kernel.canvasContext.canvas),
            new KeyboardEventManager()
        );
        kernel.loadLevel(nextLevel);
    }
};