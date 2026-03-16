# Reference of Classes/Types

## [Kernel](Kernel.md)
*Implements [IKernel](../../Kernel/IKernel.ts)*

The Kernel is a singleton object that manages the running of the game. This object is the central place for you to access the information and entities that may be needed whithin your game's code.

# AssetHandler
*Implements [IAssetHandler](../../Kernel/AssetHandler/IAssetHandler.ts)*

The asset handler is the object that manages the game's image/audio assets. It can be accessed via the Kernel.

You will use the `AssetHandler` in the `load` methods of your levels/models/HUDs/HUDComponents, to trigger the loading of their assets.