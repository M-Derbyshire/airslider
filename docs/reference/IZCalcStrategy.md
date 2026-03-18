# [IZCalcStrategy](../../Kernel/utils/ZCalc/strategies/IZCalcStrategy.ts)

Represents a strategy that provides behaviours for the z-calculator

## Methods:

### `getDrawValues`

Takes the given X/Y/Width/Height values (in pixels) and calculates the correct values to draw with, based on the given Z position

#### Parameters:
- **camera** - The camera for the level
- **pixelValues** - The original X/Y positions and width/height (in pixels)
- **zPosition** - The Z position of the element being drawn
- **showNegative** - Should the element still be drawn if the Z position is negative?

### `getDrawPositionValues`

Takes the given X/Y values (in pixels) and calculates the correct values to draw with, based on the given Z position

#### Parameters:
- **camera** - The camera for the level
- **pixelValues** - The original X/Y positions and width/height (in pixels)
- **zPosition** - The Z position of the element being drawn
- **showNegative** - Should the element still be drawn if the Z position is negative?

### `getDrawDimensionValues`

Takes the given Width/Height values (in pixels) and calculates the correct values to draw with, based on the given Z position

#### Parameters:
- **camera** - The camera for the level
- **pixelValues** - The original X/Y positions and width/height (in pixels)
- **zPosition** - The Z position of the element being drawn
- **showNegative** - Should the element still be drawn if the Z position is negative?