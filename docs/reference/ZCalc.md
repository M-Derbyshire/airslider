# ZCalc

Provides methods to calculate the correct positions/dimensions for drawing an element, based on its position on the z axis.

## Static Methods

### `setStrategy`

Changes the strategy to be used

#### Parameters:
- **strategy** - The new [strategy](../../Kernel/utils/ZCalc/strategies/IZCalcStrategy.ts) (or `undefined`, if you want to reset the ZCalc to its default behaviour)

### `getDrawValues`

Takes the given X/Y/Width/Height values (in pixels) and calculates the correct values to draw with, based on the given Z position

#### Parameters:
- **camera** - The camera for the level
- **pixelValues** - The original X/Y positions and width/height (in pixels)
- **zPosition** - The Z position of the element being drawn
- **showNegative** - Should the element still be drawn if the Z position is negative?