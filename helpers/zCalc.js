import Kernel from '../kernel/Kernel';

class ZCalc 
{
    constructor(unitsWithinCamera)
    {
        this.kernel = Kernel.getInstance();
        
        this._unitsWithinCamera = unitsWithinCamera;
        
        //Vanishing point settings
        this._vPointX;
        this._vPointY;
        this._vPointDepth; //the max z position
        
        //The vanishing point is defined in literal canvas positions,
        //so these functions will be used to calculate the new values
        //on a screen resize.
        this._calcVPointX = () => {};
        this._calcVPointY = () => {};
        
        //A precalculated value based on the depth
        //(This is explained in the "Scaled Positions and Dimensions" section.).
        this._shrunkDepth;
    }
    
    //-------------------------- getters and setters ----------------------------
    
    get vPointX(){return this._vPointX;}
         
    get vPointY(){return this._vPointY;}
    
    get vPointDepth(){return this._vPointDepth;}
    
    //Here you can provide the functions that will set the exact canvas position (these 
	//should be called by the graphic engine if the canvas is resized.). Also, you can 
	//provide how many units you want in depth.
    setVanishPoint(canvasXPosCalcFunction, canvasYPosCalcFunction, depth = 1000)
     {
        this._calcVPointX = canvasXPosCalcFunction;
        this._calcVPointY = canvasYPosCalcFunction;
        
        this.resetVanishPointPosition();
        this._vPointDepth = depth;
        
        //Precalculating this here. 
        //It is explained in the "Scaled Positions and Dimensions" section below.
        this._shrunkDepth = depth / 8; 
    }
    
    resetVanishPointPosition()
    {
        this._vPointX = this._calcVPointX();
        this._vPointY = this._calcVPointY();
    }
    
    //-------------------------- Z Axis Speed ----------------------------------
    
    //This is used to keep the speed on the z-axis consistent (so the changing fps is not a problem)
    speed(speed, fps)
    {
        return ((this._vPointDepth / this._unitsWithinCamera) * speed) / fps;
    }
    
	/*
		------------------- Scaled Positions and Dimensions ---------------------
		
		This class is designed to provide the ability to create sprite-scaling games,
		by providing position/dimension values, based on a given z-axis position.
		
		If the z-axis position is greater than the vanishing point, or it is a negative 
		number (and the developer doesn't want to display negative values), then the 
		sprite doesn't need to be displayed. In these cases, the x, y, width and height 
		methods will return 0.
		
		
		******************************
		Problem: "The Oatmeal Effect":
		******************************
		
		Originally, the solution for doing this was to create a single unit of change
		for each position/dimension (a "depth unit"), and then multiply that by the z 
		position:
		
		-------------------------------------------------------------------------
		//For X and Y:
		const depthUnit = (vanishingPointX - xPosition) / vanishingPointDepth;
        return xPosition + (zPosition * depthUnit);
		
		//And for Width and Height:
		const depthUnit = width / vanishingPointDepth;
        return width - (zPosition * depthUnit);
		-------------------------------------------------------------------------
		
		However, the problem with this solution is something called "The Oatmeal Effect". 
		This is where the movement of the sprite being drawn appears to increase as it 
		moves further along the z-axis.
		
		
		******************************
		Calculating the Dimensions:
		******************************
		
		Because of The Oatmeal Effect, the solution here is to calculate a new depth unit 
		for every point the sprite has moved along the z-axis.

		The depth unit values are calculated by taking the dimension value, and dividing
		it by this._shrunkDepth. The Shrunk depth is the vanishing point depth, divided by 8.
		The reason for the division on the vanishing point depth is because, even though the 
		speed of movement will appear consistent, the continuous reduction of the dimension 
		means that it would not reach 0 when at the deepest depth. It is divided by 8 because 
		that is the value that gets the sprite close to 0 when at the vanishing point depth.
		
		
		******************************
		Calculating the Positions:
		******************************
		
		This is essentially the same procedure as with the dimensions, except for 2 differences:
			1 - The position value is increased, not decreased.
			2 - The vanishing point's position is taken into account in the calculations, in order to 
				make the sprite move towards/from it.
    */
	
	
	
	//Provide the position/dimension value, the z-axis position,
	//and a boolean to confirm if you want to allow negative z 
	//positions.
	
    x(xPosition, zPosition, showNegative = false)
    {
        return this._position(zPosition, xPosition, this.vPointX, showNegative);
    }
    
    y(yPosition, zPosition, showNegative = false)
    {
        return this._position(zPosition, yPosition, this.vPointY, showNegative);
    }
    
    width(width, zPosition, showNegative = false)
    {
        return this._dimension(zPosition, width, showNegative);
    }
    
    height(height, zPosition, showNegative = false)
    {
        return this._dimension(zPosition, height, showNegative);
    }
    
	
	
    //Takes the model's z position, the model's x or y position,
    //and the vanishing point value for that axis.
    //Returns the scaled value for the position on that axis.
    _position(zPosition, axisPosition, axisVPoint, showNegative)
    {
        if(this._isOutOfView(zPosition, showNegative))
        {
            return 0;
        } else {
			
			//The for loop below needs a positive zPos, so if zPos is negative,
			//make it positive (we'll flip it back later).
            const originalZPosition = zPosition;
            const originalPosition = axisPosition;
            zPosition = (originalZPosition < 0) ? -zPosition : zPosition;
            
            for(let i = 0; i < zPosition; i++)
            {
                axisPosition += ((axisVPoint - axisPosition) / this._shrunkDepth);
            }
            
            //If the zPos was made positive, flip the result back to negative.
            return (originalZPosition < 0) ? originalPosition + (originalPosition - axisPosition) : axisPosition;
        }
    }
    
    //Same concept as above, except does this with the dimensions instead of the positions
    _dimension(zPosition, dimension, showNegative)
    {
        if(this._isOutOfView(zPosition, showNegative))
        {
            return 0;
        } else {
			
			//The for loop below needs a positive zPos, so if zPos is negative,
			//make it positive (we'll flip it back later).
            const originalZPosition = zPosition;
            const originalDimension = dimension;
            zPosition = (originalZPosition < 0) ? -zPosition : zPosition;
            
            for(let i = 0; i < zPosition; i++)
            {
                dimension -= (dimension / this._shrunkDepth);
            }
            
			//If the zPos was made positive, flip the result back to negative.
            return (originalZPosition < 0) ? originalDimension + (originalDimension - dimension) : dimension;
        }
    }
	
	
	//Is the given z position not viewable?
	_isOutOfView(zPosition, showNegative)
    {
        return (zPosition > this.vPointDepth || (!showNegative && zPosition < 0));
    }
}