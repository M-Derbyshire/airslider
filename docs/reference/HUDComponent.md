# HUDComponent
*Implements [IHUDComponent](../../Kernel/entities/HUDComponent/IHUDComponent.ts)*

A component to be displayed by the Heads Up Display

## Methods

### `load`

Loads the assets for the component

#### Parameters:
- **assetHandler** - The game's asset handler (an object that allows you to load images/audio assets)

### `registerSounds`

Registers the sounds used by the component (these should be added to the sounds array during loading)

#### Parameters:
- **soundEngine** - The sound engine for the level

### `unload`

Unloads any assets that need to be unloaded by the component

#### Parameters:
- **assetHandler** - The game's asset handler (an object that allows you to load images/audio assets)

### `drawText`

Draws the text content setup within this component

#### Parameters:
- **graphicEngine** - The graphic engine for the level

### `draw`

Draws the component

#### Parameters:
- **graphicEngine** - The graphic engine for the level
- **canvasContext** - The 2D context from the HTML canvas element

### `prepare`

Prepares the component before the level starts

### `isPointerOverlapping`

Is the mouse pointer overlapping this component?

#### Parameters:
- **pointX** - The x position (within the canvas's space) of the mouse pointer
- **pointY** - The y position (within the canvas's space) of the mouse pointer
- **graphicEngine** - The graphic engine for the level

## Properties

### `x`

The x coordinate of this component (in units)

### `y`

The y coordinate of this component (in units)

### `width`

The width of this component (in units)

### `height`

The height of this component (in units)

### `active`

Is this component active?

### `text`

The text content to be displayed with the component