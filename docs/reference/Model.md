# Model
*Implements [IModel](../../Kernel/entities/Model/IModel.ts)*

An object in the game (such as a character, monster, power-up, etc)

## Methods

### `act`

Runs the model's actions. This is ran on every frame.

### `load`

Loads the assets for the model

#### Parameters:
- **assetHandler** - The game's asset handler (an object that allows you to load images/audio assets)

### `registerSounds`

Registers the sounds used by the model (these should be added to the sounds array during loading)

#### Parameters:
- **soundEngine** - The sound engine for the level

### `registerAnimations`

Registers the animations for the model

### `prepare`

Prepares the model, before the gameplay starts

### `unload`

Unloads any assets used by the model

#### Parameters:
- **assetHandler** - The game's asset handler (an object that allows you to load images/audio assets)

### `precalculateDrawPositionsAndDimensions`

Calculates and stores the positions/dimensions to use when drawing the model (these can be accessed via the `calculatedDrawPositions` and `calculatedDrawDimensions` properties)

#### Parameters:
- **graphicEngine** - The graphic engine used by the level

### `draw`

Draws the model's sprite, using the precalculated pixel positions/dimensions

#### Parameters:
- **graphicEngine** - The graphic engine used by the level
- **canvasContext** - The 2D context from the HTML canvas element
- **currentFps** - The current FPS of the game

### `checkForExtraEvents`

Runs any extra event checks specific to this model

### `isPointerOverlapping`

Determines if the mouse pointer is overlapping this model.

#### Parameters:
- **pointX** - The x position (within the canvas's space) of the mouse pointer
- **pointY** - The y position (within the canvas's space) of the mouse pointer

### `getHitBoxes`

Creates and returns the current array of hit boxes for the model.

## Properties

### `active`

Is the model currently active?

### `display`

Should this model be displayed?

### `text`

Details for displaying an entity's text content

### `state`

The current state of the model (the name of the state is the same as the name of the animation that should be drawn)

### `width`

The current width of the model

### `height`

The current height of the model

### `x`

The x position of the model (in units)

### `y`

The y position of the model (in units)

### `z`

The z position of the model

### `calculatedDrawPositions`

The calculated X/Y pixel values to be used when drawing the model

### `calculatedDrawDimensions`

The calculated width/height pixel values to be used when drawing the model

### `xSpeed`

The speed of the model, on the x axis

### `ySpeed`

The speed of the model, on the y axis

### `zSpeed`

The speed of the model, on the z axis