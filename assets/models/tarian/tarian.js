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
            left: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/left", 4, 24, xUnit(300), yUnit(225)),
            right: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/right", 4, 24, xUnit(300), yUnit(225))
        };
        
        this.z = zUnit(30);
        this.x = (kernel.graphicEn.gameCan.width / 2) - (this.anims[this.state].width / 2);
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height) + this.z;
        
        this.xSpeed = xUnit(10);
    }
    
    move(direction) //0 up; 1 right; 2 down; 3 left; 4 in; 5 out
    {
        switch(direction)
        {
            case 1:
                this.x += this.xSpeed;
                break;
            case 3:
                this.x -= this.xSpeed;
                break;
        }
    }
}