class Level
{
    constructor()
    {
        this.background = "white"; //use a color if nothing set in subclass (hence true on the next line)
        this.useColorBackground = true;
        
        this.roadColor = "#999999";
        
        this.framesPassed = 0;
        
        this.shockerCount;
        
        this.leftEdge;
        this.rightEdge;
        
        this.tunnel = [];
    }
    
    //set things that can only be done after the engines are constructed
    load()
    {
        this.leftEdge = 0;
        this.rightEdge = kernel.graphicEn.gameCan.width;
        
        zCalc.setVanishPoint(kernel.graphicEn.gameCan.width / 2, kernel.graphicEn.gameCan.height / 2, 1000);
        this.levelSpeed = zCalc.speed(600);
    }
    
    //meant to be overridden
    getModels(){}
    
    act()
    {
        
    }
    
    drawBack()
    {
        
        if(this.extraDrawBack)
        {
            this.extraDrawBack();
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
    
    
    //level sections ---------------------------------------
    
    sendShockers(fromIndex, toIndex)
    {
        for(let i = fromIndex; i <= toIndex; i++)
        {
            if((!kernel.loadedModels[i].active && i == fromIndex) || (!kernel.loadedModels[i].active && kernel.loadedModels[i - 1].active && (kernel.loadedModels[i - 1].z + (zCalc.vPointDepth / this.shockerCount) < zCalc.vPointDepth)))
            {
                kernel.loadedModels[i].z = zCalc.vPointDepth;
                kernel.loadedModels[i].x = (Math.random() * ((this.rightEdge - kernel.loadedModels[i].anims[kernel.loadedModels[i].state].width) - this.leftEdge)) + this.leftEdge;
                
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
    
    //tunnel[i].z - .length - .color - .active
    tunnelAlternate(col1, col2)
    {
        return [
            {
                z: zCalc.vPointDepth,
                length: 100,
                color: col1,
                active: false
            },
            {
                z: zCalc.vPointDepth,
                length: 10,
                color: col2,
                active: false
            }
        ];
    }
    
    tunnelBreakingAlternate(col1, col2)
    {
        return [
            {
                z: zCalc.vPointDepth,
                length: 50,
                color: col1,
                active: false
            },
            {
                z: zCalc.vPointDepth,
                length: 100,
                color: "clear",
                active: false
            },
            {
                z: zCalc.vPointDepth,
                length: 50,
                color: col2,
                active: false
            },
            {
                z: zCalc.vPointDepth,
                length: 100,
                color: "clear",
                active: false
            }
        ];
    }
    
    tunnelClear()
    {
        return {
            z: zCalc.vPointDepth,
            length: 1,
            color: "clear",
            active: false
        };
    }
    
}