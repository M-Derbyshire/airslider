# HUD
*Implements [IHUD](../../Kernel/entities/HUD/IHUD.ts)*

A level's Heads Up Display

## Methods

### `load`

Loads the HUD's assets

#### Parameters:
- **assetHandler** - The game's asset handler (an object that allows you to load images/audio assets)

### `loadComponents`

Triggers the loading of the HUD's components

#### Parameters:
- **assetHandler** - The game's asset handler (an object that allows you to load images/audio assets)

### `registerSounds`

Registers the sounds used by the HUD (these should be added to the sounds array during loading). Also triggers the registration of the component's sounds

#### Parameters:
- **soundEngine** - The sound engine for the level

### `unload`

Unloads any assets that need to be unloaded by the HUD (triggers the same on any HUD components)

#### Parameters:
- **assetHandler** - The game's asset handler (an object that allows you to load images/audio assets)

### `prepare`

Prepares the HUD before the level starts (triggers the same on any HUD components)

### `draw`

Draws the HUD (triggers the same on any HUD components)

#### Parameters:
- **graphicEngine** - The graphic engine for the level
- **canvasContext** - The 2D context from the HTML canvas element