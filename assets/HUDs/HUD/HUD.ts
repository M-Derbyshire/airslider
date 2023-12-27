import Kernel from '../../../Kernel/Kernel';
import IKernel from '../../../Kernel/IKernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import ICamera from '../../../engines/GraphicEngine/ICamera';
import IHUDComponent from '../components/HUDComponent/IHUDComponent';
import IPointerEventManager from '../../levels/Level/IPointerEventManager';
import IModel from '../../models/Model/IModel';
import IHUD from './IHUD';

/**
 * A level's Heads Up Display
 */
export default class HUD implements IHUD
{
    protected kernel: IKernel;
    protected helpers: IHelpers;
    protected camera: ICamera;
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
     * @param camera the level's camera
     * @param pointerEventManager the level's PointerEventManager
     */
    load(camera:ICamera, pointerEventManager:IPointerEventManager):void
    {
        this.camera = camera;
		this.pointerEventManager = pointerEventManager;
    }
    
    /**
     * Loads the HUD's components 
     */
    loadComponents():void
    {
        this.components.forEach(component => {
            component.load(this.camera);
            this.pointerEventManager.addPointerEventSubject(component);
        });
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
        this.components.forEach(component => component.prepare());
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