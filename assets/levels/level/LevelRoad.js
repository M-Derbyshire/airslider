import Kernel from '../../../kernel/Kernel';

class LevelRoad
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        //Set in load
        this._camera;
        this._canvasCtx;
    }
    
    load(canvasCtx, camera)
    {
        this._camera = camera;
        this._canvasCtx = canvasCtx;
    }
    
    draw(color)
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