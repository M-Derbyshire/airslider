import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import ICamera from '../../../engines/GraphicEn/ICamera';

/**
 * Manages the level's tunnels
 */
export default class LevelTunnel
{
    protected kernel:IKernel;
    protected helpers:IHelpers;
    
    private _camera:ICamera;
    
    tunnel:ITunnelPart[]; // The sections of the tunnel
    
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.tunnel = [];
    }
    
    /**
     * Loads the tunnel manager
     * @param camera the level's camera
     */
    load(camera:ICamera)
    {
        this._camera = camera;
    }
    
    /**
     * Creates a new piece for a tunnel
     * @param image the image for the tunnel section. If null, there will be an empty space (a "clear piece")
     * @param length the length (on the z axis) of the piece
     * @returns A new piece of tunnel
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
     * Creates a tunnel that exists at the opening of the level (the provided tunnel parts will be repeated 
     * until the tunnel spans the entire z axis)
     * @param parts the tunnel parts to use
     */
    createStartingTunnel(parts:ITunnelPart[]):void
    {
        let newZ = -parts[0].length; // We start behind the camera, and populate up to the vanishing point
        
        while(!this._isTunnelPopulatedToVanishingPoint())
        {
            const tunnelPartsCopy = parts.map(part => ({...part}));
            
            tunnelPartsCopy.forEach(tunnelPart => {
                tunnelPart.active = true;
                tunnelPart.z = newZ;
                this.tunnel.push(tunnelPart);
                
                newZ += tunnelPart.length;
            });
        }
    }
    
    /**
     * Adds more pieces to the tunnel (only does this if the tunnel is about to run out)
     * @param newTunnelParts the tunnel pieces to add to the tunnel
     */
    continueTunnel(newTunnelParts:ITunnelPart[]):void
    {
        if(this._isReadyToAddMoreParts())
            newTunnelParts.forEach(tunnelPart => this.tunnel.push(tunnelPart));
    }
    
    /**
     * Moves, and then draws, the tunnel
     * @param levelSpeed the z speed of the level
     */
    draw(levelSpeed:number):void
    {
        // Draw array in reverse order
        for(let i = this.tunnel.length - 1; i >= 0; i--)
        {
            const part = this.tunnel[i];
            if(part.active)
            {
                part.z -= levelSpeed;
                
                this._drawTunnelPart(part);
                this._handlePartsActivation(i);
                this._handlePartOutOfFrame(i);
            }
        }
    }
    
    /**
     * Does the current tunnel span the entire z axis?
     * @returns true if the tunnel spans the whole z axis, false if not
     */
	private _isTunnelPopulatedToVanishingPoint():boolean
	{
        const closestPart = this.tunnel[0] ?? null;
        
        return (
            !!closestPart && // tunnel is populated
            this._getLastTunnelPart().z >= this.helpers.zCalc.vPointDepth && // furthest piece is at vanishing point
            (closestPart.z + closestPart.length) <= 0 // nearest piece is behind camera
        );
	}
	
    /**
     * Is the tunnel about to run out of parts?
     * @returns if the tunnel is about to run out, true. Otherwise false
     */
	private _isReadyToAddMoreParts():boolean
	{
		return (this.tunnel.length === 0 || this._getLastTunnelPart().active);
	}
	
    /**
     * Gets the last (farthest) piece of the tunnel
     * @returns the last piece of the tunnel
     */
	private _getLastTunnelPart():ITunnelPart
	{
		return this.tunnel[this.tunnel.length - 1];
	}
	
    /**
     * Draws a piece of the tunnel
     * @param tunnelPart the piece of the tunnel to draw
     */
	private _drawTunnelPart(tunnelPart:ITunnelPart):void
	{
		if(tunnelPart.image) //(null is a clear piece)
		{
			this.kernel.gameContext.drawImage(
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
		if(partIndex >= 0 && this._isTimeToActivateNextTunnelPart(partIndex))
		{
			const currentPart = this.tunnel[partIndex];
			const nextPart = this.tunnel[partIndex + 1];
			
			nextPart.active = true;
			nextPart.z = currentPart.z + currentPart.length;
		}
	}
	
    /**
     * Determines if the tunnel piece after the current one should be activated
     * @param currentPartIndex the index of a tunnel piece, in the this.tunnel array
     * @returns true if the tunnel piece after this index should be activated. False if not
     */
	private _isTimeToActivateNextTunnelPart(currentPartIndex:number):boolean
	{
        // If this is the last part of the tunnel (or there's only 1 part left in the tunnel), we don't need to do anything
		if(this.tunnel.length === (currentPartIndex + 1))
            return false;
		
		const currentPart = this.tunnel[currentPartIndex];
		const nextPart = this.tunnel[currentPartIndex + 1];
		
		return (!nextPart.active && 
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
			this.tunnel.shift();
		}
	}
	
    /**
     * Determines if a tunnel piece has left the frame
     * @param partIndex the index of this piece of the tunnel, in the this.tunnel array
     * @returns true if the tunnel piece is out of the frame, false if not
     */
	private _isPartOutOfFrame(partIndex:number):boolean
	{
        const tunnelPart = this.tunnel[partIndex];
        
		return (partIndex === 0 && (tunnelPart.z + tunnelPart.length) < 0);
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