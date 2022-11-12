import Kernel from '/kernel/kernel';

export default class LevelGround
{
    constructor(canvasCtx, camera)
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;

        this._camera = camera;
        this._canvasCtx = canvasCtx;
        
        this.ground; //The shared data for every piece of ground drawn (see _getPopulatedGroundObject())
		this.distance; //The distance between pieces of ground (on the z axis)
        
        this.groundZPositions = []; //The z-axis positions of every piece of ground
    }
	
	//gapZDistance is the number of units on the z axis that will seperate pieces of ground
	load(imagePath, imageHeight, gapZDistance)
	{
		this.ground = this._getPopulatedGroundObject(imagePath, imageHeight);
		this.distance = gapZDistance;
	}
    
    setupGround()
    {
        //Can't set in constructor as graphicEn wouldn't have been initialised then
        const canvasPositions = { 
            x: this._camera.canvasPositionX, 
            y: this._camera.canvasPositionY,
            width: this._camera.canvasPositionWidth,
            height: this._camera.canvasPositionHeight
        };
        
        this._populateGroundZPositions(canvasPositions);
    }
	
	_getPopulatedGroundObject(path, height)
	{
		return {
            image: this.kernel.loadImage(path),
            height, //Height to draw the image
            offset: 0 //The amount the images have all moved along the z-axis
        };
	}
	
	//canvasPositions should be an object with an x, y, width and height
	_populateGroundZPositions(canvasPositions)
	{
        // for(let currentZPos = this.helpers.zCalc.vPointDepth; currentZPos >= 0; currentZPos--)
        // {
		// 	if(this.groundZPositions.length === 0)
		// 	{
		// 		this.groundZPositions.push(this.helpers.zCalc.vPointDepth);
		// 		continue;
		// 	}
            
		// 	const lastZPosition = this.groundZPositions[this.groundZPositions.length - 1];
		// 	if(this.groundZPositions.length === 1)
        //     {
		// 		const currentZPosTopEdge = this.helpers.zCalc.y(canvasPositions.height, currentZPos);
		// 		const lastZPosTopEdge = this.helpers.zCalc.y(canvasPositions.height, lastZPosition);
		// 		const lastZPosHeight = this.helpers.zCalc.height(this.ground.height, lastZPosition);
				
        //         if(currentZPosTopEdge >= lastZPosTopEdge + lastZPosHeight)
        //         {
        //             this.ground.distance = (lastZPosition - currentZPos);
        //         }
        //     } 
			
		// 	if(lastZPosition - currentZPos === this.ground.distance)
		// 	{
		// 		this.groundZPositions.push(currentZPos - 1);
		// 	}
        // }
		
		
		
		//Start from far away, so we don't draw the distant ones on top of the closer ones
		for(let i = this.helpers.zCalc.vPointDepth; i >= 0; i -= this.distance)
		{
			this.groundZPositions.push(i);
		}
		
	}
	
	
    
    
    //This works by moving all of the images on the z-axis, until they have
    //moved into the preceeding image's starting position. As all the images
    //are the same, the positions can then just be reset, and it will look
    //like they are just continuing to move towards the camera.
    draw(levelSpeed)
    {
		this._resetGroundOffsetIfReachedDistance();
		
        for(let i = 0; i < this.groundZPositions.length; i++)
        {
            this.ground.offset += (levelSpeed / 75);
            this._drawLeftAndRightGroundImage(this.groundZPositions[i]);
        }
    }
	
	_resetGroundOffsetIfReachedDistance()
	{
		if(this.ground.offset >= this.distance)
		{
			this.ground.offset = 0;
		}
	}
	
	_drawLeftAndRightGroundImage(groundZPos)
	{
		const offsetZPos = groundZPos - this.ground.offset;
		
		const canvasBottomEdge = this._camera.canvasPositionY + this._camera.canvasPositionHeight;
		const canvasRightEdge = this._camera.canvasPositionX + this._camera.canvasPositionWidth;
		const imageWidth = this._camera.canvasPositionX + (this._camera.canvasPositionWidth * 2);
		
		const drawY = this.helpers.zCalc.y(canvasBottomEdge, offsetZPos);
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