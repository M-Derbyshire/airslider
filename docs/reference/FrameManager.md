# FrameManager
*Implements [IFrameManager](../../Kernel/GraphicEngine/IFrameManager.ts)*

Manages the frames of a level

## Methods

### `setFrames`

Sets the frames for the level

#### Parameters:
- **frames** - The frames to use

### `prepareFramesForDrawing`

Gets the frames ready to be drawn

#### Parameters:
- **graphicEngine** - The graphic engine for the level

### `drawFramesBack`

Draws the background-related elements of all of the frames that need to be drawn

#### Parameters:
- **canvasCtx** - The context used to draw on the game's canvas

### `drawFramesFront`

Draws the foreground-related elements of all of the frames that need to be drawn

#### Parameters:
- **canvasCtx** - The context used to draw on the game's canvas