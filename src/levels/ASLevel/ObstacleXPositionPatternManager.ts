import Obstacle from "../../models/Obstacle/Obstacle";

/*
	Used to position a set of obstacles on the x-axis, in a way that will make 
	a pattern (or multiple patterns) when these objects move down the z-axis.
*/
export default class ObstacleXPositionPatternManager
{
	/**
	 * These are the models that can be used when making patterns
	 */
	private _models:Obstacle[];
	
	/**
	 * The patterns to be sent down the z-axis. See the addRepeatingPattern method.
	 */
	private _activePatterns:IActivePattern[];
	
	/**
	 * The index of the next model available (in the _models array).
	 * Incremented when positioning the models (less than 0 means not set)
	 */
	private _nextModelIndex:number;
	
	constructor()
	{
		this._models = [];
		this._activePatterns = [];
		
		this._nextModelIndex = -1;
	}
	
	/**
	 * Sets the default settings for this manager. The models to be used should all be of the same 
	 * type (or, at least, all have the same width)
	 * @param models the models to be used when creating patterns
	 */
	setPatternDefaults(models:Obstacle[]):void
	{
		this._models = models;
		this._nextModelIndex = models.length ? 0 : -1;
	}
	
	/**
	 * Adds a pattern to the queue of patterns.
	 * -----------------------------------------------------------------------
	 * The "pattern" property is an array of objects. Each represents a section of a line 
	 * of a pattern. These sections will be sent down the z-axis, one after the other
	 *  
	 * Each "pattern" object will have 2 properties: "fromPosition" and "toPosition" 
	 * (representing the x-axis positions of the start and end of that line of 
	 * the pattern -- please note, the first and last models are placed centered
	 * at these points, so that could cause some overlap).
	 * 
	 * NOTE: If the "fromPosition" and "toPosition" values are the same, then 
	 * a single model will be placed at that position.
	 * -----------------------------------------------------------------------
	 * The activePatterns array, as a whole, represents the multiple patterns (being sent down 
	 * the z-axis repeatably). All the activePatterns are started at the same time, so multiple 
	 * pattern arrays can be added to create patterns that share the same horizontal lines.
		-----------------------------------------------------------------------
	 * @param zAxisGap the distance between each model in the pattern, on the z-axis.
	 * @param patternMinXGap the minimum gap between models in the pattern, when placed along the x-axis
	 * @param pattern details about multiple lines of models (which are part of an overall pattern)
	 */
	addRepeatingPattern(zAxisGap:number, patternMinXGap:number, pattern:IPartialPattern[]):void
	{
		this._activePatterns.push({
			zGap: zAxisGap,
			patternMinXGap: patternMinXGap,
			positions: pattern,
			nextPosition: 0,
			lastModelIndexUsed: -1
		});
	}
	
	/**
	 * Sends the patterns down the z axis.
	 * If not enough models are provided, we'll loop back to the first one (it is up to the 
	 * caller to make sure the pattern manager has enough models for the patterns).
	 */
	sendPatterns():void
	{
		if(this._nextModelIndex >= 0)
			this._activePatterns.forEach(this._sendGivenPattern.bind(this));
	}
	
	/**
	 * Clears the previously set patterns
	 */
	clearPatterns():void
	{
		this._activePatterns = [];
	}
	
	/**
	 * Sends the given pattern down the z axis (if pattern is ready).
	 * @param pattern the pattern to send
	 */
	private _sendGivenPattern(pattern:IActivePattern):void
	{
		if(this._isTimeForNextLineOfPattern(pattern))
		{
			const xAxisLine = pattern.positions[pattern.nextPosition];
			
			const xAxisModelPositions = this._getPatternXAxisModelPositions(
				xAxisLine.fromPosition, 
				xAxisLine.toPosition,
				pattern.patternMinXGap
			);
			
			xAxisModelPositions.forEach((xPos) => this._setNextModelToXPosition(xPos, pattern));
			
			this._setPatternNextPosition(pattern);
		}
	}
	
