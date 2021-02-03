/*
	Used to position a set of models on the x-axis, in a way that will make 
	a pattern when these objects move down the z-axis. The models to use are 
	determined by a provided range of model indexes (in the loaded models array, 
	in the kernel).
*/
class ModelXPositionPatternManager
{
	constructor()
	{
		this._kernel = Kernel.getInstance();
		this._helpers = this._kernel.helpers;
		
		this._startingZPos;
		
		//This will be an object with 2 properties: "from" and "to".
		//This represents the range of index numbers in the loaded models 
		//	array, for the models that can be used by this to make patterns
		this._modelIndexRange;
		
		//The patterns to be sent. See addRepeatingPattern method.
		this._activePatterns = [];
		
		//Incremented when positioning models (less than 0 means not set)
		this._nextIndexInModelRange = -1;
	}
	
	
	//Set the range of models in the models array to be used to create patterns
	setModelIndexRange(fromIndex, toIndex)
	{
		this._nextIndexInModelRange = fromIndex;
		
		this._modelIndexRange = {
			from: fromIndex,
			to: toIndex
		};
	}
	
	setStartingZPosition(zPos)
	{
		this._startingZPos = zPos;
	}
	
	
	//Adds a pattern to the queue, to be repeated for the given milliseconds.
	//The "pattern" property is an array of objects. 
	//Each object will have 2 properties: "fromPosition" and "toPosition" 
	//(representing the x-axis positions of the start and end of that line of 
	//the pattern).
	//The array, as a whole, represents the multiple lines (being sent down 
	//the z-axis) that make up the pattern. The zAxisGap property sets the 
	//distance between each model in the pattern, on the z-axis.
	
	//NOTE: If the "fromPosition" and "toPosition" values are the same, then 
	//a single model will be placed at that position.
	addRepeatingPattern(zAxisGap, repeatForMS, pattern)
	{
		const dateTime = new Date();
		this._activePatterns.push({
			zGap: zAxisGap,
			activeUntil: dateTime.getTime() + repeatForMS,
			positions: pattern,
			nextPosition: 0, //The next index in the positions array
			lastModelIndexUsed: -1 //The last model sent for this pattern. Less than 0 means not set
		});
	}
	
	
	//Run all currently active patterns.
	//If _nextIndexInModelRange is less than 0 (meaning not set), this will do nothing.
	//If not enough models are provided, this will go back to the first (it is up to the 
	//caller to make sure this has enough models for the pattern).
	sendPatterns()
	{
		if(this._nextIndexInModelRange < 0) return;
		
		//Action the active patterns
		this._activePatterns.forEach(pattern => {
			
			//Is it time to send the next model?
			const lastIndex = pattern.lastModelIndexUsed;
			if(lastIndex < 0 || this._kernel.loadedModels[lastIndex].z <= (this._startingZPos - pattern.zGap))
			{
				pattern.lastModelIndexUsed = this._getNextModelIndexInRange();
				
				const currentModel = this._kernel.loadedModels[pattern.lastModelIndexUsed];
				currentModel.z = this._startingZPos;
				currentModel.active = true;
				
				const modelCenterOffset = currentModel.width / 2;
				
				const currentLineInPattern = pattern.positions[pattern.nextPosition];
				pattern.nextPosition = 
					(pattern.nextPosition === pattern.positions.length - 1) ? 0 : pattern.nextPosition + 1;
				
				//If we only need to draw one model
				if(currentLineInPattern.fromPosition === currentLineInPattern.toPosition)
				{
					currentModel.x = currentLineInPattern.fromPosition - modelCenterOffset;
				}
			}
			
		});
		
		
		//Now we need to remove any patterns that should no longer be active
		this._removeInactivePatterns();
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