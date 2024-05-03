import Kernel from '../../../Kernel/Kernel';
import IKernel from '../../../Kernel/IKernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import IHUDComponent from '../components/HUDComponent/IHUDComponent';
import IPointerEventManager from '../../levels/Level/IPointerEventManager';
import IHUD from './IHUD';

/**
 * A level's Heads Up Display
 */
export default class HUD implements IHUD
{
    protected kernel: IKernel;
    protected helpers: IHelpers;
    protected pointerEventManager: IPointerEventManager;
    protected components: IHUDComponent[]; //HUD components used by this HUD
    protected assetsToUnload: string[]; // File paths of assets that need to be released when this is unloaded
    
    /**
     * Constructor
     */
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.components = [];
        this.assetsToUnload = [];
    }
    
    /**
     * Loads the HUD
     * @param pointerEventManager the level's PointerEventManager
     */
    load(pointerEventManager:IPointerEventManager):void
    {
		this.pointerEventManager = pointerEventManager;
    }
    
    /**
     * Loads the HUD's components 
     */
    loadComponents():void
    {
        this.components.forEach(component => component.load());
    }
    
    /**
     * Unloads any assets that need to be unloaded by the HUD (triggers the same on any HUD components)
     */
    unload():void
    {
        this.assetsToUnload.forEach(asset => this.kernel.releaseAsset(asset));
        this.components.forEach(component => component.unload());
        this.pointerEventManager.removeEventHandlers();
    }
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     */
    prepare():void
    {
        this.components.forEach(component => {
            component.prepare();
            this.pointerEventManager.addPointerEventSubject(component);
        });
    }
    
    /**
     * Draws the HUD (triggers the same on any HUD components)
     */
    draw():void
    {
        this.components.forEach(component => {
            if(component.active)
            {
                component.draw();
                if(component.text.content) component.drawText();
            } 
        });
    }
}