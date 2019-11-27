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
            left: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/werewolf/anim/left",
                frameCount: 2,
                fps: 24,
                width: xUnit(200),
                height: yUnit(170),
            }),
            right: this.registerAnim({
                path: kernel.rootPath + "/assets/models/monsters/werewolf/anim/right",
                frameCount: 2,
                fps: 24,
                width: xUnit(200),
                height: yUnit(170),
            }),
        };
        
        this.registerEvent(["Tarian"], this.hitPlayerOrGroundEvent);
        
        this.actions = [
            this.sweep,
            this.moveUp
        ];
        
        this.exitZSpeed = 30;
        this.state = "left";
        this.startY = (kernel.graphicEn.gameCan.height - this.height);
        this.startX = kernel.graphicEn.gameCan.width / 2;
        this.startZ = zCalc.vPointDepth;
        this.minXSpeed = 1000;
        this.maxXSpeed = 2000;
        this.zSpeed = 120;
        
        //outLimit is how far back the monster will go, before moving forward
        //inLimit is the point the wolf will start it's sweeping again
        this.outLimit = 1;
        this.inLimit = (kernel.loadedModels[this.playerIndex].z + 100);
        
        this.reset();
    }
    
    //entering and exiting and reseting-----------------------------------------
    
    enter()
    {
        this.entering = false; //go straight to the sweeping
    }
    
    exit()
    {
        //set the monsters facing direction
        this.state = this.setHeadDirection();
        
        //move
        this.moveOut(this.exitZSpeed);
        
        if(this.z <= 0)
        {
            this.exiting = false;
            this.active = false;
        }
    }
    
    reset()
    {
        this.xSpeed = this.minXSpeed;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this.state = "left";
        this.directionMultiplier = 1; //Multiply speed by this; Negate to change direction
    }
    
    //movement-----------------------------------------------------
    setHeadDirection() //not an action, just a method they'll both use
    {
        //set the monsters facing direction
        let player = kernel.loadedModels[this.playerIndex];
        if(this.x + (this.width / 2) >= player.x + (player.width / 2))
        {
            return "left";
        } else {
            return "right";
        }
    }
    
    getNewSpeed() //again, not an action
    {
        return this.minXSpeed + (Math.random() * (this.maxXSpeed - this.minXSpeed));
    }
    
    sweep(monster)
    {
        //set the monsters facing direction
        monster.state = monster.setHeadDirection();
        
        //set monsters x movement direction and move it
        if(monster.x < kernel.level.leftEdge)
        {
            monster.x = kernel.level.leftEdge;
            monster.directionMultiplier = 1;
        } else if (monster.x + monster.width > kernel.level.rightEdge)
        {
            monster.x = kernel.level.rightEdge - monster.width;
            monster.directionMultiplier = -1;
        }
        monster.moveRight(monster.xSpeed * monster.directionMultiplier);
        
        //move monster on z axis
        monster.moveOut(monster.zSpeed);
        
        //should monster move forward to reset?
        if(monster.z <= monster.outLimit)
        {
            monster.z = monster.outLimit;
            monster.nextAction();
        }
    }
    
    moveUp(monster)
    {
        //set the monsters facing direction
        monster.state = monster.setHeadDirection();
        
        //move back in
        monster.moveIn(monster.zSpeed);
        
        //go back to sweep if need be
        if(monster.z >= monster.inLimit)
        {
            monster.xSpeed = monster.getNewSpeed();
            monster.z = monster.inLimit;
            monster.nextAction();
        }
    }
    
    
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