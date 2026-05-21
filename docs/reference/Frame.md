# Frame
*Implements [IFrame](../../Kernel/engines/GraphicEngine/IFrame.ts)*

Represents an area of the level

## Methods

### `setBackgroundColor`

The `setBackgroundColor` method sets the background color for the frame

#### Parameters:
- **color** - The color (e.g. "red"/"#ff0000") to use as the background of the frame (this will be drawn underneath the background image, if an image is set)

### `setBackgroundImage`

The `setBackgroundImage` method sets the background image for the frame

#### Parameters:
- **image** - The image to use as the background of the frame

### `setLightMaskImage`

The `setLightMaskImage` method sets the light mask image for the frame (this should be an image that is mostly a transparent color, but it can use a gradient to represent the brightness/darkness of the areas in the frame)

#### Parameters:
- **image** - The image to use as the light mask of the frame
- **luminosity** - A number that represents the light mask's luminosity (1 is the lightest, 0 is the darkest)

### `calculateDrawPositionsAndDimensions`

The `calculateDrawPositionsAndDimensions` method calculates and stores the positions/dimensions to draw the frame with. You should not need to call this from your own code

#### Parameters:
- **graphicEngine** - The graphic engine for the level

### `drawFront`

The `drawFront` method draws the foreground-related elements of the frame (such as the light mask). You should not need to call this from your own code

#### Parameters:
- **canvasCtx** - The context used to draw on the game's canvas

### `drawBack`

The `drawBack` method draws the background-related elements of the frame (such as the background image). You should not need to call this from your own code

#### Parameters:
- **canvasCtx** - The context used to draw on the game's canvas

## Properties

### `x`

The x position (in units) of the frame in the level

### `y`

The y position (in units) of the frame in the level

### `width`

The width (in units) of the frame

### `height`

The height (in units) of the frame

### `precalculatedDrawPositions`

The precalculated positions that will be used when drawing the frame

### `precalculatedDrawDimensions`

The precalculated dimensions that will be used when drawing the frame