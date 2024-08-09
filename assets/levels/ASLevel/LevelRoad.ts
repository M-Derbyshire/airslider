import Kernel from "../../../Kernel/Kernel";

/**
 * Draws the level's road
 */
export default class LevelRoad
{
    private _canvasCtx:CanvasRenderingContext2D;
    
    /**
     * Loads the LevelRoad
     */
    load():void
    {
        this._canvasCtx = Kernel.getInstance().gameContext;
    }
    
    /**
     * Draws the road
     * @param color the color of the road
     */
    draw(color:string):void
    {
        this._canvasCtx.lineWidth = 1;
        this._canvasCtx.fillStyle = color;
        
        const kernel = Kernel.getInstance();
        const unitHelpers = kernel.helpers.unit;
        const zCalc = kernel.helpers.zCalc;
        const camera = kernel.graphicEngine.camera;
        
        const vanishPointX = camera.canvasPositionX + unitHelpers.xUnit(zCalc.vanishingPointX);
        const vanishPointY = camera.canvasPositionY + unitHelpers.yUnit(zCalc.vanishingPointY);
        
        const { x, y, width, height } = kernel.graphicEngine.getUnscaledDrawPositionsAndDimensions({
            x: 0,
            y: 0,
            width: kernel.unitsWithinCameraX,
            height: kernel.unitsWithinCameraY
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