# 8 - Helpers

There are a few extra classes that can help you as you build your game. These helpers provide static methods that act as utilities.

## [FullscreenHelper](../reference/FullscreenHelper.md)

The FullscreenHelper class provides methods that can be used to manage the game's fullscreen mode.

### Static Methods:
- **isFeatureAvailable** - This will tell you if the fullscreen feature is available in the user's browser
- **isFullscreen** - This will tell you if the game is currently in fullscreen mode
- **toggleFullscreen** - This will toggle between the fullscreen mode, and the regular canvas size

## [TimeHelper](../reference/TimeHelper.md)

The TimeHelper provides methods that can help you when your code needs to consider something that's related to time.

### Static Methods:
- **secondsToFrames** - Calculates the amount of frames that will be rendered during a given amount of seconds (as this is based on a dynamic FPS, the returned value can only be considered an estimate)
- **minutesToFrames** - Works the same as `secondsToFrames`, but with minutes

## [UnitHelper](../reference/UnitHelper.md)

The UnitHelper provides methods that help you when working with "unit" values. You probably won't need to use these methods, as the framework already uses them in places where they may be needed (For example, the `consistentSpeed` method is automatically used in the Model entity's "move" methods).

### Static Methods:
- **xUnitsToPixels** - Converts an X-axis value (in units) into the correct pixel value. In most cases, it would probably be better to use the methods provided by the [GraphicEngine](../reference/GraphicEngine.md), rather than using this method directly
- **yUnitsToPixels** - Converts a Y-axis value (in units) into the correct pixel value. In most cases, it would probably be better to use the methods provided by the [GraphicEngine](../reference/GraphicEngine.md), rather than using this method directly
- **consistentSpeed** - Converts a speed value into a new value that remains consistent, regardless of a changing FPS (this is only designed for slight changes in the FPS -- larger changes will still be noticeable)