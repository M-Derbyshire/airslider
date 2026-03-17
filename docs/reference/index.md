# Reference of Classes/Types

## [Kernel](Kernel.md)
*Implements [IKernel](../../Kernel/IKernel.ts)*

The Kernel is a singleton object that manages the running of the game. This object is the central place for you to access the information and entities that may be needed whithin your game's code.

## [AssetHandler](AssetHandler.md)
*Implements [IAssetHandler](../../Kernel/AssetHandler/IAssetHandler.ts)*

The asset handler is the object that manages the game's image/audio assets. It can be accessed via the Kernel.

You will use the `AssetHandler` in the `load` methods of your levels/models/HUDs/HUDComponents, to trigger the loading of their assets.

## [GraphicEngine](GraphicEngine.md)
*Implements [IGraphicEngine](../../Kernel/engines/GraphicEngine/IGraphicEngine.ts)*

The `GraphicEngine` is the engine that controls the drawing to the screen. It also provides a number of methods that will be useful for when you want to draw things to the screen (such as text, or images that are not sprites of a model)

## [SoundEngine](SoundEngine.md)
*Implements [ISoundEngine](../../Kernel/engines/SoundEngine/ISoundEngine.ts)*

The `SoundEngine` is the engine that controls the sound/music of the game.

## [IDrawDimensions](IDrawDimensions.md)

Represents the dimensions to draw an entity

## [IDrawPositions](IDrawPositions.md)

Represents a position to draw an entity

## [ITextContent](ITextContent.md)

Details for displaying an entity's text content

## [SoundStatus](../../Kernel/engines/SoundEngine/ISoundEngine.ts)

The `SoundStatus` enum represents the possible statuses of a sound. There are 4 possible statuses:
- **Playing** - The sound is currently playing
- **Paused** - The sound is currently paused
- **Stopped** - The sound is currently stopped (has been reset back to its start)
- **ForceLoading** - The sound is currently in a silently playing state, to ensure it is loaded

## [Camera](Camera.md)
*Implements [ICamera](../../Kernel/GraphicEngine/ICamera.ts)*

The Camera controls what area of the level's space is currently visible.

## [Frame](Frame.md)
*Implements [IFrame](../../Kernel/GraphicEngine/IFrame.ts)*

Represents an area of the level

## [FrameManager](FrameManager.md)
*Implements [IFrameManager](../../Kernel/GraphicEngine/IFrameManager.ts)*

Manages the frames of a level

# [HUD](HUD.md)
*Implements [IHUD](../../Kernel/entities/HUD/IHUD.ts)*

A level's Heads Up Display