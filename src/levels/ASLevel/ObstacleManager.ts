import Kernel from '../../../Kernel/Kernel';
import IModel from '../../../Kernel/entities/Model/IModel';
import Obstacle from '../../models/Obstacle/Obstacle';
import ASLevel from './ASLevel';

/**
 * Manages the level's "obstacle" models, setting their x positions and sending them down the road
 */
export default class ObstacleManager<T extends Obstacle>
{
	// The model of the player character
	protected playerModel:IModel;
	
	// The edges of the area (in units) that the obstacles can move within
	private _leftEdge:number;
	private _rightEdge:number;
	
	// The level's obstacles.
	private _obstacles:T[];
	
	// The width of the obstacles we're working with
	private _obstacleWidth:number;
	
	// We should only have this amount of lines (of obstacles) on the track at any one time
	private _lineCount:number;
	
	// This is the minimum amount of obstacles the manager requires
	private _minObstacleCount:number;
	
	// The index number of the last obstacle that was sent (if this is negative, none have been sent)
	private _lastSentObstacleIndex:number;
	
	// Should the next line of obstacles be placed on the right side of the track?
	private _placeLineOnRight:boolean;
	
	/**
	 * The left edge (in units) of the area that the obstacles can move within
	 */
    get leftEdge() { return this._leftEdge; }
	
	/**
	 * The right edge (in units) of the area that the obstacles can move within
	 */
    get rightEdge() { return this._rightEdge; }
	
	/**
	 * The amount of lines (of obstacles) that can be on the track at any one time
	 */
	get currentLineCount() { return this._lineCount }
	
	
	
    constructor()
    {
        this._leftEdge = 0;
        this._rightEdge = 0;
        
		this._obstacles = [];
        
        this._lineCount = 0;
		this._minObstacleCount = 2;
		
		this._placeLineOnRight = false;
    }
    
	/**
	 * Sets the horizontal area that we want the obstacles to be able to move in
	 * @param left the left edge (in units)
	 * @param right the right edge (in units)
	 */
    setAreaEdges(left:number, right:number):void
    {
        this._leftEdge = left;
        this._rightEdge = right;
    }
    
	/**
	 * Give the manager the obstacles for the level (you are required to provide enough
	 * obstacles for the current line count that you have set)
	 * @param obstacles the obstacles
	 */
    setObstacleModels(obstacles:T[]):void
    {
		if(obstacles.length < this._minObstacleCount)
			throw new Error(
				`${obstacles.length} obstacles have been provided to the ObstacleManager. The minimum required is ${this._minObstacleCount}`
			);
		
        this._obstacles = obstacles;
		this._obstacleWidth = this._getObstaclesWidth();
		this._lastSentObstacleIndex = -1;
    }
    
	/**
	 * How many lines of obstacles can be in play at any one time?
	 * (This will affect the difficulty)
	 * @param num the amount of lines that are allowed on the track at 
	 * the same time
	 */
    setCurrentLineCount(num:number):void
    {
		this._lineCount = num;
    }
    
	/**
	 * Store a reference to the player model
	 * @param model the player model
	 */
	setPlayerModel(model:IModel):void
	{
		this.playerModel = model;
	}
    
    /**
	 * Sends another line of obstacles, if needed
	 */
    sendObstaclesIfReady():void
    {
		const lineMinSize = 2; // The least amount of obstacles per line
		const lineMaxSize = this._minObstacleCount; // The max amount of obstacles per line
		const obstacleCount = Math.floor(Math.random() * lineMaxSize) + lineMinSize;
		
		if(this._isTimeToSendNextLine())
		{
			const xPositions = this._getObstacleXPositions(obstacleCount);
			
			const obstacles = [];
			for(let i = 0; i < obstacleCount; i++)
			{
				const obstacle = this._obstacles[this._getIndexForNextObstacle()];
				
				obstacle.resetToStart(xPositions[i]);
				obstacle.z += this._getObstacleStartZModifier(20);
				obstacles.push(obstacle);
			}
		}
    }
	
	/**
	 * Is it time for a line of obstacles to be sent down the track?
	 * @returns true if we should send a new line, or false if not
	 */
	private _isTimeToSendNextLine():boolean
	{
		if(this._lastSentObstacleIndex < 0)
			return true;
		
		const lastSentObstacle = this._obstacles[this._lastSentObstacleIndex];
		
		const vanishingPointDepth = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
		
		const desiredZGap = vanishingPointDepth / this._lineCount;
		const lastObstaclesDistance = vanishingPointDepth - lastSentObstacle.z;
		
		return lastObstaclesDistance > desiredZGap;
	}
	
	/**
	 * Increases (or loops) the _lastSentObstacleIndex value to the next 
	 * obstacle that can be used
	 * @returns the index of the next obstacle that we can use
	 */
	private _getIndexForNextObstacle():number
	{
		const lastObstacleIndex = this._obstacles.length - 1;
		const maxIndexReached = this._lastSentObstacleIndex === lastObstacleIndex;
		
		if(maxIndexReached)
			return this._lastSentObstacleIndex = 0;
		
		return ++this._lastSentObstacleIndex;
	}
	
	/**
	 * Get the X positions for a line of obstacles
	 * @param count the amount of positions to return
	 * @returns the X positions (in units) that the obstacles should be placed at
	 */
	private _getObstacleXPositions(count:number):number[]
	{
		this._placeLineOnRight = !this._placeLineOnRight;
		
		let leftEdgeOfLine;
		
		if(this._placeLineOnRight)
		{
			const lineWidth = this._obstacleWidth * count;
			leftEdgeOfLine = this._rightEdge - lineWidth;
		}
		else
		{
			leftEdgeOfLine = this._leftEdge;
		}
		
		return this._generateObstaclePositionsFromLineX(leftEdgeOfLine, count)
	}
	
	/**
	 * Generates a line of X positions, from the given X position (which acts as the left 
	 * edge of the line)
	 * @param lineX the left edge of the line
	 * @param count the amount of positions to return
	 * @returns the X positions for the obstacles, starting at the given line X
	 */
	private _generateObstaclePositionsFromLineX(lineX:number, count:number):number[]
	{
		const positions = [];
		for(let i = 0; i < count; i++) 
			positions.push(lineX + (this._obstacleWidth * i));
		
		return positions;
	}
	
	/**
	 * Generates a number (which could be negative) that can be added to an 
	 * obstacle's Z position, to give it a bit of randomness before it is 
	 * sent down the track.
	 * @param absMax the maximum/minimum value (the negative of this value 
	 * will be the minimum)
	 * @returns a number that should be added to the obstacle's Z value, 
	 * after it has been reset to its start position
	 */
	private _getObstacleStartZModifier(absMax:number):number
	{
		const randMax = absMax * 2;
		return (Math.random() * randMax) - absMax;
	}
	
	/**
	 * Gets the width of the obstacles we are working with
	 * @returns the width of the obstacles (or 0 if we have no 
	 * obstacles)
	 */
	private _getObstaclesWidth():number
	{
		if(this._obstacles.length === 0)
			return 0;
		
		return this._obstacles[0].width;
	}
}