class Tarian extends Model {
    constructor()
    {
        super(Model);
        
        this.state = "forward";
        
        this.anims = {
            forward: this.registerAnim(kernel.rootPath + "/assets/models/tarian/anim/forward", 2, 6, 75, 150)
        };
    }
    
    load()
    {
        this.z = 30;
        this.x = (kernel.graphicEn.gameCan.width / 2) - this.anims[this.state].width;
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height) - this.z;
    }
}