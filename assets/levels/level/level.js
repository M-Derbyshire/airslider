class Level
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.controlInitialiser = new ControlsInitialiser();
        
        this._background = "white"; //use a color if nothing set in subclass (hence true on the next line)
        
        this.HUD; //the Heads Up Display for the level
        this.HUD = new MainHUD();
        
        this.roadColor = "#999999";
        
        this.shockerCount;
        
        this.monsterIndex;
        
        this.leftEdge;
        this.rightEdge;
        
        this.tunnel = [];
        
        this._musicRef;
        
        this.ground = {
            ref: 0,
            height: 0,
            distance: 0,
            offset: 0
        };
        
        this.groundZ = [];
        this.outsideVisible = false;
        
        this.tunnelLightMask;
        this.tunnelLightBrightness;
        this.outsideLightMask;
        this.outsideLightBrightness;
        this.lightChanged = false;
        
        this.levelSpeed;
        this.levelSpeedRaw;
        this.initialLevelSpeedRaw;
    }
    
    //set things that can only be done after the engines are constructed
    loadSuper()
    {
        this.leftEdge = 0;
        this.rightEdge = this.kernel.graphicEn.gameCan.width;
        
        this.helpers.zCalc.setVanishPoint(this.kernel.graphicEn.gameCan.width / 2, this.kernel.graphicEn.gameCan.height / 2, 1000);
        
        this.initialLevelSpeedRaw = 600;
        this.levelSpeedRaw = this.initialLevelSpeedRaw; //Can be used if you need to check for a change in level speed, or to change it
        this.updateLevelSpeed();
        
        this.tunnelLightMask = this.kernel.loadImage("/assets/levels/level/images/tunnelLightMask.png");
        this.tunnelLightBrightness = 0.25;
        
        //Setup the controls
        //The main character in this game is always index 0
        this.kernel.controlInitialiser.keyboardControls(0);
        this.kernel.controlInitialiser.touchControls(0);
        
        this.HUD.modelIndexes.push(0);
    }
    
    //meant to be overridden
    getModels(){}
    load(){}
    act(){}
    
    updateLevelSpeed()
    {
        if(this.levelSpeed != 0)
        {
            this.levelSpeed = this.helpers.zCalc.speed(this.levelSpeedRaw, this.kernel.fps); //need to use this in monsters for death
        }
    }
    
    checkLightMask()
    {
        if(
            this.tunnel.length > 1 && 
            this.tunnel[this.tunnel.length - 1].z <= 0 &&
            this.tunnel[this.tunnel.length - 2].imageIndex != -1
        )
        {
            this.kernel.graphicEn.lightMask = this.tunnelLightMask;
            this.kernel.graphicEn.lightLuminosity = this.tunnelLightBrightness;
        } else {
            this.kernel.graphicEn.lightMask = this.outsideLightMask;
            this.kernel.graphicEn.lightLuminosity = this.outsideLightBrightness;
        }
    }
    
    drawBack()
    {
        if(this.extraDrawBack)
        {
            this.extraDrawBack();
        }
        
        if(this.outsideVisible)
        {
            this.drawGround();
        }
        
        this.drawTunnel();
        this.drawRoad();
    }
    
    drawFront()
    {
        
        
        if(this.extraDrawFront)
        {
            this.extraDrawFront();
        }
    }
    
    
    drawRoad()
    {
        this.kernel.graphicEn.gameCtx.lineWidth = 1;
        this.kernel.graphicEn.gameCtx.fillStyle = this.roadColor;
        this.kernel.graphicEn.gameCtx.beginPath();
        this.kernel.graphicEn.gameCtx.moveTo(0, this.kernel.graphicEn.gameCan.height);
        this.kernel.graphicEn.gameCtx.lineTo(this.helpers.zCalc.vPointX, this.helpers.zCalc.vPointY);
        this.kernel.graphicEn.gameCtx.lineTo(this.kernel.graphicEn.gameCan.width, this.kernel.graphicEn.gameCan.height);
        this.kernel.graphicEn.gameCtx.fill();
    }
    
    levelStop()
    {
        this.levelSpeedRaw = 0;
        
        for(let i = 0; i < this.kernel.loadedModels.length; i++)
        {
            this.kernel.loadedModels[i].levelStopped();
        }
    }
    
    //level sections ---------------------------------------
    
    setGround(path, height)
    {
        this.ground.ref = this.kernel.loadImage(path);
        this.ground.height = height;
        let distance = -1;
        
        this.groundZ.push(this.helpers.zCalc.vPointDepth);
        
        for(let z = this.helpers.zCalc.vPointDepth; z >= 0; z--)
        {
            if(distance == -1)
            {
                //find the z distance between images
                if(this.helpers.zCalc.y(this.kernel.graphicEn.gameCan.height, z) >= this.helpers.zCalc.y(this.kernel.graphicEn.gameCan.height, this.groundZ[this.groundZ.length - 1]) + this.helpers.zCalc.height(height, this.groundZ[this.groundZ.length - 1]))
                {
                    distance = this.groundZ[this.groundZ.length - 1] - z;
                    this.ground.distance = distance;
                    this.groundZ.push(z + 1);
                }
            } else {
                if(this.groundZ[this.groundZ.length - 1] - z == distance)
                {
                    this.groundZ.push(z + 1);
                }
            }
        }
    }
    
    drawGround()
    {
        for(let i = 0; i < this.groundZ.length; i++)
        {
            if(this.ground.offset > this.ground.distance)
            {
                this.ground.offset = 0;
            }
            
            this.ground.offset += (this.levelSpeed / 1000);
            
            let y = this.helpers.zCalc.y(this.kernel.graphicEn.backCan.height, this.groundZ[i] - this.ground.offset);
            let width = this.helpers.zCalc.width((this.kernel.graphicEn.backCan.width * 2), this.groundZ[i] - this.ground.offset);
            let height = this.helpers.zCalc.height(this.ground.height, this.groundZ[i] - this.ground.offset);
            
            this.kernel.graphicEn.backCtx.drawImage(
                this.kernel.loadedAssets[this.ground.ref][1],
                this.helpers.zCalc.x(0 - (this.kernel.graphicEn.backCan.width * 2), this.groundZ[i] - this.ground.offset),
                y,
                width,
                height
            );
            
            this.kernel.graphicEn.backCtx.drawImage(
                this.kernel.loadedAssets[this.ground.ref][1],
                this.helpers.zCalc.x(this.kernel.graphicEn.backCan.width, this.groundZ[i] - this.ground.offset),
                y,
                width,
                height
            );
        }
    }
    
    sendShockers(fromIndex, toIndex)
    {
        for(let i = fromIndex; i <= toIndex; i++)
        {
            if((!this.kernel.loadedModels[i].active && i == fromIndex) || (!this.kernel.loadedModels[i].active && this.kernel.loadedModels[i - 1].active && (this.kernel.loadedModels[i - 1].z + (this.helpers.zCalc.vPointDepth / this.shockerCount) < this.helpers.zCalc.vPointDepth)))
            {
                // need to set some to be where the Tarian is, so player can't just stay in one place
                let xPos;
                
                //player character
                let px = this.kernel.loadedModels[0].x;
                let pw = this.kernel.loadedModels[0].width;
                
                if((i + 1) % 3 == 0) //if this is every third in every 3 shockers
                {
                    // put somewhere on left side of level
                    xPos = (Math.random() * (((this.rightEdge - this.kernel.loadedModels[i].width) - this.leftEdge) / 2)) + this.leftEdge;
                
                } else if((i + 2) % 3 == 0) //if this is every second in every 3 shockers
                {
                    // now on the right side
                    xPos = (Math.random() * (((this.rightEdge - this.kernel.loadedModels[i].width) - this.leftEdge) / 2)) + ((this.rightEdge - this.leftEdge) / 2);
                
                } else //If this is first in every 3 shockers
                {
                    // put where player is (x coordinate)
                    
                    //shocker
                    let sw = this.kernel.loadedModels[i].width;
                    
                    // want their center points to line up
                    xPos = (px + (pw / 2)) - (sw / 2);
                    
                    //now make sure they are within the bounds of the level
                    if(xPos < this.leftEdge)
                    {
                        xPos = this.leftEdge;
                    } else if (xPos + sw > this.rightEdge)
                    {
                        xPos = this.rightEdge - sw;
                    }
                }
                
                this.kernel.loadedModels[i].z = this.helpers.zCalc.vPointDepth;
                this.kernel.loadedModels[i].x = xPos;
                
                this.kernel.loadedModels[i].active = true;
            }
        }
    }
    
    //tunnel[i].z - .length - .color - .active
    drawTunnel()
    {
        for(let i = 0; i < this.tunnel.length; i++)
        {
            if(this.tunnel[i].active)
            {
                let tunnelPart = this.tunnel[i];
                
                //move the image
                tunnelPart.z -= this.levelSpeed;
                
                //draw the image (-1 is a clear piece)
                if(tunnelPart.imageIndex > -1)
                {
                    this.kernel.graphicEn.gameCtx.drawImage(
                        this.kernel.loadedAssets[tunnelPart.imageIndex][1], 
                        this.helpers.zCalc.x(0, tunnelPart.z, true), 
                        this.helpers.zCalc.y(0, tunnelPart.z, true), 
                        this.helpers.zCalc.width(this.kernel.graphicEn.gameCan.width, tunnelPart.z, true), 
                        this.helpers.zCalc.height(this.kernel.graphicEn.gameCan.height, tunnelPart.z, true)
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
                
                //if this is the last piece, and it's out of the frame, it's no longer needed
                if(this.tunnel.length > 1 && i == this.tunnel.length - 1)
                {
                    if(this.tunnel[i - 1].z <= 0) //if the one before this is moving out of frame
                    {
                        this.tunnel.pop(); // pop out this piece of the tunnel
                    }
                }
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
    
    //tunnel[i].z - .length - .imageIndex - .active
    newTunnelPart(image, length = 1)
    {
        return {
            z: this.helpers.zCalc.vPointDepth,
            length: length,
            imageIndex: image, //-1 is a clear piece of the tunnel
            active: false
        };
    }
    
    createStartingTunnel(parts)
    {
        let newZ = this.helpers.zCalc.vPointDepth;
        while(this.tunnel.length < 2 || this.tunnel[this.tunnel.length - 2].z > 0)
        {
            parts = JSON.parse(JSON.stringify(parts)); //have to truly copy this, as otherwise they're references
            
            for(let i = parts.length - 1; i >= 0; i--)
            {
                this.tunnel.push(parts[i]);
                this.tunnel[this.tunnel.length - 1].active = true;
                
                // Set the Z to the previous item's Z, minus this one's length
                newZ = newZ - this.tunnel[this.tunnel.length - 1].length;
                this.tunnel[this.tunnel.length - 1].z = newZ;
            }
        }
    }
}