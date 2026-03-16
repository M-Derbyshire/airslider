# Kernel
*Implements [IKernel](../../Kernel/IKernel.ts)*

The Kernel is a singleton object that manages the running of the game. This object is the central place for you to access the information and entities that may be needed whithin your game's code.

## Static Methods

### `init`

The `init` method is used to initialise the game.

#### Parameters:
- **canvas** - The Canvas element that the game should be drawn onto
- **settings** - The game's settings

### `getInstance`

The `getInstance` method returns the singleton instance of the Kernel.

#### Parameters:
- **canvas** *(optional)* - The Canvas element that the game should be drawn onto. You should not need to provide this in practice, as it will have already been set by the `init` method.
- **settings** *(optional)* - The game's settings. You should not need to provide this in practice, as it will have already been set by the `init` method.

## Methods

### `loadLevel`

The `loadLevel` method will add the given level to the level queue, and start it loading in the background.

#### Parameters:
- **level** - The level to load

### `unloadCurrentLevel`

The `unloadCurrentLevel` method will mark the current level as ready to be removed from the level queue. Once the current frame has finished, the level will then be unloaded, and removed from the queue. That will mean that the next level in the queue will be prepared, and then started.

### `restartCurrentLevel`

The `restartCurrentLevel` method will restart the currently running level. This means the `prepare` method on the level (and on the models/HUDs/HUDComponents) will be called.

### `toggleGamePause`

The `toggleGamePause` method will pause the game if it is not currently paused, or unpause it if it is.

The game is not actually paused as soon as this method is called. Instead, it goes into a pre-paused state (this allows for any necessary changes before the frames stop being drawn -- for example, rendering an unpause button, instead of a pause button).

### `handleError`

The `handleError` method will handle any errors in the game. You don't actually need to call this manually, any error thrown during the game will automatically be handled using this method.

#### Parameters:
- **error** - The error to handle (this doesn't have to be an instance of Error)

## Properties

### `centralState`

The `centralState` is a map to store any state that needs to be accessible to all levels.

### `status`

The `status` indicates the current status of the game loop (e.g. active, paused, pre-paused).

### `settings`

The `settings` holds all of the game's settings (e.g. the aspect ratio values, FPS display color, FPS limit).

### `fps`

The `fps` is the current frames-per-second of the game.

### `totalLevelActiveMilliseconds`

The `totalLevelActiveMilliseconds` is the total amount of milliseconds that the level has not been paused or stopped for any reason.

### `level`

The `level` is the current level that is being ran

### `loadedModels`

The `loadedModels` contains the models loaded by the current level

### `assetHandler`

The `assetHandler` loads and manages assets. You should use this in the `load` methods of your levels/models/HUDs/HUDComponents, to load in any images/sounds that they will need

### `gameEngine`

The `gameEngine` is the engine (for the current level) that triggers the actions of levels/models. It 
also triggers the checking for in-game events. You shouldn't need to access this in your own code

### `graphicEngine`

The `graphicEngine` is the engine (for the current level) that controls the drawing to the screen.

### `soundEngine`

The `soundEngine` is the engine (for the current level) that controls the sound/music of the game.

### `canvasContext`

The `canvasContext` is the 2D context from the HTML canvas element