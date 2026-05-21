# GraphicEngine
*Implements [IGraphicEngine](../../Kernel/engines/GraphicEngine/IGraphicEngine.ts)*

The `GraphicEngine` is the engine that controls the drawing to the screen. It also provides a number of methods that will be useful for when you want to draw things to the screen (such as text, or images that are not sprites of a model)

## Methods

### `run`

The `run` method triggers the clearing and re-drawing of the screen. You should not need to call this from your code, as it is triggered automatically

#### Parameters:
- **level** - The level that needs to be drawn
- **models** - The models that need to be drawn
- **fps** - The current FPS of the game
- **fpsDisplayColor** - The color that should be used when displaying the FPS (if this is not provided, the FPS will not be displayed)

### `drawText`

The `drawText` method draws text onto the canvas

#### Parameters:
- **text** - The text content, and the details required to draw it
- **entityUnitValues** - The x/y/z values (in units) of the entity that owns the text
- **scaleType** - Determines which method is used to scale the position/size of the text
- **showNegative** - If scaling the text, should it still be drawn when the z-index is negative?

### `getStaticDrawPositionsAndDimensions`

The `getStaticDrawPositionsAndDimensions` method calculates the draw positions/dimensions in pixels for a static entity (such as a HUD Component). If any values aren't provided, 0 will be returned as the result.

#### Parameters:
- **unitValues** - The position/dimension values (in units)

### `getUnscaledDrawPositionsAndDimensions`

The `getUnscaledDrawPositionsAndDimensions` method Calculates the draw positions/dimensions in pixels for an entity that isn't z-scaled. If any values aren't provided, 0 will be returned as the result.

#### Parameters:
- **unitValues** - The position/dimension values (in units)

### `getScaledDrawPositionsAndDimensions`

The `getScaledDrawPositionsAndDimensions` method calculates the draw positions/dimensions in pixels for an entity that is scaled on the z-axis. If any values aren't provided, 0 will be returned as the result.

#### Parameters:
- **unitValues** - The position/dimension values (in units), plus the z position
- **showNegative** - Should the element still be drawn if the z position is negative?

## Properties

### `camera`

The `camera` for the level.