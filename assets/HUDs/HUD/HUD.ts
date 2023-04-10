import Kernel from '../../../Kernel/Kernel';
import IKernel from '../../../Kernel/IKernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import ICamera from '../../../engines/GraphicEn/ICamera';
import IHUDComponent from '../components/HUDComponent/IHUDComponent';
import IPointerEventManager from '../../levels/Level/IPointerEventManager';
import IModel from '../../models/Model/IModel';

/**
 * A level's Heads Up Display
 */
export default class HUD
{
    protected kernel: IKernel;
    protected helpers: IHelpers;
    protected camera: ICamera;
    protected components: IHUDComponent[];
    protected pointerEventManager: IPointerEventManager;
    protected assetsToUnload: string[];
    protected models: IModel[];
    
    /**
     * Constructor
     */
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.camera; //Set in load()
        
        this.components = []; //HUD components used by this HUD
        
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
    load(canvasCtx:CanvasRenderingContext2D, camera:ICamera, pointerEventManager:IPointerEventManager):void
    {
        this.camera = camera;
		this.pointerEventManager = pointerEventManager;
    }
    
    /**
     * Loads the HUD's components 
     * @param canvasCtx the 2D context from the HTML canvas element
     * @param camera the game's camera
     */
    loadComponents(canvasCtx:CanvasRenderingContext2D, camera:ICamera):void
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
    unload():void
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
        this.components.forEach(component => component.unload());
    }
    
    /**
     * Prepares the HUD before the level starts (does the same for any HUD components)
     */
    prepare():void
    {
        this.components.forEach(component => component.prepare());
    }
    
    /**
     * Draws the HUD (does the same for any HUD components)
     */
    draw():void
    {
        this.components.forEach(component => {
            if(component.active)
            {
                component.draw();
                
                if(component.text.content)
                    component.drawText();
            } 
        });
        
        if(this["extraDraw"] && typeof this["extraDraw"] === "function")
        {
            this["extraDraw"]();
        }
    }
}