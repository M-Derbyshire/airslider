# ModelAnimationsManager
*Implements [IModelAnimationsManager](../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager.ts)*

Manages a model's animations

## Methods:

### `createAnimation`

Creates and returns a new animation (which will then need to be registered with the registerAnimations method)

#### Parameters:
- **animationDetails** - The details needed to create this animation

### `registerAnimations`

Registers an array of animations with this manager

#### Parameters:
- **animations** - The animations to register with this manager

### `clearAllAnimations`

Removes all animations from this manager

### `precalculateDrawPositionsAndDimensions`

Calculates and stores the positions/dimensions to use when drawing the animation (these can be accessed via the calculatedDrawPositions and calculatedDrawDimensions properties)

#### Parameters:
- **modelCoordinates** - The model's current coordinates, including its Z-axis position
- **graphicEngine** - The graphic engine used by the level

### `drawNextFrame`

Draws the correct frame of the animation (moving to the next frame if it's time to do so), using the positions/dimensions calculated by the precalculateDrawPositionsAndDimensions method

#### Parameters:
- **animationName** - The name of the animation to draw
- **canvasContext** - The 2D context from the HTML canvas element
- **currentFps** - The current FPS of the game

### `drawText`

Draws the text content of the linked model

#### Parameters:
- **text** - The text content, and the details required to draw it
- **modelPosition** - The x/y/z values (in units) of the model
- **graphicEngine** - The graphic engine used by the level

### `drawHitBoxes`

Draws the model's hit boxes

#### Parameters:
- **color** - The color to use when drawing the boxes
- **hitBoxes** - The hit boxes to draw
- **graphicEngine** - The graphic engine used by the level
- **canvasContext** - The 2D context from the HTML canvas element

## Properties:

### `animations`

The animations created for the model

### `calculatedDrawPositions`

The calculated X/Y pixel values to be used when drawing the model

### `calculatedDrawDimensions`

The calculated width/height pixel values to be used when drawing the model