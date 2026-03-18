# [IAnimation](../../Kernel/entities/Model/IModelAnimationsManager.ts)

Represents a model's animation

## Properties:

### `spritesheet`

The spritesheet for this animation

### `frameCoordinates`

The coordinates of the frames on the spritesheet

### `fps`

The Frames Per Second that this animation should play at

### `waitCount`

How many frames of the game have passed since we last changed the frame of this animation?

### `nextCount`

How many frames of the game need to have passed before we can change to the next frame of this animation?

### `currentFrameIndex`

The index of the current frame for the current animation

### `height`

The height (in units) that this animation should be drawn at

### `width`

The width (in units) that this animation should be drawn at

### `xOffset`

If the x position of the model needs to change when switching to this animation, it will be changed by this value

### `yOffset`

If the y position of the model needs to change when switching to this animation, it will be changed by this value

### `onAnimationEnd`

A callback to call once this animation has ended. If you don't want the animation to be looped, you can use this to change the model's state