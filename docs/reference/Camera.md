# Camera
*Implements [ICamera](../../Kernel/engines/GraphicEngine/ICamera.ts)*

The Camera controls what area of the level's space is currently visible.

## Methods

### `setCameraSize`

The `setCameraSize` method sets the camera's width and height to match the game's aspect ratio values. You should not need to call this from your own code, as it will be handled automatically

### `setColors`

The `setColors` method sets any configurable colors that the camera uses.

#### Parameters:
- **emptySpaceColor** - The color of any empty space on the canvas
- **letterBoxColor** - The color of the letterbox around the game

### `isOnCamera`

The `isOnCamera` method will tell you if an object is currently in the camera's view, based on the given coordinates

#### Parameters:
- **x** - The X-axis position (in pixels) that the object will be drawn at
- **y** - The Y-axis position (in pixels) that the object will be drawn at
- **width** - The width (in pixels) that the object will be drawn with
- **height** - The height (in pixels) that the object will be drawn with

### `drawBack`

The `drawBack` method draws anything that the camera needs to place in the background (such as the empty space color). You should not need to call this from your own code

### `drawFront`

The `drawFront` method draws anything that the camera needs to place over everything else (such as the letterbox). You should not need to call this from your own code

### `drawEmptySpaceColor`

The `drawEmptySpaceColor` method draws the color of any empty space on the canvas (this color is set with the setColors() method). You should not need to call this from your own code

### `drawLetterbox`

The `drawLetterbox` method draws the letterbox around the game (the color is set with the setColors() method). You should not need to call this from your own code

### `setCameraPosition`

The `setCameraPosition` method sets the camera's position within the level's available space (centred on the given X/Y)

#### Parameters:
- **x** - The position (in units) on the X axis
- **y** - The position (in units) on the Y axis

### `moveLeft`

The `moveLeft` method moves the camera's position to the left, within the level's space

#### Parameters:
- **speed** - The speed of the movement (in units)

### `moveRight`

The `moveRight` method moves the camera's position to the right, within the level's space

#### Parameters:
- **speed** - The speed of the movement (in units)

### `moveUp`

The `moveUp` method moves the camera's position up, within the level's space

#### Parameters:
- **speed** - The speed of the movement (in units)

### `moveDown`

The `moveDown` method moves the camera's position down, within the level's space

#### Parameters:
- **speed** - The speed of the movement (in units)

## Properties

### `canvasPositionX`/`canvasPositionY`/`canvasPositionWidth`/`canvasPositionHeight`

The canvas positions/dimensions are the positions/sizes of the camera on the canvas (any canvas space outside of this will be filled in by the drawLetterbox() method). These are stored as actual canvas position values (not in game units)

### `unitsWithinCameraX`

How many draw-space units are there within the camera's size (on the x axis)? So, if this value was 1000, then a model with a width of 1000 would take up the entire screen (assuming its z position was 0)

### `unitsWithinCameraY`

How many draw-space units are there within the camera's size (on the y axis)? So, if this value was 1000, then a model with a height of 1000 would take up the entire screen (assuming its z position was 0)

### `drawSpacePositionX`/`drawSpacePositionY`

The draw-space positions are where the camera exists within the level's available space. These values are in units.

### `unitCameraPositionCalc`

This object provides functions that are used to determine where to actually draw something on the canvas (based on camera position)