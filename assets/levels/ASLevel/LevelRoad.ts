import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';

/**
 * Draws the level's road
 */
export default class LevelRoad
{
    protected kernel:IKernel;
    protected helpers:IHelpers;
    
    private _canvasCtx:CanvasRenderingContext2D;
    
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
    }
    
    /**
     * Loads the LevelRoad
     */
    load():void
    {
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
        
        const vanishPointX = this.helpers.zCalc.vPointX;
        const vanishPointY = this.helpers.zCalc.vPointY;
        
        const unitsWithinCamera = this.kernel.unitsWithinCamera;
        const { x, y, width, height } = this.kernel.graphicEngine.getUnscaledDrawPositionsAndDimensions({
            x: 0,
            y: 0,
            width: unitsWithinCamera,
            height: unitsWithinCamera
        });
        
        const leftEdge = x;
        const rightEdge = x + width;
        const bottomEdge = y + height;
        
        this._canvasCtx.beginPath();
        this._canvasCtx.moveTo(leftEdge, bottomEdge);
        this._canvasCtx.lineTo(vanishPointX, vanishPointY);
        this._canvasCtx.lineTo(rightEdge, bottomEdge);
        this._canvasCtx.fill();
    }
}