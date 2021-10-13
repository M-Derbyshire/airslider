import Kernel from '/kernel/kernel';

export default class HUD
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this._camera; //Set in load()
        
        this.components = []; //HUD components included
        this.models = []; //models used by this HUD
		this._pointerEventManager;
    }
    
    load(canvasCtx, camera, pointerEventManager)
    {
        this._camera = camera;
		this._pointerEventManager = pointerEventManager;
    }
    
    loadComponents(canvasCtx, camera)
    {
        for(let i = 0; i < this.components.length; i++)
        {
            this.components[i].load(canvasCtx, camera);
			
			if(this._pointerEventManager.addPointerEventSubject)
				this._pointerEventManager.addPointerEventSubject(this.components[i]);
        }
    }
    
    draw()
    {
        for(let i = 0; i < this.components.length; i++)
        {
            this.components[i].draw();
        }
        
        if(this.extraDraw)
        {
            this.extraDraw();
        }
    }
}