import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import ICamera from '../../../engines/GraphicEn/ICamera';

/**
 * Draws the level's road
 */
export default class LevelRoad
{
    protected kernel:IKernel;
    protected helpers:IHelpers;
    
    private _camera:ICamera;
    private _canvasCtx:CanvasRenderingContext2D;
    
    /**
     * Constructor
     */
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
    }
    
    /**
     * Loads the LevelRoad
     * @param canvasCtx The 2D canvas context
     * @param camera The game's camera
     */
    load(canvasCtx:CanvasRenderingContext2D, camera:ICamera):void
    {
        this._camera = camera;
        this._canvasCtx = canvasCtx;
    }
    
    /**
     * Draws the road
     * @param color the color of the road
     */
    draw(color:string):void
    {
        this._canvasCtx.lineWidth = 1;
        this._canvasCtx.fillStyle = color;
        this._canvasCtx.beginPath();
        this._canvasCtx.moveTo(this._camera.canvasPositionX, this._camera.canvasPositionY + this._camera.canvasPositionHeight);
        this._canvasCtx.lineTo(this.helpers.zCalc.vPointX, this.helpers.zCalc.vPointY);
        this._canvasCtx.lineTo(this._camera.canvasPositionX + this._camera.canvasPositionWidth, this._camera.canvasPositionY + this._camera.canvasPositionHeight);
        this._canvasCtx.fill();
    }
}