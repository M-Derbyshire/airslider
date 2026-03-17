# Level
*Implements [ILevel](../../Kernel/entities/Level/ILevel.ts)*

A level of the game

## Methods:

### `load`

Loads the level's assets

#### Parameters:
- **assetHandler** - The game's asset handler (an object that allows you to load images/audio assets)

### `registerSounds`

Registers the sounds used by the level (these should be added to the sounds array during loading). Also triggers the registration of the HUD's sounds

#### Parameters:
- **soundEngine** - The sound engine for the level

### `unload`

Unloads any assets used by the level, and clears up anything else

#### Parameters:
- **assetHandler** - The game's asset handler (an object that allows you to load images/audio assets)

### `prepare`

Prepares the level, before the gameplay starts

### `checkForModelEvents`

Runs the registered model event checks

#### Parameters:
- **models** - The models for the current level

### `checkForHoverEvents`

Triggers a check for any pointer hover events

### `getModels`

Creates and returns any models that will be used in the level

### `act`

Runs the level's actions. This is ran on every frame.

### `drawBack`

Draws anything that needs to be in the back (behind the models) of the level

#### Parameters:
- **graphicEngine** - The graphic engine for the level
- **canvasContext** - The 2D context from the HTML canvas element

### `drawFront`

Draws anything that needs to be in the front (over the models) of the level

#### Parameters:
- **graphicEngine** - The graphic engine for the level
- **canvasContext** - The 2D context from the HTML canvas element

## Properties

### `HUD`

The Heads Up Display for the level

### `frameManager`

The frame manager for the level

### `isPauseable`

Can this level be paused?