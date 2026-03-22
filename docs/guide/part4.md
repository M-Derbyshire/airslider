# 4 - Level Entities

The levels of your game are where everything happens. However, level entities can also be used to create menus, loading screens, etc. There will always be one level running at any one time, however more levels can be loading in the background.

## Starting a Level

The game's [settings object](../reference/ISettings.md) should contain a callback function that will construct the first level of the game. However, you will need to manage the construction of the levels that come after that.

To do this, you will first construct an instance of the level in your current level's code, and add it to the "level queue" using the Kernel's `loadLevel` method. That method will trigger the loading of the level, in the background. Once the level has had time to load, you can then switch to it by calling the Kernel's `unloadCurrentLevel` method (this will remove the current level from the level queue, meaning the next level in the queue will be started). If you want to wait until the next level has finished loading before unloading the current one, you can use the `assetsStillLoading` property of the [AssetHandler](../reference/AssetHandler.md) object (which can be accessed through the Kernel object).

## Public Properties
- **HUD** - This is the HUD entity that is used by the level. You should set this property in your level's constructor. This property has a public getter, but a protected setter.
- **frameManager** - This manages the frames of the level (explained later). This property has a public getter, but a protected setter.
- **isPauseable** - This boolean value determines if the level can be paused

## Protected Properties
- **assetsToUnload** - This is an array of file paths to assets (e.g. images, sounds) that can be removed from memory when the level is unloaded. There may be some assets that you want to keep in memory, even after the level is unloaded (like images that are used in every level), so those should not be included in this array
- **sounds** - This is an array of [IEntitySound](../reference/IEntitySound.md) objects. These objects are used to add the level's sounds to the [SoundEngine](../reference/SoundEngine.md), so they can be triggered during the playing of the game
- **modelEventManager** - This is used to check for events that occur between models (e.g. collision detection). This will be explained later
- **keyboardEventManager** - This is used to check for keyboard events. This will be explained later
- **pointerEventManager** - This is used to check for mouse events. This will be explained later

## Public Methods
- **getModels** - This is called during the construction phase of the level's lifecycle. This is used to create the models that will be used in the level. You should call the base class's `getModels` method to get an array of models, and then add your level's models to that array. You should then return the final array
- **load** - This is called during the loading stage of the level's lifecycle. It is used to load the assets (images/sounds) for the level, and to set the `assetsToUnload` and `sounds` arrays
- **prepare** - This is called during the preparation stage of the level's lifecycle (when the level first runs, and whenever it restarts). This should be used to reset any properties, so they are ready for the start of the level. This is also the best place to set the [ZCalc](../reference/ZCalc.md) strategy used in your level
- **act** - This is called during the action stage of the level's lifecycle. This is ran on every frame of the game loop. This should be used to run anything that needs to occur during the playing of the level
- **drawBack** - This is called during the drawing stage of the level's lifecycle. This is ran on every frame of the game loop. This should be used to draw anything in the back of the level (drawn before the models are drawn)
- **drawFront** - This is called during the drawing stage of the level's lifecycle. This is ran on every frame of the game loop. This should be used to draw anything at the front of the level (drawn after the models are drawn)

## Protected Methods
- **registerLevelEvents** - This is used to register any events in the level, using the [ModelEventManager](../reference/ModelEventManager.md), [KeyboardEventManager](../reference/KeyboardEventManager.md), and [PointerEventManager](../reference/PointerEventManager.md)

## Using the Frame Manager

A "frame" of a level refers to an area of the level, with a background and a "light mask". These objects are instances of the [Frame class](../reference/Frame.md).

A frame will have position (x/y) and size (width/height) properties, that will need to be set with "unit" values. You will then use the `setBackgroundColor` and `setBackgroundImage` methods on the frame, to setup its background. 

You may then want to use the `setLightMaskImage` method, to set a "light mask" for the frame. A light mask is usually an image of a gradient, with very transparent colors. The opacity/transparency of the different parts of the image will represent darkness/light.

Once you have set up the frames for your level, you can add them to the [frame manager](../reference/FrameManager.md), using its `setFrames` method.

## Setting up Model Events with the Model Event Manager

Events that occur between models should be registered in the level's `registerLevelEvents` method. They will be registered with the [ModelEventManager](../reference/ModelEventManager.md).

### Event Checks

First, you will want to create your "event checks". These are functions that take 3 parameters:

- **modelA** - This is the first model involved in the event
- **modelB** - This is the second model involved in the event
- **reactionCallback** - This is a callback function that will be triggered when the event occurs. It takes the 2 models as parameters, so you can trigger methods on those models (e.g. `modelA.loseHealth(modelB.damageValue)`)

The event check function should check to see if the event has occurred between the 2 models, and then trigger the reaction callback if it has.

The `eventCheck` and `eventReactionCallback` types can be found in the [IModelEventManager file](../../Kernel/entities/Level/IModelEventManager.ts)

### Event Registration

Once you have your event checks functions, you will then want to create your events. These will be objects that implement the [IModelEventRegistrationDetails](../reference/IModelEventRegistrationDetails.md) interface. Each event object will have the event check function, the classes of each model type involved in the event, and the reaction callback.

Once you have created your events, you should register them in the level's `registerLevelEvents` method. You can do this with the ModelEventManager's `registerEventsArray` method. This will take the array of events, and the array of the level's models, as parameters.

When the events are being registered, the ModelEventManager will determine which models will need to be checked for each event. This means that you can register every event for your game in your base level class (as any event checks against model types that don't exist in the level will just be ignored).

## Setting up Keyboard Events with the Keyboard Event Manager

You can listen for any keydown/keyup events using the [KeyboardEventManager](../reference/KeyboardEventManager.md). You should register these events in the level's `registerLevelEvents` method.

The KeyboardEventManager has 2 methods for registering events: `addKeyDownEventCallback` and `addKeyUpEventCallback`. Both of these methods take 2 parameters:
- A callback function - The function will take a `KeyboardEvent` object as a parameter, so you can determine which key was pressed/released
- `isActiveWhenPaused` - If this is true, the event callback can still be triggered when the game is paused

## Setting up Mouse Events with the Pointer Event Manager

You can listen for click and hover events, using the [PointerEventManager](../reference/PointerEventManager.md). You should register these events in the level's `registerLevelEvents` method.

Events are registered using the `addPointerEventSubject` method. This method takes 5 parameters:
- The `isPointerOverlapping` callback - This is used to determine if the pointer is overlapping the subject (the subject could be a model, image, etc). This callback takes an X and Y value as parameters (These are pixel values -- the X and Y positions of the pointer on the canvas).
- The `isActive` callback - This should return true when the subject is active
- The `onClick` callback - This will be called whenever the subject is clicked
- The `onHover` callback - This will be called when the pointer is hovering over the subject
- `isActiveWhenPaused` - If this is true, the event callbacks can still be triggered when the game is paused

## Setting Up and Using the Camera

During the preparation stage of the level, you may want to set/reset the position of the [Camera](../reference/Camera.md). You may also want to move the camera during the action stage.

There are 2 methods you may want to use, when setting up the camera:
- `setColors` - This will allow you to set the colors of the background and letterboxing
- `setCameraPosition` - This will allow you to set the X/Y positions of the camera

While the player is playing the level, you may want to move the camera around. As well as using the `setCameraPosition` method, you may also want to use the movement methods (`moveLeft`, `moveRight`, `moveUp`, and `moveDown`). The movement methods will move the camera at a speed that will remain (fairly) consistent, even if the FPS changes.