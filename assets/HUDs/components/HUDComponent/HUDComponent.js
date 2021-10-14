import Kernel from '/kernel/kernel';

export default class HUDComponent
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        //Set in load(). 
        this._ctx; //The canvas context
        this._camera;
		
		this.x;
        this.y;
        this.width;
        this.height;
    }
    
    load(canvasCtx, camera)
    {
        this._ctx = canvasCtx;
        this._camera = camera;
    }
    
    //meant to be overriden
    draw(){}
	
	isPointerOverlapping(pointX, pointY)
	{
		const xUnit = this.helpers.unit.xUnit.bind(this.helpers.unit);
		const yUnit = this.helpers.unit.yUnit.bind(this.helpers.unit);
		
		return (
			pointX > xUnit(this.x) && pointX < (xUnit(this.x) + xUnit(this.width)) && 
			pointY > yUnit(this.y) && pointY < (yUnit(this.y) + yUnit(this.height))
		);
	}
}