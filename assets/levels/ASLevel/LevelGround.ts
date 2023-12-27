import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import ICamera from '../../../engines/GraphicEngine/ICamera';

/**
 * Draws an image on the ground at each side of the road.
 */
export default class LevelGround
{
	protected kernel:IKernel;
	protected helpers:IHelpers;
	
	private _camera:ICamera;
	private _canvasCtx:CanvasRenderingContext2D;
	private _groundPopulatedInitially:boolean; // True if the images should be drawn from the start. If false, player is moving towards them
	
	private _groundDrawCount: number; // How many images should we draw (starting from the furthest away)?
	private _removeGround: boolean; // If the player is leaving this area of ground, we want to start removing the images
	
	ground: IGround; //The shared data for every image (populated in load() by _getPopulatedGroundObject())
	distance: number;//The distance between each image on the ground (on the z axis)
	groundZPositions:number[]; //The z-axis positions of every image on the ground
	
	/**
	 * Constructor
	 * @param camera The level's camera
	 * @param groundPopulatedInitially true if the images should already be there. If false, player is moving towards them
	 */
    constructor(camera:ICamera, groundPopulatedInitially:boolean = true)
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;

        this._camera = camera;
        this._canvasCtx = this.kernel.gameContext;
		this._groundPopulatedInitially = groundPopulatedInitially;
		
		this._removeGround = false;
		
        this.groundZPositions = [];
    }
	
	/**
	 * Loads the level ground manager
	 * @param imagePath the file path to the image asset
	 * @param imageHeight the height to draw the image
	 * @param gapZDistance the number of units, on the z axis, between each image on the ground
	 * @param imageStaticWidth if imageStaticWidth is not provided, the image will be stretched to fill the space. Provided width shouldn't be in units
	 */
	load(imagePath:string, imageHeight:number, gapZDistance:number, imageStaticWidth:number|null = null):void
	{
		this.ground = this._getPopulatedGroundObject(imagePath, imageHeight, imageStaticWidth);
		this.distance = gapZDistance;
	}
    
	/**
	 * Prepares the ground
	 */
    setupGround():void
    {
        this._populateGroundZPositions();
    }
	
	/**
	 * Moves, and then draws, the images on the ground.
	 * This works by moving all of the images on the z-axis, until they have moved into the preceeding 
	 * image's starting position. As all the images are the same, the positions can then just be reset, 
	 * and it will look like they are just continuing to move towards the camera.
	 * @param levelSpeed The z speed of the level (after it's been calculated by the zCalc)
	 */
    draw(levelSpeed:number):void
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
	
	/**
	 * Use this to trigger the ending of the ground (the images will start to disappear, as if 
	 * the player is leaving the area that had that ground)
	 */
	removeGround():void
	{
		this._removeGround = true;
	}
	
	/**
	 * Sets up the shared details that will be used when drawing each image on the ground
	 * @param path the file path to the image asset
	 * @param height the height to draw the image
	 * @param width if this is null, the image will be stretched to fill the space. Otherwise, this is used as the width. Provided width shouldn't be in units
	 * @returns Details that will be used when drawing every image
	 */
	private _getPopulatedGroundObject(path:string, height:number, width:number|null):IGround
	{
		return {
            image: this.kernel.loadImage(path),
            height, //Height to draw the image
			width,
            offset: 0 //The amount the images have all moved along the z-axis
        };
	}
	
	/**
	 * Generates the groundZPositions array (a list of z positions to draw the images at).
	 * Also determines how many images should be drawn at the start
	 */
	private _populateGroundZPositions():void
	{
		this.groundZPositions = [];
		
		//Start from the furthest away, and move inwards, so we don't draw the distant ones on top of the closer ones
		for(let zPos = this.helpers.zCalc.vPointDepth; zPos >= 0; zPos -= this.distance)
		{
			this.groundZPositions.push(zPos);
		}
		
		this._groundDrawCount = (this._groundPopulatedInitially) ? this.groundZPositions.length : 1;
	}
	
	/**
	 * If an image has been moved enough to now be in the same position that the preceeding image 
	 * started in, then the z offset can be reset back to 0. We do this for all the images, and it looks 
	 * like they're all still moving towards us.
	 * 
	 * Also increases/decreases the amount of images that will be drawn, as needed (e.g. if entering/leaving the
	 * area of the level that needs them)
	 */
	private _resetGroundIfReachedDistance():void
	{
		if(this.ground.offset >= this.distance)
		{
			this.ground.offset = 0;
			
			if(!this._groundPopulatedInitially && this._groundDrawCount < this.groundZPositions.length)
			{
				this._groundDrawCount++;
			}
				
			if(this._removeGround)
			{
				this.groundZPositions.shift();
			}
		}
	}
	
	/**
	 * Draws an image on the ground, on both sides, at the given z position
	 * @param groundZPos the initial z position of the image
	 */
	private _drawLeftAndRightGroundImage(groundZPos:number):void
	{
		const offsetZPos = groundZPos - this.ground.offset;
		
		const canvasBottomEdge = this._camera.canvasPositionY + this._camera.canvasPositionHeight;
		const canvasRightEdge = this._camera.canvasPositionX + this._camera.canvasPositionWidth;
		
		// The default for this needs to be double the width of the canvas (at 0 on z-axis) to look right
		const imageWidth = (this.ground.width) 
			? this.ground.width 
			: this._camera.canvasPositionX + (this._camera.canvasPositionWidth * 2);
		
		const drawY = this.helpers.zCalc.y(canvasBottomEdge - this.ground.height, offsetZPos);
		const drawWidth = this.helpers.zCalc.width(imageWidth, offsetZPos);
		const drawHeight = this.helpers.zCalc.height(this.helpers.unit.yUnit(this.ground.height), offsetZPos);
		
		// At 0 on the z-axis, these should be fully off the screen (in the bottom corners)
		const leftDrawX = this.helpers.zCalc.x(this._camera.canvasPositionX - imageWidth, offsetZPos);
		const rightDrawX = this.helpers.zCalc.x(canvasRightEdge, offsetZPos);
		
		this._drawGroundImage(leftDrawX, drawY, drawWidth, drawHeight);
		this._drawGroundImage(rightDrawX, drawY, drawWidth, drawHeight);
	}
	
	/**
	 * Draws one of the images on the ground
	 * @param x the x position (not in units) to draw at
	 * @param y the y position (not in units) to draw at
	 * @param width the width (not in units) to draw with
	 * @param height the height (not in units) to draw with
	 */
	private _drawGroundImage(x:number, y:number, width:number, height:number):void
	{
		this._canvasCtx.drawImage(this.ground.image, x, y, width, height);
	}
}

/**
 * Data used by LevelGround to draw images on the ground
 */
export interface IGround {
	image: HTMLImageElement,
	height: number, //Height to draw the image (not in units)
	width: number|null, //Width to draw the image (not in units). If null, the image will be stretched to fill the space
	offset: number //The amount the images have all moved along the z-axis
};