import Kernel from '../../../kernel/Kernel';

class LevelTunnel
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
    
    
    //tunnel[i].z - .length - .imageIndex - .active
    //.imageIndex of -1 is a clear piece of the tunnel
    newTunnelPart(image, length = 1)
    {
        return {
            z: this.helpers.zCalc.vPointDepth,
            length: length,
            imageIndex: image,
            active: false
        };
    }
    
    createStartingTunnel(parts)
    {
        let newZ = this.helpers.zCalc.vPointDepth;
        
        //Make a whole tunnel full of the provided parts
        while(this.tunnel.length < 2 || this.tunnel[this.tunnel.length - 2].z > 0)
        {
            //Need to make copies of all of these parts 
            //(so we can use them multiple times at different z positions)
            const partsCopy = parts.map((part) => {
                return { ...part };
            });
            
            for(let i = partsCopy.length - 1; i >= 0; i--)
            {
                this.tunnel.push(partsCopy[i]);
                this.tunnel[this.tunnel.length - 1].active = true;
                
                // Set the Z to the previous item's Z, minus this one's length
                newZ = newZ - this.tunnel[this.tunnel.length - 1].length;
                this.tunnel[this.tunnel.length - 1].z = newZ;
            }
        }
    }
    
    continueTunnel(newTunnelParts)
    {
        if(this.tunnel.length == 0 || this.tunnel[0].active)
        {
            for(let i = 0; i < newTunnelParts.length; i++)
            {
                this.tunnel.unshift(newTunnelParts[i]);
            }
        } else if (!this.tunnel[this.tunnel.length - 1].active)
        {
            this.tunnel[this.tunnel.length - 1].active = true;
        }
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
                
                //draw the image (-1 is a clear piece)
                if(tunnelPart.imageIndex > -1)
                {
                    this.kernel.graphicEn.gameCtx.drawImage(
                        this.kernel.loadedAssets[tunnelPart.imageIndex].asset, 
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