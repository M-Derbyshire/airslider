import IKernel from '../../../Kernel/IKernel';
import Kernel from '../../../Kernel/Kernel';
import IHelpers from '../../../Kernel/helpers/IHelpers';

/*
	Used to position a set of models on the x-axis, in a way that will make 
	a pattern (or multiple patterns) when these objects move down the z-axis. 
	The models to use are determined by a provided range of model indexes (in 
	the loaded models array, in the kernel).
*/
export default class ModelXPositionPatternManager
{
	private _kernel:IKernel;
	
	/**
	 * Where on the z axis should the pattern of models begin?
	 */
	private _startingZPos:number;
	
	/**
	 * This represents the range of index numbers in the loaded models 
	 * array, for the models that can be used when making patterns
	 */
	private _modelIndexRange:{ from:number, to:number };
	
	/**
	 * The width of the model animation being used
	 */
	private _modelAnimationWidth:number;
	
	/**
	 * The patterns to be sent. See addRepeatingPattern method.
	 */
	private _activePatterns:IActivePattern[];
	
	/**
	 * Incremented when positioning the models (less than 0 means not set)
	 */
	private _nextIndexInModelRange:number;
	
	
	/**
	 * Constructor
	 */
	constructor()
	{
		this._kernel = Kernel.getInstance();
		
		this._modelIndexRange = {
			from: -1,
			to: -1
		};
		
		this._activePatterns = [];
		
		this._nextIndexInModelRange = -1;
	}
	
	/**
	 * Sets the default settings for this manager
	 * @param fromModelIndex the first index, in the range of model indexes, that can be used by this
	 * @param toModelIndex the last index, in the range of model indexes, that can be used by this
	 * @param modelAnimationWidth how wide are the sprites of these models? (should be the same model type)
	 */
	setPatternDefaults(fromModelIndex:number, toModelIndex:number, modelAnimationWidth:number):void
	{
		this._nextIndexInModelRange = fromModelIndex;
		
		this._modelIndexRange = {
			from: fromModelIndex,
			to: toModelIndex
		};
		
		this._modelAnimationWidth = modelAnimationWidth;
	}
	
	/**
	 * Sets the z position that these patterns will begin at
	 * @param zPos the starting z position
	 */
	setStartingZPosition(zPos:number):void
	{
		this._startingZPos = zPos;
	}
	
	/**
	 * Adds a pattern to the queue of patterns.
	 * -----------------------------------------------------------------------
	 * The "pattern" property is an array of objects. 
	 * Each "pattern" object will have 2 properties: "fromPosition" and "toPosition" 
	 * (representing the x-axis positions of the start and end of that line of 
	 * the pattern -- please note, the first and last models are placed with their center
	 * at these points, so that will cause some overlap).
	 * 
	 * NOTE: If the "fromPosition" and "toPosition" values are the same, then 
	 * a single model will be placed at that position.
	 * -----------------------------------------------------------------------
	 * The activePatterns array, as a whole, represents the multiple patterns (being sent down 
	 * the z-axis repeatably). All the activePatterns are started at the same time 
		-----------------------------------------------------------------------
	 * @param zAxisGap the distance between each model in the pattern, on the z-axis.
	 * @param patternMinXGap the minimum gap between models placed along the x-axis
	 * @param pattern a part of the pattern
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
	 * Sends the patterns down the z axis
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
	 * Sends the given pattern down the z axis.
	 * If not enough models are provided, this will loop back to the first one (it is up to the 
	 * caller to make sure this has enough models for the patterns).
	 * @param pattern the pattern to send
	 */
	private _sendGivenPattern(pattern:IActivePattern):void
	{
		if(this._isTimeForNextLineOfPattern(pattern))
		{
			const currentXAxisLineInPattern = pattern.positions[pattern.nextPosition];
			
			const currentXAxisModelPositions = this._getPatternXAxisModelPositions(
				currentXAxisLineInPattern.fromPosition, 
				currentXAxisLineInPattern.toPosition,
				pattern.patternMinXGap
			);
			
			currentXAxisModelPositions.forEach((xPos) => this._setModelsToXPositions(xPos, pattern));
			
			this._setPatternNextPositionIndex(pattern);
		}
	}
	
	/**
	 * Is it time to send this line of the pattern down the z axis?
	 * @param pattern The pattern to check
	 * @returns true if the given line should now be sent, false if not
	 */
	private _isTimeForNextLineOfPattern(pattern:IActivePattern):boolean
	{
		const lastIndex = pattern.lastModelIndexUsed;
		const lastModelUsed = this._kernel.loadedModels[lastIndex];
		
		return (lastIndex < 0 || lastModelUsed.z <= (this._startingZPos - pattern.zGap));
	}
	
	/**
	 * Increases (or loops round) the pattern's nextPosition property
	 * @param pattern the pattern to change
	 */
	private _setPatternNextPositionIndex(pattern:IActivePattern):void
	{
		if(pattern.nextPosition === pattern.positions.length - 1)
		{
			pattern.nextPosition = 0;
		}
		else
		{
			pattern.nextPosition++;
		}
	}
	
	/**
	 * Generates an array of x positions, to place models at
	 * @param fromPosition the first position, in units, of the pattern
	 * @param toPosition the last position, in units, of the pattern
	 * @param patternMinXGap the minimum gap, on the x axis, between models
	 * @returns an array of x positions
	 */
	private _getPatternXAxisModelPositions(fromPosition:number, toPosition:number, patternMinXGap:number):number[]
	{
		if(fromPosition === toPosition) return [fromPosition];
		
		const widthForPositions = (toPosition - fromPosition);
		const requiredModelCount = Math.floor(widthForPositions / (this._modelAnimationWidth + patternMinXGap)) + 1;
		const gapToUse = patternMinXGap + ((widthForPositions % (this._modelAnimationWidth + patternMinXGap)) / requiredModelCount);
		
		let positions = [fromPosition];
		let lastPosition = fromPosition;
		for(let i = 1; i < requiredModelCount; i++){
			positions.push(lastPosition + this._modelAnimationWidth + gapToUse);
			lastPosition = positions[i];
		}
		
		return positions;
	}
	
	/**
	 * Sets the next model in the range to a given x position
	 * @param xPos the x axis position
	 * @param pattern the pattern that these models are a part of
	 */
	private _setModelsToXPositions(xPos:number, pattern:IActivePattern):void
	{
		const modelCenterOffset = this._modelAnimationWidth / 2;
		pattern.lastModelIndexUsed = this._getNextModelIndexInRange();
		const currentModel = this._kernel.loadedModels[pattern.lastModelIndexUsed];
		
		currentModel.z = this._startingZPos;
		currentModel.active = true;
		currentModel.x = xPos - modelCenterOffset;
	}
	
	/**
	 * Get the index of the next available model
	 * @returns the next available model index in the _modelIndexRange
	 */
	private _getNextModelIndexInRange():number
	{
		const currentIndex = this._nextIndexInModelRange;
		
		this._nextIndexInModelRange++;
		if(this._nextIndexInModelRange > this._modelIndexRange.to)
		{
			this._nextIndexInModelRange = this._modelIndexRange.from;
		}
		
		return currentIndex;
	}
}




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
	 * An array of patterns, that make up this pattern
	 */
	positions:IPartialPattern[];
	
	/**
	 * The next index in the "positions" array that needs to be processed
	 */
	nextPosition:number;
	
	/**
	 * The index of the last model that was used while creating this pattern
	 */
	lastModelIndexUsed:number;
};


/**
 * Represents a part of a pattern on a line
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