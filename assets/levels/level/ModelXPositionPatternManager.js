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
		
		//This will be an object with 2 properties: "from" and "to".
		//This represents the range of index numbers in the loaded models 
		//	array, for the models that can be used by this to make patterns
		this._modelIndexRange;
		
		//The patterns to be sent. See addRepeatingPattern method.
		this._activePatterns = [];
	}
	
	
	//Set the range of models in the models array to be used to create patterns
	setModelIndexRange(fromIndex, toIndex)
	{
		this._modelIndexRange = {
			from: fromIndex,
			to: toIndex
		};
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
		
	}
}