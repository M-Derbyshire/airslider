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
*Implements [ICamera](../../Kernel/engines/GraphicEngine/ICamera.ts)*

The Camera controls what area of the level's space is currently visible.

## [Frame](Frame.md)
*Implements [IFrame](../../Kernel/engines/GraphicEngine/IFrame.ts)*

Represents an area of the level

## [FrameManager](FrameManager.md)
*Implements [IFrameManager](../../Kernel/engines/GraphicEngine/IFrameManager.ts)*

Manages the frames of a level

## [HUD](HUD.md)
*Implements [IHUD](../../Kernel/entities/HUD/IHUD.ts)*

A level's Heads Up Display

## [HUDComponent](HUDComponent.md)
*Implements [IHUDComponent](../../Kernel/entities/HUDComponent/IHUDComponent.ts)*

A component to be displayed by the Heads Up Display

## [Level](Level.md)
*Implements [ILevel](../../Kernel/entities/Level/ILevel.ts)*

A level of the game

## [Model](Model.md)
*Implements [IModel](../../Kernel/entities/Model/IModel.ts)*

An object in the game (such as a character, monster, power-up, etc)

## [KeyboardEventManager](KeyboardEventManager.md)
*Implements [IKeyboardEventManager](../../Kernel/entities/Level/IKeyboardEventManager.ts)*

Manages any keyboard events

## [ModelEventManager](ModelEventManager.md)
*Implements [IModelEventManager](../../Kernel/entities/Level/IModelEventManager.ts)*

Manages the event monitoring between models (e.g. collision events)

## [IModelEventRegistrationDetails](IModelEventRegistrationDetails.md)

The details that are needed to register an event with an IModelEventManager

## [PointerEventManager](PointerEventManager.md)
*Implements [IPointerEventManager](../../Kernel/entities/Level/IPointerEventManager.ts)*

Manages any events relating to mouse clicks

## [IHitBox](IHitBox.md)

Coordinates and dimensions for a model's hit box. A hit box will surround a part of the model, and can be used in events (such as collision detection). Multiple boxes could be used to cover the actual shape of the model's sprite.

## [ModelAnimationsManager](ModelAnimationsManager.md)
*Implements [IModelAnimationsManager](../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager.ts)*

Manages a model's animations

## [IAnimation](IAnimation.md)

Represents a model's animation

## [IAnimationDetails](IAnimationDetails.md)

The details required to create a new animation for a model

## [IFrameCoordinates](IFrameCoordinates.md)

The coordinates of a frame on a spritesheet

## [IEntitySound](IEntitySound.md)

A sound belonging to an entity

## [ZCalc](ZCalc.md)

Provides methods to calculate the correct positions/dimensions for drawing an element, based on its position on the z axis.

## [IZCalcStrategy](IZCalcStrategy.md)

Represents a strategy that provides behaviours for the z-calculator

## [LinearVanishingPointStrategy](LinearVanishingPointStrategy.md)
*Implements [IZCalcStrategy](../../Kernel/utils/ZCalc/strategies/IZCalcStrategy.ts)*

Strategy for the ZCalc. Scales sprites in a direct, straight path towards a set vanishing point

## [SelfVanishingPointStrategy](SelfVanishingPointStrategy.md)
*Implements [IZCalcStrategy](../../Kernel/utils/ZCalc/strategies/IZCalcStrategy.ts)*

Strategy for the ZCalc. Sprites will be scaled with their center being the vanishing point (so the center position of the sprite won't change)

## [FullscreenHelper](FullscreenHelper.md)

Provides methods that can be used to manage the game's fullscreen mode

## [TimeHelper](TimeHelper.md)

Contains methods that provide information related to time

## [UnitHelper](UnitHelper.md)

Contains methods that perform calculations to convert "unit" values into actual canvas positions/dimensions. Also provides a method for keeping speeds consistent when the FPS changes

## [BrowserHelper](BrowserHelper.md)

Contains methods that can be used to determine details about the web browser

## [ISettings](ISettings.md)

The settings for the game

## [Fonts Object](FontsObject.md)

The fonts object should be a simple object. Each property name should be the name of a font, and the value should be the filepath to the font (a full filepath, starting from within the `/src` directory)