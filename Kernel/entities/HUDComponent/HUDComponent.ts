import IHUDComponent from './IHUDComponent';
import Kernel from '../../Kernel';
import { ITextContent } from '../../engines/GraphicEngine/IGraphicEngine';
import { IEntitySound } from '../types';
import IAssetHandler from '../../AssetHandler/IAssetHandler';
import ISoundEngine from '../../engines/SoundEngine/ISoundEngine';

/**
 * A component to be displayed by the Heads Up Display
 */
export default class HUDComponent implements IHUDComponent
{
    protected assetsToUnload:string[]; // File paths of assets that need to be released when this is unloaded
    protected sounds:IEntitySound[]; // Sounds that need to be added to the sound engine, during preparation
    
    /**
     * The x coordinate of this component (in units)
     */
    x:number;
    
    /**
     * The y coordinate of this component (in units)
     */
    y:number;
    
    /**
     * The width of this component (in units)
     */
    width:number;
    
    /**
     * The height of this component (in units)
     */
    height:number;
    
    /**
     * Is this component active?
     */
    active:boolean;
    
    /**
     * The text content to be displayed with the component
     */
    text:ITextContent;
    
    
    constructor()
    {
        this.assetsToUnload = [];
        this.sounds = [];
        
        this.active = true;
    }
    
    /**
     * Prepares the component before the level starts
     * @param soundEngine the sound engine for the level
     */
    prepare(soundEngine:ISoundEngine):void
    {
        this.text = {
            content: "",
            x: 0, // In units
            y: 0, // In units
            size: 30, // in pixels
            font: "Arial",
            color: "red",
            style: "bolder", // See the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
            alignment: "left",
            lineGap: 0
        };
        
        this.sounds.forEach(sound => soundEngine.addSound(sound.key, sound.asset));
    }
    
    /**
     * Loads the component
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    load(assetHandler:IAssetHandler):void {}
    
    /**
     * Unloads any assets that need to be unloaded by the component
     * @param assetHandler the game's asset handler (an object that allows you to load images/audio assets)
     */
    unload(assetHandler:IAssetHandler):void
    {
        this.assetsToUnload.forEach(asset => assetHandler.releaseAsset(asset));
    }
    
    /**
     * Draws the text content setup within this component
     */
    drawText():void
    {
        Kernel.getInstance().graphicEngine.drawText(
            this.text,
            {
                x: this.x,
                y: this.y,
                z: 0
            },
            "static"
        );
    }
    
    /**
     * Draws the component
     */
    draw():void {}
	
    /**
     * Is the mouse pointer overlapping this component?
     * @param pointX the x position (within the canvas's space) of the mouse pointer 
     * @param pointY the y position (within the canvas's space) of the mouse pointer
     * @returns true if it is overlapping, false if not
     */
	isPointerOverlapping(pointX:number, pointY:number):boolean
	{
        if(this.width === 0 || this.height === 0)
            return false;
        
        const { x, y, width, height } = Kernel.getInstance().graphicEngine.getStaticDrawPositionsAndDimensions({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
        
        return (
			pointX >= x && 
            pointX <= (x + width) && 
			pointY >= y && 
            pointY <= (y + height)
		);
	}
}