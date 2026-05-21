# UnitHelper

Contains methods that perform calculations to convert "unit" values into actual canvas positions/dimensions. Also provides a method for keeping speeds consistent when the FPS changes

## Static Methods

### `xUnitsToPixels`

Converts an x value (in units) into the correct pixel value

#### Parameters:
- **unitValue** - the x position in units

### `yUnitsToPixels`

Converts a y value (in units) into the correct pixel value

#### Parameters:
- **unitValue** - the y position in units

### `consistentSpeed`

Converts a speed value into another value that remains consistent, regardless of a changing FPS (this is only designed for slight changes in the FPS -- larger changes will still be noticeable)

#### Parameters:
- **originalSpeed** - the original speed