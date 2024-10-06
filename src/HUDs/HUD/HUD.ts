import IHUDComponent from '../components/HUDComponent/IHUDComponent';
import IPointerEventManager from '../../levels/Level/IPointerEventManager';
import IHUD from './IHUD';
import Kernel from '../../../Kernel/Kernel';

/**
 * A level's Heads Up Display
 */
export default class HUD implements IHUD
{
    protected pointerEventManager: IPointerEventManager;
    protected components: IHUDComponent[]; //HUD components used by this HUD
    protected assetsToUnload: string[]; // File paths of assets that need to be released when this is unloaded
    
    /**
     * Constructor
     */
    constructor()
    {
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
        this.assetsToUnload.forEach(asset => Kernel.getInstance().releaseAsset(asset));
        this.components.forEach(component => component.unload());
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
                if(component.text.content)
                    component.drawText();
            } 
        });
    }
}