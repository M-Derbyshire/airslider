# [IAnimationDetails](../../Kernel/entities/Model/IModelAnimationsManager.ts)

The details required to create a new animation for a model

## Properties:

### `spritesheet`

The spritesheet for this animation

### `fps`

The Frames Per Second that this animation should play at

### `drawWidth`

The width (in units) that this animation should be drawn at

### `drawHeight`

The height (in units) that this animation should be drawn at

### `frameCoordinates`

The coordinates of a frame on a spritesheet

### `xOffset`

If the x position of the model needs to change when switching to this animation, it will be changed by this value

### `yOffset`

If the y position of the model needs to change when switching to this animation, it will be changed by this value

### `onAnimationEnd`

A callback to call once this animation has ended. If you don't want the animation to be looped, you can use this to change the model's state