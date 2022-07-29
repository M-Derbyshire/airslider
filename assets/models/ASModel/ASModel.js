import Model from '/assets/models/Model/Model';

export default class ASModel extends Model {
	
	constructor()
	{
		super(Model);
		
		// Set in load
        this._levelLeftEdge;
        this._levelRightEdge;
		
		this.damageDealt = 0;
	}
	
	
	//meant to be overridden
    levelStopped() {}
	
	
	
	load(levelLeftEdge, levelRightEdge)
    {
        this._levelLeftEdge = levelLeftEdge;
        this._levelRightEdge = levelRightEdge;
    }
	
    centerXPosition()
    {
        this.x = (this.kernel.unitsWithinCamera / 2) - (this.width / 2);
    }
    
    setYPositionFromBottom(pos)
    {
        this.y = this.kernel.unitsWithinCamera - pos;
    }
}