class Level
{
    constructor()
    {
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
        this.rightEdge = kernel.graphicEn.gameCan.width;
        
        zCalc.setVanishPoint(kernel.graphicEn.gameCan.width / 2, kernel.graphicEn.gameCan.height / 2, 1000);
        
        this.initialLevelSpeedRaw = 600;
        this.levelSpeedRaw = this.initialLevelSpeedRaw; //Can be used if you need to check for a change in level speed, or to change it
        this.updateLevelSpeed();
        
        this.tunnelLightMask = kernel.loadImage(kernel.rootPath + "/assets/levels/level/images/tunnelLightMask.png");
        this.tunnelLightBrightness = 0.25;
    }
    
    //meant to be overridden
    getModels(){}
    load(){}
    act(){}
    
    updateLevelSpeed()
    {
        if(this.levelSpeed != 0)
        {
            this.levelSpeed = zCalc.speed(this.levelSpeedRaw); //need to use this in monsters for death
        }
    }
    
    checkLightMask()
    {
        if(kernel.graphicEn.lightMask != this.tunnelLightMask && 
            this.tunnel.length > 0 && 
            this.tunnel[0].z <= 0 &&
            this.tunnel[Math.floor((this.tunnel.length / 4))].color != "clear")
        {
            kernel.graphicEn.lightMask = this.tunnelLightMask;
            kernel.graphicEn.lightLuminosity = this.tunnelLightBrightness;
        }
        
        if(kernel.graphicEn.lightMask != this.outsideLightMask &&
            (this.tunnel.length == 0 || this.tunnel[Math.floor(this.tunnel.length / 8)].color == "clear"))
        {
            kernel.graphicEn.lightMask = this.outsideLightMask;
            kernel.graphicEn.lightLuminosity = this.outsideLightBrightness;
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
        kernel.graphicEn.gameCtx.lineWidth = 1;
        kernel.graphicEn.gameCtx.fillStyle = this.roadColor;
        kernel.graphicEn.gameCtx.beginPath();
        kernel.graphicEn.gameCtx.moveTo(0, kernel.graphicEn.gameCan.height);
        kernel.graphicEn.gameCtx.lineTo(zCalc.vPointX, zCalc.vPointY);
        kernel.graphicEn.gameCtx.lineTo(kernel.graphicEn.gameCan.width, kernel.graphicEn.gameCan.height);
        kernel.graphicEn.gameCtx.fill();
    }
    
    levelStop()
    {
        this.levelSpeedRaw = 0;
        
        for(let i = 0; i < kernel.loadedModels.length; i++)
        {
            kernel.loadedModels[i].levelStopped();
        }
    }
    
    //level sections ---------------------------------------
    
    setGround(path, height)
    {
        this.ground.ref = kernel.loadImage(path);
        this.ground.height = height;
        let distance = -1;
        
        this.groundZ.push(zCalc.vPointDepth);
        
        for(let z = zCalc.vPointDepth; z >= 0; z--)
        {
            if(distance == -1)
            {
                //find the z distance between images
                if(zCalc.y(kernel.graphicEn.gameCan.height, z) >= zCalc.y(kernel.graphicEn.gameCan.height, this.groundZ[this.groundZ.length - 1]) + zCalc.height(height, this.groundZ[this.groundZ.length - 1]))
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
            
            let y = zCalc.y(kernel.graphicEn.backCan.height, this.groundZ[i] - this.ground.offset);
            let width = zCalc.width((kernel.graphicEn.backCan.width * 2), this.groundZ[i] - this.ground.offset);
            let height = zCalc.height(this.ground.height, this.groundZ[i] - this.ground.offset);
            
            kernel.graphicEn.backCtx.drawImage(
                kernel.loadedAssets[this.ground.ref][1],
                zCalc.x(0 - (kernel.graphicEn.backCan.width * 2), this.groundZ[i] - this.ground.offset),
                y,
                width,
                height
            );
            
            kernel.graphicEn.backCtx.drawImage(
                kernel.loadedAssets[this.ground.ref][1],
                zCalc.x(kernel.graphicEn.backCan.width, this.groundZ[i] - this.ground.offset),
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
            if((!kernel.loadedModels[i].active && i == fromIndex) || (!kernel.loadedModels[i].active && kernel.loadedModels[i - 1].active && (kernel.loadedModels[i - 1].z + (zCalc.vPointDepth / this.shockerCount) < zCalc.vPointDepth)))
            {
                // need to set some to be where the Tarian is, so player can't just stay in one place
                let xPos;
                
                //player character
                let px = kernel.loadedModels[0].x;
                let pw = kernel.loadedModels[0].anims[kernel.loadedModels[0].state].width;
                
                if((i + 1) % 3 == 0) //if this is every third in every 3 shockers
                {
                    // put somewhere on left side of level
                    xPos = (Math.random() * (((this.rightEdge - kernel.loadedModels[i].anims[kernel.loadedModels[i].state].width) - this.leftEdge) / 2)) + this.leftEdge;
                
                } else if((i + 2) % 3 == 0) //if this is every second in every 3 shockers
                {
                    xPos = (Math.random() * (((this.rightEdge - kernel.loadedModels[i].anims[kernel.loadedModels[i].state].width) - this.leftEdge) / 2)) + ((this.rightEdge - this.leftEdge) / 2);
                
                } else //might as well be if this is first in every 3 shockers
                {
                    // put where player is (x coordinate)
                    
                    //shocker
                    let sw = kernel.loadedModels[i].anims[kernel.loadedModels[i].state].width;
                    
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
                
                kernel.loadedModels[i].z = zCalc.vPointDepth;
                kernel.loadedModels[i].x = xPos;
                
                kernel.loadedModels[i].active = true;
            }
        }
    }
    
    //tunnel[i].z - .length - .color - .active
    drawTunnel()
    {
        if(this.tunnel.length > 0 && !this.tunnel[0].active)
        {
            this.tunnel[0].active = true;
        }
        
        for(let i = 0; i < this.tunnel.length; i++)
        {
            if(this.tunnel[i].color == "clear")
            {
                kernel.graphicEn.gameCtx.clearRect(
                    zCalc.x(0, this.tunnel[i].z),
                    zCalc.y(0, this.tunnel[i].z),
                    zCalc.width(kernel.graphicEn.gameCan.width, this.tunnel[i].z),
                    zCalc.height(kernel.graphicEn.gameCan.height, this.tunnel[i].z)
                );
            } else {
                kernel.graphicEn.gameCtx.fillStyle = this.tunnel[i].color;
                kernel.graphicEn.gameCtx.fillRect(
                    zCalc.x(0, this.tunnel[i].z),
                    zCalc.y(0, this.tunnel[i].z),
                    zCalc.width(kernel.graphicEn.gameCan.width, this.tunnel[i].z),
                    zCalc.height(kernel.graphicEn.gameCan.height, this.tunnel[i].z)
                );
            }
            
            if((i < (this.tunnel.length - 1)) && !this.tunnel[i + 1].active && ((zCalc.vPointDepth - this.tunnel[i].z) >= this.tunnel[i].length))
            {
                this.tunnel[i + 1].active = true;
                this.tunnel[i + 1].z = this.tunnel[i].z + this.tunnel[i].length;
            }
            
            if(this.tunnel[i].active)
            {
                this.tunnel[i].z -= this.levelSpeed;
            }
            
            //keep at 0 if need be
            //needs to be last as array length may change
            if(this.tunnel[i].z < 0)
            {
                this.tunnel[i].z = 0;
                this.tunnel[i].active = false;
                
                //get rid of previous one
                if(i != 0)
                {
                    this.tunnel.splice(i - 1, 1);
                    i--;
                } else if(this.tunnel[i].color == "clear")
                {
                    this.tunnel.splice(i, 1);
                    i--;
                }
            }
        }
    }
    
    
    continueTunnel(newTunnelParts)
    {
        if(this.tunnel.length == 0 || this.tunnel[this.tunnel.length - 1].active)
        {
            for(let i = 0; i < newTunnelParts.length; i++)
            {
                this.tunnel.push(newTunnelParts[i]);
            }
        }
    }
    
    //tunnel[i].z - .length - .color - .active
    newTunnelPart(col, len = 1)
    {
        return {
            z: zCalc.vPointDepth,
            length: len,
            color: col,
            active: false
        };
    }
    
    createStartingTunnel(parts)
    {
        while(this.tunnel.length == 0 || this.tunnel[this.tunnel.length - 1].z < zCalc.vPointDepth)
        {
            parts = JSON.parse(JSON.stringify(parts));
            
            for(let i = 0; i < parts.length; i++)
            {
                this.tunnel.push(parts[i]);
                this.tunnel[this.tunnel.length - 1].active = true;
                
                if(this.tunnel.length > 1)
                {
                    this.tunnel[this.tunnel.length - 1].z = this.tunnel[this.tunnel.length - 2].z + this.tunnel[this.tunnel.length - 2].length;
                } else {
                    this.tunnel[this.tunnel.length - 1].z = 0;
                }
            }
        }
    }
}