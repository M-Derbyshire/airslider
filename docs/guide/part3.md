# 3 - Using the Sound Engine and Graphic Engine

## The Sound Engine

The [SoundEngine](../reference/SoundEngine.md) can be used to control the sound effects and music in your game.

The methods on the engine will identify a sound using a unique key. You will set these keys when you add the sounds to an entity's `sounds` array (explained later in these guides). You will not need to use most of the engine's methods, as their functionality will be triggered automatically by the framework. However, there are some that you will find useful:

- `getSoundStatus` - This returns the status of a sound. There are 4 possible states: `Playing`, `Paused`, `Stopped` and `ForceLoading`
- `getSoundVolume`/`setSoundVolume` - These allow you to get/set the volume of a particular sound
- `playSound` - This starts a sound playing (or unpauses it, if it was paused)
- `pauseSound` - This pauses a sound
- `stopSound` - This stops a sound (and resets it to the beginning)
- `reset` - This stops all of the sounds that are currently registered with the engine
- `forceSoundToLoad` - Sometimes, to ensure that a sound is still loaded, you may want to force the browser to load it, before it is needed. This method will play the sound in a muted state, which will ensure it is loaded
- `getSoundKeys` - This generates an array that contains the keys of all of the sounds registered with the engine
- `getPlayingSoundKeys` - This generates an array that contains the keys of the currently playing sounds

## The Graphic Engine

The [GraphicEngine](../reference/GraphicEngine.md) can be useful when you need to draw images to the canvas. It also gives you access to the level's [Camera](../reference/Camera.md), so you can control its position and settings.

### The `drawText` Method

This method will let you draw text to the canvas. In most cases, you will not need to use this, as Models and HUD Components will automatically trigger this if their text content has been set.

### Getting Pixel Values for Drawing Images

If you want to draw an image in the level, you may need to calculate the *actual* position/size that you want to use. For example, if you've got an image that should only exist in a certain part of the level, then you will want to know where to draw it, based on the Camera's current position. There are 3 methods on the graphic engine that can generate the correct pixel values for you:

- `getStaticDrawPositionsAndDimensions` - This can be used when you need to draw something like a HUD Component. It will convert the given "unit" values into the correct pixel values, regardless of the position of the Camera. If you move the Camera, your image will stay in the same place on the canvas
- `getUnscaledDrawPositionsAndDimensions` - This will take the given "unit" values, and convert them into pixel values. However, it will also change the X/Y positions, based on the Camera's current position in the level. So, if you move the Camera, your image will stay in the same spot in the level's space
- `getScaledDrawPositionsAndDimensions` - This has the same effect as `getUnscaledDrawPositionsAndDimensions`, but it will also move/resize the image, based on the given Z-axis position. It does based on the [IZCalcStrategy](../reference/IZCalcStrategy.md) that has been set on the [ZCalc](../reference/ZCalc.md) (which will be explained in the next section)

### Setting the ZCalc Strategy

The [ZCalc](../reference/ZCalc.md) is a utility class, with static methods, that is used by the graphic engine when scaling images. It allows you to have a "sprite scaling" effect in your game.

You can set the "strategy" of the ZCalc (to get different effects) using its static `setStrategy` method. If you don't set this (or if you call this method with `undefined`), then no scaling effect will take place.

These are the strategies currently available:
- `LinearVanishingPointStrategy` - This allows you to set a "vanishing point" for your level's scaling. Then, when an image/model is moved along the Z-axis, it will move in a straight line towards that point
- `SelfVanishingPointStrategy` - With this strategy, the "vanishing point" is always the center of the given image/model. So, an image will get bigger/smaller as it moves along the Z-axis, but its center will stay in the same place