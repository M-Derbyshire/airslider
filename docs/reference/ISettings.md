# [ISettings](../../settings/ISettings.ts)

The settings for the game

## Properties

### `fpsLimit`

The maximum FPS that the game should be allowed to run at (the browser may still run the game at a lower FPS).

If this is not provided, the default value will be 70

### `fpsDisplayColor`

If we want to display the FPS counter, what color should the text be? The FPS counter is only drawn if this value is truthy

### `isFullscreenEnabled`

Should the fullscreen option be enabled? (this only has an effect if fullscreen is available in the browser).

If this is not provided, the default value will be true

### `assetsDirUrl`

The URL of the assets directory. If the game is being hosted locally, then this should be left `undefined`

### `unitsWithinCameraX`

How many draw-space units are there within the camera's size (on the x axis)? So, if this value was 1000, then a model with a width of 1000 would take up the entire screen (assuming its z position was 0)

If this is not provided, the default value will be 1000

### `unitsWithinCameraY`

How many draw-space units are there within the camera's size (on the y axis)? So, if this value was 1000, then a model with a height of 1000 would take up the entire screen (assuming its z position was 0)

If this is not provided, the default value will be 1000

### `aspectRatioHorizontal`

The horizontal size of the camera's aspect ratio (e.g. the 16 in "16:9").

If this is not provided, the default value will be 17

### `aspectRatioVertical`

The vertical size of the camera's aspect ratio (e.g. the 9 in "16:9").

If this is not provided, the default value will be 9

### `getInitialLevel`

A function that will construct the initial level of the game