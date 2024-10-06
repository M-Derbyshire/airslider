import Kernel from "../../../Kernel/Kernel";

/*
	Used to position a set of models on the x-axis, in a way that will make 
	a pattern (or multiple patterns) when these objects move down the z-axis. 
	The models this should use are determined using the provided range of model 
	indexes (their indexes in the loaded models array, in the kernel).
*/
export default class ModelXPositionPatternManager
{
	/**
	 * Where on the z axis should the pattern of models begin?
	 */
	private _startingZPos:number;
	
	/**
	 * This represents a range of indexes in the loaded models 
	 * array. It is the range of models that can be used when 
	 * making patterns
	 */
	private _modelIndexRange:{ from:number, to:number };
	
	/**
	 * The patterns to be sent down the z-axis. See the addRepeatingPattern method.
	 */
	private _activePatterns:IActivePattern[];
	
	/**
	 * The next model available (in the model index range).
	 * Incremented when positioning the models (less than 0 means not set)
	 */
	private _nextIndexInModelRange:number;
	
	constructor()
	{
		this._modelIndexRange = {
			from: -1,
			to: -1
		};
		
		this._activePatterns = [];
		
		this._nextIndexInModelRange = -1;
	}
	
	/**
	 * Sets the default settings for this manager. The models to be used should all be the same (or at least 
	 * all have the same width)
	 * @param fromModelIndex the first index, in the range of model indexes, that can be used by the pattern manager
	 * @param toModelIndex the last index, in the range of model indexes, that can be used by the pattern manager
	 */
	setPatternDefaults(fromModelIndex:number, toModelIndex:number):void
	{
		this._nextIndexInModelRange = fromModelIndex;
		
		this._modelIndexRange = {
			from: fromModelIndex,
			to: toModelIndex
		};
	}
	
	/**
	 * Sets the z position that patterns will begin at
	 * @param zPos the starting z position
	 */
	setStartingZPosition(zPos:number):void
	{
		this._startingZPos = zPos;
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
		if(this._nextIndexInModelRange >= 0)
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
	 * Is it time to send this line of the pattern down the z axis? Based 
	 * on the pattern's zGap.
	 * @param pattern The pattern to check
	 * @returns true if the given line should now be sent, false if not
	 */
	private _isTimeForNextLineOfPattern(pattern:IActivePattern):boolean
	{
		const lastIndex = pattern.lastModelIndexUsed;
		if(lastIndex < 0) return true;
		
		const lastModelUsed = Kernel.getInstance().loadedModels[lastIndex];
		
		return (lastModelUsed.z <= (this._startingZPos - pattern.zGap));
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
		if(fromPosition === toPosition) return [fromPosition]; // We only need the one model in this situation
		
		const modelWidth = Kernel.getInstance().loadedModels[this._modelIndexRange.from].width;
		
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
		pattern.lastModelIndexUsed = this._getNextModelIndexInRange();
		const currentModel = Kernel.getInstance().loadedModels[pattern.lastModelIndexUsed];
		
		const modelCenterOffset = currentModel.width / 2;
		
		currentModel.z = this._startingZPos;
		currentModel.active = true;
		currentModel.x = xPos - modelCenterOffset;
	}
	
	/**
	 * Get the index of the next available model in the model range
	 * @returns the next available model index in the _modelIndexRange
	 */
	private _getNextModelIndexInRange():number
	{
		const currentIndex = this._nextIndexInModelRange;
		
		if(currentIndex === this._modelIndexRange.to)
			this._nextIndexInModelRange = this._modelIndexRange.from;
		else
			this._nextIndexInModelRange++;
		
		return currentIndex;
	}
};



/**
 * Represents a whole pattern of models, being sent down the z axis
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