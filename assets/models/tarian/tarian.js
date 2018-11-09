class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this.state = "forward";
    }
    
    load()
    {
        this.anims = {
            forward: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/forward", 4, 24, xUnit(150), yUnit(225)),
            left: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/left", 4, 24, xUnit(220), yUnit(225), -xUnit(20), 0),
            right: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/right", 4, 24, xUnit(220), yUnit(225), xUnit(20), 0)
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
}