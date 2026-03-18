# LinearVanishingPointStrategy
*Implements [IZCalcStrategy](../../Kernel/utils/ZCalc/strategies/IZCalcStrategy.ts)*

Strategy for the ZCalc. Scales sprites in a direct, straight path towards a set vanishing point

## Methods

### `setVanishPoint`

Used to set the vanishing point.

#### Parameters:
- **x** - The x position (in units) of the vanishing point
- **y** - The y position (in units) of the vanishing point
- **depth** - The amount of possible positions that there should be on the z axis (if not provided, this defaults to 1000)

## Properties

### `vanishingPointX`

The x position (in units) of the vanishing point

### `vanishingPointY`

The y position (in units) of the vanishing point

### `vanishingPointDepth`

The amount of possible positions that there should be on the z axis