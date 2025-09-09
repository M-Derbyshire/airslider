import Kernel from '../../../../Kernel/Kernel';
import IModel from '../../../../Kernel/entities/Model/IModel';
import Obstacle from '../../../models/Obstacle/Obstacle';
import ASLevel from '../ASLevel';
import { generateRandomPositionModifier } from '../utils';

/**
 * Manages the level's "obstacle" models, setting their x positions and sending them down the road
 */
export default class ObstacleManager<T extends Obstacle>
{
	// The model of the player character
	protected playerModel:IModel;
	
	// The edges of the area (in units) that the obstacles can move within
	protected areaLeftEdge:number;
	protected areaRightEdge:number;
	
	// The level's obstacles.
	protected obstacles:T[];
	
	// The width of the obstacles we're working with
	protected obstacleWidth:number;
	
	// This is the minimum amount of obstacles the manager requires
	protected minObstacleCount:number;
	
	// This value affects the maximum change that will be made to an obstacle's Z-axis 
	// position, before it's sent
	protected zModifierAbsMax:number;
	
	// We should only have this amount of lines (of obstacles) on the track at any one time
	private _lineCount:number;
	
	// The index number of the last obstacle that was sent (if this is negative, none have been sent)
	private _lastSentObstacleIndex:number;
	
	/**
	 * The amount of lines (of obstacles) that can be on the track at any one time
	 */
	get currentLineCount() { return this._lineCount }
	
	/**
	 * Resets the manager
	 */
	reset():void
	{
		this.areaLeftEdge = 0;
        this.areaRightEdge = 0;
        
		this.obstacles = [];
        
        this._lineCount = 0;
		this.minObstacleCount = 2;
		
		this.zModifierAbsMax = 0;
	}
    
	/**
	 * Sets the horizontal area that we want the obstacles to be able to move in
	 * @param left the left edge (in units)
	 * @param right the right edge (in units)
	 */
    setAreaEdges(left:number, right:number):void
    {
        this.areaLeftEdge = left;
        this.areaRightEdge = right;
    }
    
	/**
	 * Give the manager the obstacles for the level (you are required to provide enough
	 * obstacles for the current line count that you have set)
	 * @param obstacles the obstacles
	 */
    setObstacleModels(obstacles:T[]):void
    {
		if(obstacles.length < this.minObstacleCount)
			throw new Error(
				`${obstacles.length} obstacles have been provided to the ObstacleManager. The minimum required is ${this.minObstacleCount}`
			);
		
        this.obstacles = obstacles;
		this.obstacleWidth = this._getObstaclesWidth();
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
		if(this.isTimeToSendNextLine())
		{
			const xPositions = this.getObstacleXPositionsForLine();
			
			xPositions.forEach(position => {
				const obstacle = this.obstacles[this.getIndexForNextObstacle()];
				
				obstacle.resetToStart(position);
				obstacle.z += generateRandomPositionModifier(this.zModifierAbsMax);
			});
		}
    }
	
	/**
	 * Is it time for a line of obstacles to be sent down the track?
	 * @returns true if we should send a new line, or false if not
	 */
	protected isTimeToSendNextLine():boolean
	{
		if(this._lastSentObstacleIndex < 0)
			return true;
		
		const lastSentObstacle = this.obstacles[this._lastSentObstacleIndex];
		
		const vanishingPointDepth = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
		
		const desiredZGap = vanishingPointDepth / this._lineCount;
		const lastObstaclesDistance = vanishingPointDepth - lastSentObstacle.z;
		
		return lastObstaclesDistance > desiredZGap;
	}
	
	/**
	 * Get the X positions for a line of obstacles
	 * @returns the X positions (in units) that the obstacles should be placed at
	 */
	protected getObstacleXPositionsForLine():number[]
	{
		return [];
	}
	
	/**
	 * Increases (or loops) the manager's internal state to point to the next 
	 * obstacle that can be used
	 * @returns the index of the next obstacle that we can use
	 */
	protected getIndexForNextObstacle():number
	{
		this._lastSentObstacleIndex = this.peekIndexForNextObstacle();
		return this._lastSentObstacleIndex;
	}
	
	/**
	 * Gets the index of the next obstacle that will be used (without
	 * moving the manager's state to the next index)
	 * @returns the index of the next obstacle that will be used
	 */
	protected peekIndexForNextObstacle():number
	{
		const lastObstacleIndex = this.obstacles.length - 1;
		const maxIndexReached = this._lastSentObstacleIndex === lastObstacleIndex;
		
		if(maxIndexReached)
			return 0;
		
		return this._lastSentObstacleIndex + 1;
	}
	
	/**
	 * Gets the width of the obstacles we are working with
	 * @returns the width of the obstacles (or 0 if we have no 
	 * obstacles)
	 */
	private _getObstaclesWidth():number
	{
		if(this.obstacles.length === 0)
			return 0;
		
		return this.obstacles[0].width;
	}
}