import IHUDComponent from '../../../Kernel/entities/HUDComponent/IHUDComponent';
import IHUD from './IHUD';
import IPointerEventManager from '../Level/IPointerEventManager';
import { IEntitySound } from '../types';
import IAssetHandler from '../../AssetHandler/IAssetHandler';
import ISoundEngine from '../../engines/SoundEngine/ISoundEngine';

/**
 * A level's Heads Up Display
 */
export default class HUD implements IHUD
{
    protected pointerEventManager:IPointerEventManager;
    protected components:IHUDComponent[]; //HUD components used by this HUD
    protected assetsToUnload:string[]; // File paths of assets that need to be released when this is unloaded
    protected sounds:IEntitySound[]; // Sounds that need to be added to the sound engine, during preparation
    
    /**
     * Constructor
     * @param pointerEventManager the level's PointerEventManager
     */
    constructor(pointerEventManager:IPointerEventManager)
    {
        this.pointerEventManager = pointerEventManager;
        
        this.components = [];
        this.assetsToUnload = [];
        this.sounds = [];
    }
    
    /**
     * Loads the HUD
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void {}
    
    /**
     * Loads the HUD's components
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    loadComponents(assetHandler:IAssetHandler):void
    {
        this.components.forEach(component => component.load(assetHandler));
    }
    
    /**
     * Unloads any assets that need to be unloaded by the HUD (triggers the same on any HUD components)
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    unload(assetHandler:IAssetHandler):void
    {
        this.assetsToUnload.forEach(asset => assetHandler.releaseAsset(asset));
        this.components.forEach(component => component.unload(assetHandler));
    }
    
    /**
     * Prepares the HUD before the level starts (triggers the same on any HUD components)
     * @param soundEngine the sound engine for the level
     */
    prepare(soundEngine:ISoundEngine):void
    {
        this.components.forEach(component => component.prepare());
        
        this.sounds.forEach(sound => soundEngine.addSound(sound.key, sound.asset));
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