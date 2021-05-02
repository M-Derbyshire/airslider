import Kernel from '../../../kernel/Kernel';

class HUD
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this._camera; //Set in load()
        
        this.components = []; //HUD components included
        this.modelIndexes = []; //indexes of models used by this HUD
    }
    
    load(canvasCtx, camera)
    {
        this._camera = camera;
    }
    
    loadComponents(canvasCtx, camera)
    {
        for(let i = 0; i < this.components.length; i++)
        {
            this.components[i].load(canvasCtx, camera);
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