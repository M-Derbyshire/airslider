import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import ICamera from '../../../engines/GraphicEn/ICamera';

export default class LevelTunnel
{
    protected kernel:IKernel;
    protected helpers:IHelpers;
    
    private _camera:ICamera;
    
    /**
     * The sections of the tunnel
     */
    tunnel:ITunnelPart[];
    
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        this._camera;
        
        this.tunnel = [];
    }
    
    /**
     * Loads the level tunnel manager
     * @param camera the level's camera
     */
    load(camera)
    {
        this._camera = camera;
    }
    
    /**
     * Returns a new piece for a tunnel
     * @param image the image for the tunnel section. If null, an empty ("clear") piece will be drawn
     * @param length the the length (on the z axis) of the piece
     * @returns A new tunnel piece
     */
    newTunnelPart(image:HTMLImageElement|null, length:number = 1):ITunnelPart
    {
        return {
            z: this.helpers.zCalc.vPointDepth,
            length: length,
            image,
            active: false
        };
    }
    
    /**
     * Creates a tunnel to exist at the start of the level (the provided tunnel parts will be repeated 
     * until the tunnel spans the entire z axis)
     * @param parts the tunnel parts to use
     */
    createStartingTunnel(parts:ITunnelPart[]):void
    {
        let newZ = -parts[0].length;
        
        while(!this._isTunnelPopulatedToVanishingPoint())
        {
            const tunnelPartsCopy = parts.map(part => ({...part}));
            
            for(let i = 0; i < tunnelPartsCopy.length; i++)
            {
                tunnelPartsCopy[i].active = true;
                tunnelPartsCopy[i].z = newZ;
                this.tunnel.push(tunnelPartsCopy[i]);
                
                newZ += tunnelPartsCopy[i].length;
            }
        }
        
        
    }
	
    /**
     * Does the current tunnel span the entire z axis?
     * @returns true if the tunnel spans the whole z axis, false if not
     */
	private _isTunnelPopulatedToVanishingPoint():boolean
	{
        return (this.tunnel.length > 0 && this._getLastTunnelPart().z >= this.helpers.zCalc.vPointDepth)
	}
	
	
    /**
     * Adds more pieces to the tunnel (only does this if the tunnel is about to run out)
     * @param newTunnelParts the tunnel pieces to add to the tunnel
     */
    continueTunnel(newTunnelParts:ITunnelPart[]):void
    {
        if(this._isReadyToAddMoreParts())
        {
            for(let i = 0; i < newTunnelParts.length; i++)
            {
                this.tunnel.unshift(newTunnelParts[i]);
            }
        } 
		else if (!this._getLastTunnelPart().active)
        {
            this._getLastTunnelPart().active = true;
        }
    }
	
    /**
     * Is the tunnel is about to run out of pieces?
     * @returns if the tunnel is about to run out, true. Otherwise false
     */
	private _isReadyToAddMoreParts():boolean
	{
		return (this.tunnel.length === 0 || this.tunnel[0].active);
	}
	
    /**
     * Gets the last (closest) piece of the tunnel
     * @returns the last piece of the tunnel
     */
	private _getLastTunnelPart():ITunnelPart
	{
		return this.tunnel[this.tunnel.length - 1];
	}
	
    /**
     * Moves, and then draws, the tunnel
     * @param levelSpeed the z speed of the level
     */
    draw(levelSpeed:number):void
    {
        for(let i = 0; i < this.tunnel.length; i++)
        {
            if(this.tunnel[i].active)
            {
                const tunnelPart = this.tunnel[i];
    
                tunnelPart.z -= levelSpeed;
                this._drawTunnelPart(tunnelPart);
                
                this._handlePartsActivation(i);
                
                this._handlePartOutOfFrame(i);
            }
        }
    }
	
    /**
     * Draws a piece of the tunnel
     * @param tunnelPart the piece of the tunnel to draw
     */
	private _drawTunnelPart(tunnelPart:ITunnelPart):void
	{
		if(tunnelPart.image) //(null is a clear piece)
		{
			this.kernel.graphicEn.gameCtx.drawImage(
				tunnelPart.image, 
				this.helpers.zCalc.x(this._camera.canvasPositionX, tunnelPart.z, true), 
				this.helpers.zCalc.y(this._camera.canvasPositionY, tunnelPart.z, true), 
				this.helpers.zCalc.width(this._camera.canvasPositionWidth, tunnelPart.z, true), 
				this.helpers.zCalc.height(this._camera.canvasPositionHeight, tunnelPart.z, true)
			);
		}
	}
	
    /**
     * Handles the activication of a tunnel piece (if it's ready to be activated)
     * @param partIndex the index of the tunnel piece, in the this.tunnel array
     */
	private _handlePartsActivation(partIndex:number):void
	{
		if(partIndex > 0 && this._isTimeToActivatePreviousTunnelPart(partIndex))
		{
			const currentPart = this.tunnel[partIndex];
			const previousPart = this.tunnel[partIndex - 1];
			
			previousPart.active = true;
			previousPart.z = currentPart.z + currentPart.length;
		}
	}
	
    /**
     * Determines if the tunnel piece before the current one should be activated
     * @param currentPartIndex the index of a tunnel piece, in the this.tunnel array
     * @returns true if the tunnel piece before this index should be activated. False if not
     */
	private _isTimeToActivatePreviousTunnelPart(currentPartIndex:number):boolean
	{
		if(this.tunnel.length < 2) return false;
		
		const currentPart = this.tunnel[currentPartIndex];
		const previousPart = this.tunnel[currentPartIndex - 1];
		
		return (!previousPart.active && 
					(currentPart.z + currentPart.length) <= this.helpers.zCalc.vPointDepth);
	}
	
    /**
     * Handles a piece of the tunnel leaving the frame
     * @param partIndex the index of this piece of the tunnel, in the this.tunnel array
     */
	private _handlePartOutOfFrame(partIndex:number):void
	{
		if(this._isPartOutOfFrame(partIndex))
		{
			this.tunnel.pop();
		}
	}
	
    /**
     * Determines if a tunnel piece has left the frame
     * @param partIndex the index of this piece of the tunnel, in the this.tunnel array
     * @returns true if the tunnel piece is out of the frame, false if not
     */
	private _isPartOutOfFrame(partIndex:number):boolean
	{
		return (partIndex === this.tunnel.length - 1 && 
					this.tunnel[partIndex].z + this.tunnel[partIndex].length < 0);
	}
}

/**
 * A section of the tunnel
 */
export interface ITunnelPart {
    z:number; // z position
    length:number; // the length of the piece, on the z-axis
    image:HTMLImageElement|null; // the image for the tunnel piece (if null, this will be used as a "clear" piece)
    active:boolean; // is the piece currently active?
};