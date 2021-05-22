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
	
    
    //tunnel[i].z - .length - .color - .active
    draw(levelSpeed)
    {
        for(let i = 0; i < this.tunnel.length; i++)
        {
            if(this.tunnel[i].active)
            {
                let tunnelPart = this.tunnel[i];
                
                //move the image
                tunnelPart.z -= levelSpeed;
                
                //draw the image (null is a clear piece)
                if(tunnelPart.image)
                {
                    this.kernel.graphicEn.gameCtx.drawImage(
                        tunnelPart.image, 
                        this.helpers.zCalc.x(this._camera.canvasPositionX, tunnelPart.z, true), 
                        this.helpers.zCalc.y(this._camera.canvasPositionY, tunnelPart.z, true), 
                        this.helpers.zCalc.width(this._camera.canvasPositionWidth, tunnelPart.z, true), 
                        this.helpers.zCalc.height(this._camera.canvasPositionHeight, tunnelPart.z, true)
                    );
                }
                
                //if this is not the first piece, and it's moved far enough, activate the next one
                if(
                    i > 0 && 
                    !this.tunnel[i - 1].active &&
                    (tunnelPart.z + tunnelPart.length) <= this.helpers.zCalc.vPointDepth
                )
                {
                    this.tunnel[i - 1].active = true;
                    this.tunnel[i - 1].z = tunnelPart.z + tunnelPart.length;
                }
                
                //if this piece is out of the frame, it's no longer needed.
                if(i === this.tunnel.length - 1 && this.tunnel[i].z + this.tunnel[i].length < 0)
                {
                    this.tunnel.pop(); // pop out this piece of the tunnel
                }
            }
        }
    }
}