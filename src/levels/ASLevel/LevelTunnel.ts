import Kernel from "../../../Kernel/Kernel";
import ASLevel from "./ASLevel";

/**
 * Manages the level's tunnels
 */
export default class LevelTunnel
{
    tunnel:ITunnelPart[]; // The pieces of the tunnel
    
    constructor()
    {   
        this.tunnel = [];
    }
    
    /**
     * Creates a tunnel that can exist at the opening of the level (the provided tunnel parts will be repeated 
     * until the tunnel spans the entire Z-axis)
     * @param parts the tunnel parts to use
     */
    createStartingTunnel(parts:INewTunnelPart[]):void
    {
        if(parts.length === 0)
            return;
        
        const vanishingPointDepth = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
        let newZ = 0;
        
        do
        {
            parts.forEach(part => {
                const copy = { ...part } as ITunnelPart;
                
                copy.active = true;
                copy.zPosition = newZ;
                this.tunnel.push(copy);
                
                newZ += copy.length;
            });
        } while(this._getFarthestTunnelPart().zPosition < vanishingPointDepth);
    }
    
    /**
     * Adds more pieces to the tunnel (only does this if the tunnel is about to run out)
     * @param newTunnelParts the pieces to add to the tunnel
     */
    continueTunnel(newTunnelParts:INewTunnelPart[]):void
    {
        if(this._isReadyToAddMoreParts())
            newTunnelParts.forEach(tunnelPart => {
                this._setTunnelPartDefaults(tunnelPart as ITunnelPart);
                this.tunnel.push(tunnelPart as ITunnelPart);
            });
    }
    
    /**
     * Moves, and then draws, the pieces of the tunnel
     * @param levelSpeed the Z-axis speed of the level
     */
    draw(levelSpeed:number):void
    {
        const lastTunnelIdx = this.tunnel.length - 1;
        
        // We want to draw from the farthest, to the closest
        for(let i = lastTunnelIdx; i >= 0; i--)
        {
            const part = this.tunnel[i];
            
            if(!part.active && this._tunnelPartShouldBeActivated(i))
                part.active = true;
            
            if(part.active)
            {
                part.zPosition -= levelSpeed;
                
                if(i === 0 && this._isPartOutOfFrame(part))
                    this.tunnel.shift();
                else
                    this._drawTunnelPart(part);
            }
        }
    }
    
    /**
     * Sets the default values on the given tunnel piece
     * @param part the piece to set the defaults on
     */
    private _setTunnelPartDefaults(part:ITunnelPart):void
    {
        const vanishingPointDepth = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
        
        part.active = false;
        part.zPosition = vanishingPointDepth;
    }
	
    /**
     * Is the tunnel about to run out of parts?
     * @returns if the tunnel is about to run out, true. Otherwise false
     */
	private _isReadyToAddMoreParts():boolean
	{
		return (this.tunnel.length === 0 || this._getFarthestTunnelPart().active);
	}
	
    /**
     * Gets the last (farthest) piece of the tunnel
     * @returns the last piece of the tunnel (or null, if there are none)
     */
	private _getFarthestTunnelPart():ITunnelPart|null
	{
        if(this.tunnel.length === 0)
            return null;
        
		return this.tunnel[this.tunnel.length - 1];
	}
	
    /**
     * Draws a piece of the tunnel
     * @param part the piece of the tunnel to draw
     */
	private _drawTunnelPart(part:ITunnelPart):void
	{
        if(!part.image) // a null image is a "clear" piece
            return;
        
        const kernel = Kernel.getInstance();
        
        const { x, y, width, height } = kernel.graphicEngine.getScaledDrawPositionsAndDimensions({
            x: 0,
            y: 0,
            width: kernel.settings.unitsWithinCameraX,
            height: kernel.settings.unitsWithinCameraY,
            z: part.zPosition
        }, true);
        
        kernel.canvasContext.drawImage(part.image, x, y, width, height);
	}
    
    /**
     * Determines if a tunnel piece is behind the camera
     * @param part the piece of the tunnel
     * @returns true if the tunnel piece is out of the frame, false if not
     */
	private _isPartOutOfFrame(part:ITunnelPart):boolean
	{
		return (part.zPosition + part.length) < 0;
	}
	
    /**
     * Should an inactive part of the tunnel be activated?
     * @param partIdx the index of the part
     * @returns true if the part should be activated, or false if not
     */
    private _tunnelPartShouldBeActivated(partIdx:number):boolean
    {
        const previousPartIdx = partIdx - 1;
        
		if(previousPartIdx < 0)
            return true;
        
		const previousPart = this.tunnel[previousPartIdx];
        const vanishingPointDepth = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
        
		return (
            previousPart.active && 
            (previousPart.zPosition + previousPart.length) <= vanishingPointDepth
        );
    }
}

/**
 * A piece of a tunnel
 */
interface ITunnelPart {
    zPosition:number; // Z-axis position
    length:number; // the length of the piece, on the Z-axis
    image:HTMLImageElement|null; // the image for the tunnel piece (if null, this will be used as a "clear" piece)
    active:boolean; // is the piece currently active?
};

/**
 * A new piece to be added to the tunnel
 */
export type INewTunnelPart = Omit<ITunnelPart, "zPosition"|"active">;