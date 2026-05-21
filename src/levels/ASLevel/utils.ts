/**
	 * Generates a random number (which could be negative) that can be added to a 
	 * model's position, to give it a bit of randomness on that axis
	 * @param absMax the maximum/minimum value (the negative of this value 
	 * will be the minimum)
	 * @returns a random number that will be between -absMax and absMax
	 */
const generateRandomPositionModifier = (absMax:number):number => {
    const randMax = absMax * 2;
    return (Math.random() * randMax) - absMax;
};

export { generateRandomPositionModifier };