	/**
	 * Is it time to send this line of the pattern down the Z axis? Based 
	 * on the pattern's zGap.
	 * @param pattern The pattern to check
	 * @returns true if the given line should now be sent, false if not
	 */
	private _isTimeForNextLineOfPattern(pattern:IActivePattern):boolean
	{
		const lastIndex = pattern.lastModelIndexUsed;
		if(lastIndex < 0) return true;
		
		const lastModelUsed = this._models[lastIndex];
		
		return (lastModelUsed.z <= (lastModelUsed.startZPosition - pattern.zGap));
	}
	
	/**
	 * Increases (or loops round) a pattern's nextPosition property
	 * @param pattern the pattern to change
	 */
	private _setPatternNextPosition(pattern:IActivePattern):void
	{
		if(pattern.nextPosition === pattern.positions.length - 1)
			pattern.nextPosition = 0;
		else
			pattern.nextPosition++;
	}
	
	/**
	 * Generates an array of x positions, to place models at
	 * @param fromPosition the first position, in units
	 * @param toPosition the last position, in units
	 * @param patternMinXGap the minimum gap, on the x axis, between models (in units)
	 * @returns an array of x positions
	 */
	private _getPatternXAxisModelPositions(fromPosition:number, toPosition:number, patternMinXGap:number):number[]
	{
		if(fromPosition === toPosition)
			return [fromPosition]; // We only need the one model in this situation
		
		const modelWidth = this._models[0]?.width ?? 0;
		
		// The width available to place models
		const spaceForPositions = (toPosition - fromPosition);
		
		// How many models will we need to populate this space?
		const requiredModelCount = Math.floor(spaceForPositions / (modelWidth + patternMinXGap)) + 1;
		
		// The width of the gap between models
		const gapToUse = patternMinXGap + ((spaceForPositions % (modelWidth + patternMinXGap)) / requiredModelCount);
		
		// Generate positions array
		let positions = [fromPosition];
		let previouslyAddedPosition = fromPosition;
		
		for(let i = 1; i < requiredModelCount; i++){
			positions.push(previouslyAddedPosition + modelWidth + gapToUse);
			previouslyAddedPosition = positions[i];
		}
		
		return positions;
	}
	
	/**
	 * Sets the next model in the range to a given x position
	 * @param xPos the x axis position
	 * @param pattern the pattern that these models are a part of
	 */
	private _setNextModelToXPosition(xPos:number, pattern:IActivePattern):void
	{
		pattern.lastModelIndexUsed = this._getNextModelIndex();
		const currentModel = this._models[pattern.lastModelIndexUsed];
		
		const modelCenterOffset = currentModel.width / 2;
		
		currentModel.resetToStart(xPos - modelCenterOffset);
	}
	
	/**
	 * Get the index of the next available model
	 * @returns the next available model's index
	 */
	private _getNextModelIndex():number
	{
		const currentIndex = this._nextModelIndex;
		
		if(currentIndex === this._models.length - 1)
			this._nextModelIndex = 0;
		else
			this._nextModelIndex++;
		
		return currentIndex;
	}
};



/**
 * Represents a whole pattern of obstacles, being sent down the z axis
 */
export interface IActivePattern {
	/**
	 * Sets the distance between each model in the pattern, on the z-axis.
	 */
	zGap:number;
	
	/**
	 * The minimum gap between models, along the x-axis
	 */
	patternMinXGap:number;
	
	/**
	 * An array of patterns, that make up this pattern. Each is a line on the x-axis (though may not be a complete line)
	 */
	positions:IPartialPattern[];
	
	/**
	 * The next index in the "positions" array that needs to be processed
	 */
	nextPosition:number;
	
	/**
	 * The index of the last model that was used while creating this pattern (less than 
	 * 0 means not set)
	 */
	lastModelIndexUsed:number;
};


/**
 * Represents a part of a pattern on a line (on the x axis)
 * (NOTE: If the "fromPosition" and "toPosition" values are the same, then a single model will be placed at that position.)
 */
export interface IPartialPattern {
	/**
	 * The left end of the pattern, in units
	 */
	fromPosition:number;
	
	/**
	 * The right end of the pattern, in units
	 */
	toPosition:number;
};