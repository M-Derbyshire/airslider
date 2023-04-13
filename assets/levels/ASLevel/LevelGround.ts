import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';
import ICamera from '../../../engines/GraphicEn/ICamera';

/**
 * Draws an image on the ground at each side of the road.
 */
export default class LevelGround
{
	protected kernel:IKernel;
	protected helpers:IHelpers;
	
	private _camera:ICamera;
	private _canvasCtx:CanvasRenderingContext2D;
	private _groundPopulatedInitially:boolean;
	
	ground: IGround;
	distance: number;
	private _groundDrawCount: number;
	groundZPositions:number[];
	private _removeGround: boolean;
	
	
	/**
	 * Constructor
	 * @param canvasCtx The 2D canvas context
	 * @param camera The game's camera
	 * @param groundPopulatedInitially true if the ground should already be there. If false, player is moving towards the ground
	 */
    constructor(canvasCtx:CanvasRenderingContext2D, camera:ICamera, groundPopulatedInitially:boolean = true)
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
	
	/**
	 * Loads the level gound manager
	 * @param imagePath the file path to the image asset
	 * @param imageHeight the height to draw the image
	 * @param gapZDistance the number of units, on the z axis, between each pieces of ground
	 * @param imageStaticWidth if imageStaticWidth is provided, the image will not be stretched to fill the space
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
	 * 
	 * @param path the file path to the image asset
	 * @param height the height to draw the image
	 * @param width if this is null, the image will be stretched to fill the space
	 * @returns Details that will be used when drawing every piece of ground
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
	 * Generates the groundZPositions array (a list of z positions, to draw the gound pieces at).
	 * Also determines how many pieces of ground should be drawn at the start
	 */
	private _populateGroundZPositions():void
	{
		//Start from far away, so we don't draw the distant ones on top of the closer ones
		for(let i = this.helpers.zCalc.vPointDepth; i >= 0; i -= this.distance)
		{
			this.groundZPositions.push(i);
		}
		
		this._groundDrawCount = (this._groundPopulatedInitially) ? this.groundZPositions.length : 1;
	}
	
	
	/**
	 * Moves, and then draws, the ground pieces.
	 * This works by moving all of the images on the z-axis, until they have moved into the preceeding 
	 * image's starting position. As all the images are the same, the positions can then just be reset, 
	 * and it will look like they are just continuing to move towards the camera.
	 * @param levelSpeed The z speed of the level
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
	 * Use this to trigger the ending of the ground (the ground pieces will start to disappear, as if 
	 * the player is leaving the area that had that ground)
	 */
	removeGround():void
	{
		this._removeGround = true;
	}
	
	/**
	 * If a ground piece has been moved enough to now be in the position that the preceeding piece 
	 * started in, then the z offset can be reset back to 0. We do this for all the pieces, and it looks 
	 * like they're all still moving towards us.
	 * 
	 * Also increases/decreases the amount of ground pieces that will be drawn, as needed
	 */
	private _resetGroundIfReachedDistance():void
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
	
	/**
	 * Draws a piece of ground, on both sides, at the given z position
	 * @param groundZPos the z position of the ground piece
	 */
	private _drawLeftAndRightGroundImage(groundZPos:number):void
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
	
	/**
	 * Draws one of the ground pieces
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
 * Data used by LevelGround to draw ground images
 */
export interface IGround {
	image: HTMLImageElement,
	height: number, //Height to draw the image
	width: number|null, //Width to draw the image (if null, the image will be stretched to fill the space)
	offset: number //The amount the images have all moved along the z-axis
};