import Kernel from "../../../Kernel/Kernel";
import UnitHelper from "../../../Kernel/utils/UnitHelper";
import ASLevel from "./ASLevel";

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
        const level = kernel.level as ASLevel;
        const camera = kernel.graphicEngine.camera;
        
        const vanishPointX = camera.canvasPositionX + UnitHelper.xUnit(level.vanishingPointX);
        const vanishPointY = camera.canvasPositionY + UnitHelper.yUnit(level.vanishingPointY);
        
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