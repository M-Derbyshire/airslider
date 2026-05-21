import Kernel from "../../../Kernel/Kernel";
import UnitHelper from "../../../Kernel/utils/UnitHelper";
import ASLevel from "./ASLevel";

/**
 * Manages the drawing of the level's road
 */
export default class LevelRoadManager
{
    /**
     * Draws the road
     * @param color the color of the road
     */
    draw(color:string):void
    {
        const kernel = Kernel.getInstance();
        const ctx = kernel.canvasContext;
        const level = kernel.level as ASLevel;
        const camera = kernel.graphicEngine.camera;
        
        const vanishPointX = camera.canvasPositionX + UnitHelper.xUnitsToPixels(level.vanishingPointX);
        const vanishPointY = camera.canvasPositionY + UnitHelper.yUnitsToPixels(level.vanishingPointY);
        
        const { x, y, width, height } = kernel.graphicEngine.getUnscaledDrawPositionsAndDimensions({
            x: 0,
            y: 0,
            width: kernel.settings.unitsWithinCameraX,
            height: kernel.settings.unitsWithinCameraY
        });
        
        const leftEdge = x;
        const rightEdge = x + width;
        const bottomEdge = y + height;
        
        ctx.lineWidth = 1;
        ctx.fillStyle = color;
        
        ctx.beginPath();
        ctx.moveTo(leftEdge, bottomEdge);
        ctx.lineTo(vanishPointX, vanishPointY);
        ctx.lineTo(rightEdge, bottomEdge);
        ctx.fill();
    }
}