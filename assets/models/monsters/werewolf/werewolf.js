class Werewolf extends Monster {
    constructor(playerIndex, otherMonster = false)
    {
        super(Monster);
        
        this.playerIndex = playerIndex;
        this.specialLevel = otherMonster;
        
        this.damageDealt = 10;
        this.color = "tooth";
    }
    
    load()
    {
        this.anims = {
            
        };
        
        this.registerEvent(["Tarian"], this.hitPlayerOrGroundEvent);
        
        this.actions = [
            
        ];
        
        this.enterZSpeed = 90;
        this.exitZSpeed = 240;
        this.startY = 0
        this.startX = 0
        this.startZ = zCalc.vPointDepth;
        this.ySpeed = 1200;
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        if(kernel.level.rightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
        }
    }
    
    exit()
    {
        if(this.y != this.startY)
        {
            //if not at correct height, don't leave yet
            this.state = "rising";
            this.rise(kernel.loadedModels[this.loadedIndex]);
        } else {
            this.state = "flapping";
        
            this.moveLeft(this.exitXSpeed);
            
            if((this.x + this.width) < (kernel.level.leftEdge - this.offScreenUnits))
            {
                this.exiting = false;
                this.active = false;
            }
        }
    }
    
    reset()
    {
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this.state = "";
    }
    
    //movement-----------------------------------------------------
    
    
    
    //events------------------------------------------------------------
    
    hitPlayerOrGroundEvent(thisModel, otherModel)
    {
        if(((thisModel.x + thisModel.width >= otherModel.x) &&
        (thisModel.x <= otherModel.x + otherModel.width) &&
        (thisModel.y + thisModel.height >= otherModel.y) &&
        (thisModel.y <= otherModel.y + otherModel.height)) || 
        (thisModel.y + thisModel.height >= kernel.graphicEn.gameCan.height))
        {
            
        }
    }
}