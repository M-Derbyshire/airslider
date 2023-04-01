import Kernel from '/Kernel/kernel';

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
        
        this._assetsToUnload = []; // file paths of assets that need to be released when this is unloaded
    }
    
    load(canvasCtx, camera, pointerEventManager)
    {
        this._camera = camera;
		this._pointerEventManager = pointerEventManager;
    }
    
    loadComponents(canvasCtx, camera)
    {
        this.components.forEach(component => {
            component.load(canvasCtx, camera);
			
			if(this._pointerEventManager.addPointerEventSubject)
				this._pointerEventManager.addPointerEventSubject(component);
        });
    }
    
    //If implementing your own unload in a child class, be sure to call this with super.unload()
    unload()
    {
        this._assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
        this.components.forEach(component => component.unload());
    }
    
    prepare()
    {
        this.components.forEach(component => component.prepare());
    }
    
    draw()
    {
        this.components.forEach(component => {
            if(component.active)
            {
                component.draw();
                
                if(component.text.text)
                    component.drawText();
            } 
        });
        
        if(this.extraDraw)
        {
            this.extraDraw();
        }
    }
}