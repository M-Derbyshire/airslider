import Kernel from '/kernel/kernel';

/*
	Used to position a set of models on the x-axis, in a way that will make 
	a pattern (or multiple patterns) when these objects move down the z-axis. 
	The models to use are determined by a provided range of model indexes (in 
	the loaded models array, in the kernel).
*/
export default class ModelXPositionPatternManager
{
	constructor()
	{
		this._kernel = Kernel.getInstance();
		this._helpers = this._kernel.helpers;
		
		this._startingZPos;
		
		//This represents the range of index numbers in the loaded models 
		//	array, for the models that can be used when making patterns
		this._modelIndexRange = {
			from: -1,
			to: -1
		};
		
		this._modelAnimationWidth; //The width of the model animation being used
		
		//The patterns to be sent. See addRepeatingPattern method.
		this._activePatterns = [];
		
		//Incremented when positioning the models (less than 0 means not set)
		this._nextIndexInModelRange = -1;
	}
	
	/*
		fromModelIndex, toModelIndex - defines the range of models that can be used
		modelAnimationWidth - the width of the models that are being used
	*/
	setPatternDefaults(fromModelIndex, toModelIndex, modelAnimationWidth)
	{
		this._nextIndexInModelRange = fromModelIndex;
		
		this._modelIndexRange = {
			from: fromModelIndex,
			to: toModelIndex
		};
		
		this._modelAnimationWidth = modelAnimationWidth;
	}
	
	setStartingZPosition(zPos)
	{
		this._startingZPos = zPos;
	}
	
	
	/*
		Adds a pattern to the queue of patterns, to be repeated for the given milliseconds.
		-----------------------------------------------------------------------
		The "pattern" property is an array of objects. 
		Each "pattern" object will have 2 properties: "fromPosition" and "toPosition" 
		(representing the x-axis positions of the start and end of that line of 
		the pattern -- please note, the first and last models are placed with their center
		at these points, so that will cause some overlap).
		
		NOTE: If the "fromPosition" and "toPosition" values are the same, then 
		a single model will be placed at that position.
		-----------------------------------------------------------------------
		The activePatterns array, as a whole, represents the multiple patterns (being sent down 
		the z-axis). 
		
		The zAxisGap property sets the distance between each model in the pattern, on the z-axis.
		
		The patternMinXGap parameter is the minimum gap between models placed along the x-axis, 
		for that pattern.
		-----------------------------------------------------------------------
	*/
	addRepeatingPattern(zAxisGap, patternMinXGap, repeatForMS, pattern)
	{
		const dateTime = new Date();
		this._activePatterns.push({
			zGap: zAxisGap,
			patternMinXGap: patternMinXGap,
			activeUntil: dateTime.getTime() + repeatForMS,
			positions: pattern,
			nextPosition: 0, //The next index in the "positions" array that needs to be processed
			lastModelIndexUsed: -1
		});
	}
	
	
	//Run all currently active patterns.
	//If _nextIndexInModelRange is less than 0 (meaning not set), this will do nothing.
	//If not enough models are provided, this will go back to the first (it is up to the 
	//caller to make sure this has enough models for the patterns).
	sendPatterns()
	{
		if(this._nextIndexInModelRange < 0) return;
		
		//When placing models, their center should be in the given position.
		//This helps us do that (minus it from the position).
		const modelCenterOffset = this._modelAnimationWidth / 2;
		
		//Action the active patterns
		this._activePatterns.forEach(pattern => {
			
			//Is it time to send the next line of models?
			const lastIndex = pattern.lastModelIndexUsed;
			if(lastIndex < 0 || this._kernel.loadedModels[lastIndex].z <= (this._startingZPos - pattern.zGap))
			{
				//Get the current line of the pattern
				const currentLineInPattern = pattern.positions[pattern.nextPosition];
				pattern.nextPosition = 
					(pattern.nextPosition === pattern.positions.length - 1) ? 0 : pattern.nextPosition + 1;
				
				//Get the positions for each model on this line
				const modelPositionsForLine = this._getPatternLinePositions(
					currentLineInPattern.fromPosition, 
					currentLineInPattern.toPosition,
					pattern.patternMinXGap
				);
				
				//Set the positions of the models for this line
				modelPositionsForLine.forEach(xPos => {
					
					pattern.lastModelIndexUsed = this._getNextModelIndexInRange();
					const currentModel = this._kernel.loadedModels[pattern.lastModelIndexUsed];
					
					currentModel.z = this._startingZPos;
					currentModel.active = true;
					currentModel.x = xPos - modelCenterOffset;
					
				});
				
			}
			
		});
		
		
		//Now we need to remove any patterns that should no longer be active
		this._removeInactivePatterns();
	}
	
	
	//When placing models along the x-axis, to make a line at that z position
	_getPatternLinePositions(fromPosition, toPosition, patternMinXGap)
	{
		//If we only need to place one model, the caller should provide
		//the same value for from and to
		if(fromPosition === toPosition) return [fromPosition];
		
		
		//If we need to place multiple models in a line along the x-axis
		//--------------------------------------------------------------
		
		//The width we have to fill with models
		const widthForPositions = (toPosition - fromPosition);
		
		//Calculate the required amount of models, and then increase the gap to fill 
		//the remaining space.
		//(We're adding one to the model count, as otherwise the end of the last gap 
		//isn't included)
		const modelCount = Math.floor(widthForPositions / (this._modelAnimationWidth + patternMinXGap)) + 1;
		const gapToUse = patternMinXGap + ((widthForPositions % (this._modelAnimationWidth + patternMinXGap)) / modelCount);
		
		//Now put together the array of positions
		let positions = [fromPosition];
		let lastPosition = fromPosition;
		for(let i = 1; i < modelCount; i++){
			positions.push(lastPosition + this._modelAnimationWidth + gapToUse);
			lastPosition = positions[i];
		}
		
		return positions;
	}
	
	
	
	_getNextModelIndexInRange()
	{
		const currentIndex = this._nextIndexInModelRange; //To be returned
		
		//If we've reached the last model in the range, go back to the first
		this._nextIndexInModelRange = (this._nextIndexInModelRange === this._modelIndexRange.to) ? 
				this._modelIndexRange.from : 
				this._nextIndexInModelRange + 1;
		
		return currentIndex;
	}
	
	
	
	_removeInactivePatterns()
	{
		const dateTime = new Date();
		this._activePatterns = this._activePatterns.filter(pattern => dateTime.getTime() < pattern.activeUntil);
	}
}