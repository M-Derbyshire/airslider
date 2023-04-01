import Kernel from '/Kernel/kernel';

export default class LevelGround
{
	// groundPopulatedInitially - true if the ground should already be there. If false, player is moving towards the ground
    constructor(canvasCtx, camera, groundPopulatedInitially = true)
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;

        this._camera = camera;
        this._canvasCtx = canvasCtx;
		this._groundPopulatedInitially = groundPopulatedInitially;
        
        this.ground; //The shared data for every piece of ground drawn (see _getPopulatedGroundObject())
		this.distance; //The distance between pieces of ground (on the z axis)
		this._groundDrawCount; // How many of the ground positions should be drawn?
        
        this.groundZPositions = []; //The z-axis positions of every piece of ground
		
		this._removeGround = false; // If the player is leaving this area of ground, we want to remove it
    }
	
	//gapZDistance is the number of units on the z axis that will seperate pieces of ground
	// if imageStaticWidth is provided, the image will not be stretched to fill the space
	load(imagePath, imageHeight, gapZDistance, imageStaticWidth = null)
	{
		this.ground = this._getPopulatedGroundObject(imagePath, imageHeight, imageStaticWidth);
		this.distance = gapZDistance;
	}
    
    setupGround()
    {
        this._populateGroundZPositions();
    }
	
	_getPopulatedGroundObject(path, height, width)
	{
		return {
            image: this.kernel.loadImage(path),
            height, //Height to draw the image
			width,
            offset: 0 //The amount the images have all moved along the z-axis
        };
	}
	
	
	_populateGroundZPositions()
	{
		//Start from far away, so we don't draw the distant ones on top of the closer ones
		for(let i = this.helpers.zCalc.vPointDepth; i >= 0; i -= this.distance)
		{
			this.groundZPositions.push(i);
		}
		
		this._groundDrawCount = (this._groundPopulatedInitially) ? this.groundZPositions.length : 1;
	}
	
	
    
    
    //This works by moving all of the images on the z-axis, until they have
    //moved into the preceeding image's starting position. As all the images
    //are the same, the positions can then just be reset, and it will look
    //like they are just continuing to move towards the camera.
    draw(levelSpeed)
    {
		this.ground.offset += levelSpeed;
		this._resetGroundIfReachedDistance();
		
		this.groundZPositions.forEach((pos, i) => {
			if(i < this._groundDrawCount)
			{
				this._drawLeftAndRightGroundImage(pos);
			}
		});
    }
	
	// Use this to trigger the ending of the ground
	removeGround()
	{
		this._removeGround = true;
	}
	
	_resetGroundIfReachedDistance()
	{
		if(this.ground.offset >= this.distance)
		{
			this.ground.offset = 0;
			
			if(!this._groundPopulatedInitially)
			{
				this._groundDrawCount++;
			}
				
			if(this._removeGround)
			{
				this.groundZPositions.shift();
			}
		}
	}
	
	_drawLeftAndRightGroundImage(groundZPos)
	{
		const offsetZPos = groundZPos - this.ground.offset;
		
		const canvasBottomEdge = this._camera.canvasPositionY + this._camera.canvasPositionHeight;
		const canvasRightEdge = this._camera.canvasPositionX + this._camera.canvasPositionWidth;
		const imageWidth = (this.ground.width) 
			? this.ground.width 
			: this._camera.canvasPositionX + (this._camera.canvasPositionWidth * 2);
		
		const drawY = this.helpers.zCalc.y(canvasBottomEdge - this.ground.height, offsetZPos);
		const drawWidth = this.helpers.zCalc.width(imageWidth, offsetZPos);
		const drawHeight = this.helpers.zCalc.height(this.helpers.unit.yUnit(this.ground.height), offsetZPos);
		
		const leftDrawX = this.helpers.zCalc.x(this._camera.canvasPositionX - imageWidth, offsetZPos);
		const rightDrawX = this.helpers.zCalc.x(canvasRightEdge, offsetZPos);
		
		this._drawGroundImage(leftDrawX, drawY, drawWidth, drawHeight);
		this._drawGroundImage(rightDrawX, drawY, drawWidth, drawHeight);
	}
	
	_drawGroundImage(x, y, width, height)
	{
		this._canvasCtx.drawImage(this.ground.image, x, y, width, height);
	}
}