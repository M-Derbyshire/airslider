import Level from '../../../../Kernel/entities/Level/Level';
import IFrameManager from '../../../../Kernel/engines/GraphicEngine/IFrameManager';
import IGraphicEngine, { IDrawDimensions, IDrawPositions } from '../../../../Kernel/engines/GraphicEngine/IGraphicEngine';
import IModelEventManager from '../../../../Kernel/entities/Level/IModelEventManager';
import IPointerEventManager from '../../../../Kernel/entities/Level/IPointerEventManager';
import IKeyboardEventManager from '../../../../Kernel/entities/Level/IKeyboardEventManager';
import IAssetHandler from '../../../../Kernel/AssetHandler/IAssetHandler';
import ZCalc from '../../../../Kernel/utils/ZCalc/ZCalc';
import SelfVanishingPointStrategy from '../../../../Kernel/utils/ZCalc/strategies/SelfVanishingPointStrategy';
import LinearVanishingPointStrategy from '../../../../Kernel/utils/ZCalc/strategies/LinearVanishingPointStrategy';
import Kernel from '../../../../Kernel/Kernel';
import UnitHelper from '../../../../Kernel/utils/UnitHelper';
import MusicManager from '../../ASLevel/MusicManager';
import EndingCutsceneHUD from '../../../HUDs/EndingCutsceneHUD/EndingCutsceneHUD';

/**
 * Closing cutscene of the game
 */
export default class EndingCutscene extends Level
{
    private _backgroundColor:string; // The color of the background;

    private _fadeInSpeed:number; // Controls how quickly the image on the scene should fade in
    private _fadeInStartMS:number; // Controls when the fade-in/movement sequence should start (millisecond value)

    private _winnersImage!:HTMLImageElement; // The image of the championship winners
    private _winnersImagePositions:IDrawPositions&{z:number}; // The position values for the winners image
    private _winnersImageDimensions:IDrawDimensions; // The dimension values for the winners image
    private _winnersImageSpeed:number; // Controls how quickly the winners image moves on the Z-axis
    private _winnersImageOpactiy:number; // Controls the opacity of the winners image

    private _sequenceStarted:boolean; // Has the fade-in/movement sequence started?

    private _musicManager:MusicManager; // Manages the scene's music
    private _maxMusicVolume:number; // The maximum volume of the music
    private _sceneMusicFilepath:string; // The filepath to the scene's music
    private _sceneMusicFadeOutStartMS:number; // Controls when the scene's music should start fading out (millisecond value)
    private _sceneMusicFadeOutStarted:boolean; // Has the music fade out started?

    private _creditsButtonDisplayTimeMS:number; // Controls when the credits button (in the HUD) will be displayed (MS value)

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

        this.HUD = new EndingCutsceneHUD(pointerEventManager);

        this._winnersImagePositions = {
            x: 0,
            y: 0,
            z: 0
        };
        this._winnersImageDimensions = {
            width: 0,
            height: 0
        };
        this._winnersImageSpeed = 0;
        this._winnersImageOpactiy = 0;

        this._backgroundColor = "#000018";
        this._fadeInSpeed = 0;
        this._fadeInStartMS = 5000;

        this._sequenceStarted = false;

        this._musicManager = new MusicManager();
        this._maxMusicVolume = 0.5;
        this._sceneMusicFilepath = "/levels/ASLevel/music/airslider_track_1.mp3";
        this._sceneMusicFadeOutStartMS = 30000;
        this._sceneMusicFadeOutStarted = false;

        this._creditsButtonDisplayTimeMS = 10000;
	}
    
    /**
     * Loads the level's assets
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
	load(assetHandler:IAssetHandler):void
	{
		super.load(assetHandler);

        const winnersImgPath = "/levels/cutscenes/EndingCutscene/images/winners.png";
        this._winnersImage = assetHandler.loadImage(winnersImgPath);

        this._musicManager.load([this._sceneMusicFilepath]);
        
        this.assetsToUnload.push(winnersImgPath, this._sceneMusicFilepath);
	}
    
    /**
     * Prepares the level, before the gameplay starts
     */
    prepare():void
    {
        super.prepare();

        const kernel = Kernel.getInstance();
        const camera = kernel.graphicEngine.camera;

        camera.setColors(this._backgroundColor, "black");

        const zCalcStrategy = new SelfVanishingPointStrategy(new LinearVanishingPointStrategy());
        zCalcStrategy.vanishingPointDepth = 1000;
        ZCalc.setStrategy(zCalcStrategy);

        this._winnersImagePositions = {
            x: 300,
            y: 50,
            z: 50
        };

        this._winnersImageDimensions = {
            width: 400,
            height: 800
        };

        this._winnersImageSpeed = 15;
        this._fadeInSpeed = 0.2;

        this._winnersImageOpactiy = 0;

        this._sequenceStarted = false;
        this._sceneMusicFadeOutStarted = false;

        this._musicManager.prepare(this._maxMusicVolume);
        (this.HUD as EndingCutsceneHUD).disableNavigation();
    }
    
    /**
     * Runs the level's actions.
     */
    act():void
    {
        super.act();

        const totalTimeMS = Kernel.getInstance().totalLevelActiveMilliseconds;

        if(!this._sequenceStarted)
        {
            this._musicManager.startFadeInProcess();
            this._sequenceStarted = true;
        }
        
        if(this._sequenceStarted && totalTimeMS > this._fadeInStartMS)
        {
            if(this._winnersImagePositions.z > 0)
                this._moveWinnersImage();

            if(this._winnersImageOpactiy < 1)
                this._fadeInWinnersImage();
        }

        if(totalTimeMS > this._creditsButtonDisplayTimeMS)
            (this.HUD as EndingCutsceneHUD).enableNavigation();

        if(totalTimeMS > this._sceneMusicFadeOutStartMS && !this._sceneMusicFadeOutStarted)
            this._musicManager.startFadeOutProcess();

        this._musicManager.act();
    }
    
    /**
     * Draws anything that needs to be in the back (before the models) of the level
     * @param graphicEngine the graphic engine for the level
     * @param canvasContext the 2D context from the HTML canvas element
     */
    drawBack(graphicEngine:IGraphicEngine, canvasContext:CanvasRenderingContext2D):void
    {
        super.drawBack(graphicEngine, canvasContext);
        
        const { x, y, width, height } = graphicEngine.getScaledDrawPositionsAndDimensions({
            ...this._winnersImagePositions,
            ...this._winnersImageDimensions
        });

        // The opacity (globalAlpha) will make the image appear to fade in
        const originalAlpha = canvasContext.globalAlpha;
        canvasContext.globalAlpha = this._winnersImageOpactiy;

        canvasContext.drawImage(this._winnersImage, x, y, width, height);

        canvasContext.globalAlpha = originalAlpha;
    }

    /**
     * Moves the winner image along the Z-axis
     */
    private _moveWinnersImage()
    {
        const speed = UnitHelper.consistentSpeed(this._winnersImageSpeed);

        let newZ = this._winnersImagePositions.z - speed;

        if(newZ < 0)
            newZ = 0;

        this._winnersImagePositions.z = newZ;
    }

    /**
     * Fades in the winners image
     */
    private _fadeInWinnersImage()
    {
        const speed = UnitHelper.consistentSpeed(this._fadeInSpeed);

        let newOpacity = this._winnersImageOpactiy + speed;

        if(newOpacity > 1)
            newOpacity = 1;

        this._winnersImageOpactiy = newOpacity;
    }
};