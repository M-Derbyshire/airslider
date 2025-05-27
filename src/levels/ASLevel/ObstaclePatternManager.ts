import Obstacle from "../../models/Obstacle/Obstacle";
import { generateRandomPositionModifier } from "./utils";

/*
	Used to create patterns of obstacles that move down the Z-axis, 
	towards the player
*/
export default class ObstaclePatternManager<T extends Obstacle>
{
	/**
	 * These are the models that can be used when making patterns
	 */
	private _models:T[];
	
	/**
	 * The pattern to be sent down the Z-axis
	 */
	private _pattern?:IPattern;
	
	/**
	 * The index of the next model available (in the _models array).
	 * This will be incremented when positioning the models
	 */
	private _nextModelIndex:number;
	
	/**
	 * The index of the next line of the pattern to send
	 */
	private _nextLineToSendIndex:number;
	
	constructor()
	{
		this._models = [];
		this._nextModelIndex = 0;
		this._nextLineToSendIndex = 0;
	}
	
	/**
	 * Gives the manager an array of obstacles that can be used when 
	 * making the pattern
	 * @param models the models to be used when creating patterns
	 */
	setModelsForPattern(models:T[]):void
	{
		this._models = models;
		this._nextModelIndex = 0;
		this._nextLineToSendIndex = 0;
	}
	
	/**
	 * Sets the pattern that the manager will use (the lines in the pattern will 
	 * be looped over)
	 * @param pattern the new pattern for the manager to use
	 */
	setRepeatingPattern(pattern:IPattern):void
	{
		this._pattern = pattern
	}
	
	/**
	 * Sends the pattern down the Z axis.
	 * If not enough models are provided, we'll loop back to the first one (it is up to the 
	 * caller to make sure we have enough models for the pattern)
	 */
	sendPattern():void
	{
		if(this._isTimeForNextLineOfPattern())
			this._sendNextLineOfPattern();
	}
	
	/**
	 * Sends the next line of the pattern down the Z-axis
	 */
	private _sendNextLineOfPattern():void
	{
		const line = this._pattern.positions[this._getNextLineIndex()];
		
		line.forEach((xPos) => {
			this._setNextModelToStartPosition(xPos, this._pattern.zModifierAbs);
		});
	}
	
	/**
	 * Checks if it is time to send the next line of the pattern down the Z-axis
	 * @returns true if the next line should now be sent, false if not
	 */
	private _isTimeForNextLineOfPattern():boolean
	{
		const noModels = !this._models.length;
		const noLines = !this._pattern || !this._pattern.positions.length;
		
		if(noModels || noLines)
			return false;
		
		let lastModelIndexUsed = this._nextModelIndex === 0
			? this._models.length - 1
			: this._nextModelIndex - 1;
		
		const lastModelUsed = this._models[lastModelIndexUsed];
		
		if(!lastModelUsed.active)
			return true;
		
		const requiredPositionForCurrentLine = lastModelUsed.startZPosition - this._pattern.zGap;
		
		return requiredPositionForCurrentLine >= lastModelUsed.z;
	}
	
	/**
	 * Sets the next available model to its starting Z-axis position, with the 
	 * given X-axis position
	 * @param xPos the X-axis position for the model
	 * @param maxZModifierAbs a number that is used to modify the model's Z-axis 
	 * position (to make it feel more naturally placed). The actual number that 
	 * will be used will be a random number between -maxZModifierAbs and maxZModifierAbs
	 */
	private _setNextModelToStartPosition(xPos:number, maxZModifierAbs:number):void
	{
		const model = this._models[this._getNextModelIndex()];
		const randomZModifier = generateRandomPositionModifier(maxZModifierAbs);
		
		model.resetToStart(xPos);
		model.z += randomZModifier;
	}
	
	/**
	 * Get the index of the next available model
	 * @returns the next available model's index
	 */
	private _getNextModelIndex():number
	{
		const nextIndex = this._nextModelIndex;
		this._nextModelIndex = this._getNextLoopedArrayIndex(nextIndex, this._models.length);
		
		return nextIndex;
	}
	
	/**
	 * Get the index of the next horizontal line in the pattern
	 * @returns the index of the next line
	 */
	private _getNextLineIndex():number
	{
		const nextIndex = this._nextLineToSendIndex;
		this._nextLineToSendIndex = this._getNextLoopedArrayIndex(nextIndex, this._pattern.positions.length);
		
		return nextIndex;
	}
	
	/**
	 * When you want to loop through an array, this will get the 
	 * next index number to use (looping back to 0 when it reaches 
	 * the array's length)
	 * @param currentIndex the index number we last used
	 * @param arrayLength the length of the array we're looping through
	 */
	private _getNextLoopedArrayIndex(currentIndex:number, arrayLength:number):number
	{
		return (currentIndex === arrayLength - 1)
			? 0
			: currentIndex + 1;
	}
};

/**
 * Represents a pattern of obstacles
 */
export interface IPattern {
	/**
	 * The distance (on the Z-axis) between each line of the pattern
	 */
	zGap:number;
	
	/**
	 * The Z position of the obstacles in a line can be given a random 
	 * modification. This number controls the min/max change that can be 
	 * made.
	 * 
	 * The maximum will be this number, and the minimum will be the negative 
	 * of this number.
	 */
	zModifierAbs:number;
	
	/**
	 * The X-axis positions to place the obstacles at, when creating the pattern.
	 * 
	 * The inner arrays represent the horizontal "lines" of the pattern. Each one 
	 * should contain the X-axis positions to draw the models at. Each line of 
	 * obstacles will be repeatably sent down the Z-axis, one after the other.
	 */
	positions:number[][];
};