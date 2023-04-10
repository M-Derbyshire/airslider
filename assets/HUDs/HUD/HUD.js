import Kernel from '/Kernel/kernel';

/**
 * A level's Heads Up Display
 */
export default class HUD
{
    /**
     * Constructor
     */
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.camera; //Set in load()
        
        this.components = []; //HUD components used by this HUD
        
		this.pointerEventManager;
        
        this.assetsToUnload = []; // file paths of assets that need to be released when this is unloaded
        
        /**
         * Models that can be referenced by the HUD components
         */
        this.models = [];
    }
    
    /**
     * Loads the HUD
     * @param canvasCtx the 2D context from the HTML canvas element
     * @param camera the game's camera
     * @param pointerEventManager the level's PointerEventManager
     */
    load(canvasCtx, camera, pointerEventManager)
    {
        this.camera = camera;
		this.pointerEventManager = pointerEventManager;
    }
    
    /**
     * Loads the HUD's components 
     * @param canvasCtx the 2D context from the HTML canvas element
     * @param camera the game's camera
     */
    loadComponents(canvasCtx, camera)
    {
        this.components.forEach(component => {
            component.load(canvasCtx, camera);
			
			if(this.pointerEventManager.addPointerEventSubject)
				this.pointerEventManager.addPointerEventSubject(component);
        });
    }
    
    /**
     * Unloads any assets that need to be unloaded by the HUD (does the same for any HUD components)
     */
    unload()
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
        this.components.forEach(component => component.unload());
    }
    
    /**
     * Prepares the HUD before the level starts (does the same for any HUD components)
     */
    prepare()
    {
        this.components.forEach(component => component.prepare());
    }
    
    /**
     * Draws the HUD (does the same for any HUD components)
     */
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