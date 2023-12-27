import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import ICamera from '../../../engines/GraphicEngine/ICamera';

/**
 * Draws the level's road
 */
export default class LevelRoad
{
    protected kernel:IKernel;
    protected helpers:IHelpers;
    
    private _camera:ICamera;
    private _canvasCtx:CanvasRenderingContext2D;
    
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
    }
    
    /**
     * Loads the LevelRoad
     * @param camera The level's camera
     */
    load(camera:ICamera):void
    {
        this._camera = camera;
        this._canvasCtx = this.kernel.gameContext;
    }
    
    /**
     * Draws the road
     * @param color the color of the road
     */
    draw(color:string):void
    {
        this._canvasCtx.lineWidth = 1;
        this._canvasCtx.fillStyle = color;
        
        const leftEdge = this._camera.canvasPositionX;
        const rightEdge = this._camera.canvasPositionX + this._camera.canvasPositionWidth;
        const bottomEdge = this._camera.canvasPositionY + this._camera.canvasPositionHeight;
        const vanishPointX = this.helpers.zCalc.vPointX;
        const vanishPointY = this.helpers.zCalc.vPointY;
        
        this._canvasCtx.beginPath();
        this._canvasCtx.moveTo(leftEdge, bottomEdge);
        this._canvasCtx.lineTo(vanishPointX, vanishPointY);
        this._canvasCtx.lineTo(rightEdge, bottomEdge);
        this._canvasCtx.fill();
    }
}