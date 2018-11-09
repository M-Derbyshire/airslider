class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this.state = "forward";
    }
    
    load()
    {
        this.anims = {
            forward: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/forward", 4, 24, xUnit(120), yUnit(170)),
            left: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/left", 4, 24, xUnit(170), yUnit(170), -xUnit(40)),
            right: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/right", 4, 24, xUnit(170), yUnit(170), xUnit(40))
        };
        
        this.z = zUnit(30);
        this.x = (kernel.graphicEn.gameCan.width / 2) - (this.anims[this.state].width / 2);
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height) + this.z;
        
        this.xSpeed = xUnit(40);
    }
    
    move() //0 up; 1 right; 2 down; 3 left; 4 in; 5 out
    {
        switch(this.state)
        {
            case "right":
                this.x += this.xSpeed;
                break;
            case "left":
                this.x -= this.xSpeed;
                break;
        }
    }
    
    checkEvents()
    {
        //check for leaving the game area
        if(this.x < 0)
        {
            this.x = 0;
            this.state = "forward";
        }
        if(this.x + this.anims[this.state].width > kernel.graphicEn.gameCan.width)
        {
            this.x = kernel.graphicEn.gameCan.width - this.anims["forward"].width;
            this.state = "forward";
        }
    }
}