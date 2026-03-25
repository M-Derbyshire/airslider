# HUD Entities

A [HUD](../reference/HUD.md) (Heads-Up-Display) is an entity that manages your level's HUD Components. The HUD is a display that is drawn over the top of the game, giving certain information (e.g. health) and controls (e.g. a pause button) to the player.

## HUD Constructor Parameters
- An instance of the [PointerEventManager](../reference/PointerEventManager.md) class. To ensure events are not re-registered when a level restarts, this should be the same instance that is being used by the level

## Protected Properties
- **pointerEventManager** - This is used to register any mouse events, related to HUD Components. You should register these events in the HUD's `prepare` method. For more information on using the PointerEventManager, see the [Level guide](part4.md)
- **components** - This is an array that contains all of the HUD's [HUDComponent](../reference/HUDComponent.md) objects. These are the components that will be displayed. The components should be added to this array by the HUD's constructor
- **assetsToUnload** - This is an array of file paths to assets (e.g. images, sounds) that can be removed from memory when the HUD is unloaded. There may be some assets that you want to keep in memory, even after the HUD is unloaded, so those should not be included in this array
- **sounds** - This is an array of [IEntitySound](../reference/IEntitySound.md) objects. These objects are used to add the HUD's sounds to the [SoundEngine](../reference/SoundEngine.md), so they can be triggered during the playing of the game

## Public Methods
- **load** - This is called during the loading stage of the level's lifecycle. It is used to load the assets (images/sounds) for the HUD, and to set the `assetsToUnload` and `sounds` arrays
- **prepare** - This is called during the preparation stage of the level's lifecycle (when the level first runs, and whenever it restarts). This should be used to reset any properties, so they are ready for the start of the level
- **draw** - This is called during the drawing stage of the level's lifecycle. This is ran on every frame of the game loop. This should be used to draw any extra images that are needed on the HUD. You probably wont need to override this, as most of the HUD's imagery should be drawn by the HUD Components (the base implementation of this will trigger the drawing of the HUD Components)