class HUDComponent
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        //Set in load(). 
        this._ctx; //The canvas context
        this._camera;
    }
    
    load(canvasCtx, camera)
    {
        this._ctx = canvasCtx;
        this._camera = camera;
    }
    
    //meant to be overriden
    draw(){}
}