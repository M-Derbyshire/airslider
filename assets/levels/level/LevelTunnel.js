import Kernel from '/kernel/kernel';

export default class LevelTunnel
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        this._camera; //set in load()
        
        this.tunnel = [];
    }
    
    load(camera)
    {
        this._camera = camera;
    }
    
    
    //tunnel[i].z - .length - .image - .active
    //.image being null is a clear piece of the tunnel.
	//.length is the length of the piece, on the z-axis.
    newTunnelPart(image, length = 1)
    {
        return {
            z: this.helpers.zCalc.vPointDepth,
            length: length,
            image,
            active: false
        };
    }
    
    createStartingTunnel(parts)
    {
        let newZ = this.helpers.zCalc.vPointDepth;
        
        while(this._isTunnelPopulatedWithLastPieceOffScreen())
        {
            const tunnelPartsCopy = parts.map(part => ({...part}));
            
            for(let i = tunnelPartsCopy.length - 1; i >= 0; i--)
            {
                this.tunnel.push(tunnelPartsCopy[i]);
                tunnelPartsCopy[i].active = true;
                
                newZ = newZ - tunnelPartsCopy[i].length;
                tunnelPartsCopy[i].z = newZ;
            }
        }
    }
	
	_isTunnelPopulatedWithLastPieceOffScreen()
	{
		return (this.tunnel.length < 2 || this.tunnel[this.tunnel.length - 2].z > 0);
	}
	
	
    
    continueTunnel(newTunnelParts)
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
	
	_isReadyToAddMoreParts()
	{
		return (this.tunnel.length === 0 || this.tunnel[0].active);
	}
	
	_getLastTunnelPart()
	{
		return this.tunnel[this.tunnel.length - 1];
	}
	
    
	
    draw(levelSpeed)
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
	
	_drawTunnelPart(tunnelPart)
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
	
	_handlePartsActivation(partIndex)
	{
		if(partIndex > 0 && this._isTimeToActivatePreviousTunnelPart(partIndex))
		{
			const currentPart = this.tunnel[partIndex];
			const previousPart = this.tunnel[partIndex - 1];
			
			previousPart.active = true;
			previousPart.z = currentPart.z + currentPart.length;
		}
	}
	
	_isTimeToActivatePreviousTunnelPart(currentPartIndex)
	{
		if(this.tunnel.length < 2) return false;
		
		const currentPart = this.tunnel[currentPartIndex];
		const previousPart = this.tunnel[currentPartIndex - 1];
		
		return (!previousPart.active && 
					(currentPart.z + currentPart.length) <= this.helpers.zCalc.vPointDepth);
	}
	
	_handlePartOutOfFrame(partIndex)
	{
		if(this._isPartOutOfFrame(partIndex))
		{
			this.tunnel.pop();
		}
	}
	
	_isPartOutOfFrame(partIndex)
	{
		return (partIndex === this.tunnel.length - 1 && 
					this.tunnel[partIndex].z + this.tunnel[partIndex].length < 0);
	}
}