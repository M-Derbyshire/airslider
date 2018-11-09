class MrStickyStick extends Model {
    constructor()
    {
        //who knows what could have been?
        
        super(Model);
        
        this.state = "forward";
    }
    
    load()
    {
        this.anims = {
            forward: this.registerAnim(kernel.rootPath + "/assets/models/mrStickyStick/anim/forward", 2, 12, xUnit(120), yUnit(170))
        };
        
        this.z = zUnit(30);
        this.x = (kernel.graphicEn.gameCan.width / 4) - (this.anims[this.state].width / 2);
        this.y = (kernel.graphicEn.gameCan.height - this.anims[this.state].height) + this.z;
        
        
        
    }
}