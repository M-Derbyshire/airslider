class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this.state = "forward";
    }
    
    load()
    {
        this.anims = {
            forward: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/forward", 2, 6, xUnit(75), yUnit(150))
        };
        
        this.z = zUnit(30);
        this.x = (kernel.graphicEn.gameCan.width / 2) - this.anims[this.state].width;
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