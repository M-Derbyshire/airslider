import Monster from '/assets/models/Monster/monster';

export default class Werewolf extends Monster {
    constructor(playerModel)
    {
        super(Monster);
        
        this.playerModel = playerModel;
        
        this.damageDealtOrig = 2;
        this.damageDealt = this.damageDealtOrig;
        this.color = "tooth";
    }
    
    load(levelLeftEdge, levelRightEdge)
    {
        super.load(levelLeftEdge, levelRightEdge);
        
        this.animationManager.registerAnimations({
            left: this.animationManager.createAnimation({
                path: "/assets/models/monsters/werewolf/anim/left",
                frameCount: 2,
                fps: 24,
                width: 200,
                height: 170,
            }),
            right: this.animationManager.createAnimation({
                path: "/assets/models/monsters/werewolf/anim/right",
                frameCount: 2,
                fps: 24,
                width: 200,
                height: 170,
            }),
        });
        
        this.actions = [
            this.sweep,
            this.moveUp
        ];
        
        this.exitZSpeed = 50;
        this.state = "left";
        
        this.setYPositionFromBottom(this.height);
        this.startY = this.y;
        this.centerXPosition();
        this.startX = this.x
        this.startZ = this.helpers.zCalc.vPointDepth;
        this.minXSpeed = 1000;
        this.maxXSpeed = 2000;
        this.zSpeed = 12; // this will be multiplied by 10, as 120 was affecting Tarian's zCollision event
        
        //outLimit is how far back the monster will go, before moving forward
        //inLimit is the point the wolf will start it's sweeping again
        this.outLimit = 1;
        this.inLimit = (this.playerModel.z + 100);
        
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
        this.moveIn(this.exitZSpeed);
        
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
        let player = this.playerModel;
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
    
    sweep()
    {
        //set the monsters facing direction
        this.state = this.setHeadDirection();
        
        //set monsters x movement direction and move it
        if(this.x < this._levelLeftEdge)
        {
            this.x = this._levelLeftEdge;
            this.directionMultiplier = 1;
        } else if (this.x + this.width > this._levelRightEdge)
        {
            this.x = this._levelRightEdge - this.width;
            this.directionMultiplier = -1;
        }
        this.moveRight(this.xSpeed * this.directionMultiplier);
        
        //move monster on z axis
        this.moveOut(this.zSpeed * 10);
        
        //should monster move forward to reset?
        if(this.z <= this.outLimit)
        {
            this.z = this.outLimit;
            this.nextAction();
        }
    }
    
    moveUp()
    {
        //set the monsters facing direction
        this.state = this.setHeadDirection();
        
        //move back in
        this.moveIn(this.zSpeed * 10);
        
        //go back to sweep if need be
        if(this.z >= this.inLimit)
        {
            this.xSpeed = this.getNewSpeed();
            this.z = this.inLimit;
            this.damageDealt = this.damageDealtOrig;
            this.nextAction();
        }
    }
    
    
    //events------------------------------------------------------------
    
    zCollisionEventAction(otherModel)
    {
        if(this.currentAction == 0 && !this.exiting) //the index number of the current action method in the array in Monster class
        {
            this.z = otherModel.z + this.zSpeed + 1;
            this.damageDealt = 0; //in case it's still colliding (will be reset when it gets to the inLimit)
            this.nextAction();
        }
    }
}