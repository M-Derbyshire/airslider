# 2 - Game Entities; Level Lifecycle

## Entities

There are 4 kinds of "entities" that you will create in your game:

- **Levels** - These are the levels of your game, but they can also be things like menu screens, loading screens, etc. You should take a look at the [Level reference docs](../reference/Level.md)
- **Models** - These are the objects ("sprites") that exist within a level. E.g. the player's character, a monster, a power-up. You should take a look at the [Model reference docs](../reference/Model.md)
- **HUD Components** - These are components that make up a level's Heads Up Display. E.g. a pause/play button, a fullscreen toggle button, a health display. You should take a look at the [HUDComponent reference docs](../reference/HUDComponent.md)
- **HUDs** - These contain the HUD Components for a level. You should take a look at the [HUD reference docs](../reference/HUD.md)

### Base Entities

Every entity you create should be a descendant of the base class that has been defined for that entity (see the reference docs mentioned in the list above). That being said, you probably won't want to extend those classes directly. Instead, you will want to create a "base" class for your game, that extends the framework's base class (you may even have multiple base classes, for different purposes). Your entities can then extend the game's "base" class for that entity.

For example, for a game called "Farm Sim" you could have a `FarmSimModel` class, that extends the `Model` class. That class could then contain code that is used for all of your game's models. Your model classes (e.g. `Sheep`, `Cow`) would then extend the `FarmSimModel` class.

### Creating Entities with SCAFF

You can quickly create entities in your game, using some of the NPM scripts. These scripts make use of a tool called SCAFF (for more information on SCAFF, visit its [repository](https://github.com/M-Derbyshire/scaff)).

These are the NPM scripts available:
- `make:level:base` - This creates a "base" level entity, that extends the `Level` class
- `make:level` - This creates a level entity. You will be asked to provide the name of the "base" level class that you want this to extend
- `make:model:base` - This creates a "base" model entity, that extends the `Model` class
- `make:model` - This creates a model entity. You will be asked to provide the name of the "base" model class that you want this to extend
- `make:hudComponent:base` - This creates a "base" HUD component entity, that extends the `HUDComponent` class
- `make:hudComponent` - This creates a HUD component entity. You will be asked to provide the name of the "base" HUD component class that you want this to extend
- `make:hud:base` - This creates a "base" HUD entity, that extends the `HUD` class
- `make:hud` - This creates a HUD entity. You will be asked to provide the name of the "base" HUD class that you want this to extend

### Overriding Entity Methods

When you override an entity's methods, you will want to call the parent's (`super`) method at the start of your method (this ensures that fundamental code is ran).

### Loading Entity Assets, Using the Asset Handler

Every entity will have a `load` method. In this method, you will want to load any assets (e.g. images and sounds). You do this using the [AssetHandler](../reference/AssetHandler.md). The asset handler has 2 methods that will be used for this:
- `loadImage` - Used to load images. This will take the file path to the image, and return the image object
- `loadAudio` - Used to load sounds/music. This will take the file path to the audio file, and return the audio object

The file paths in your code should start in the `/src` directory. For example: `/models/Racer/anim/racer-spritesheet.png`

## A Level's Lifecycle

There are 6 stages in a level's lifecycle:
- **Construction** - This is where the level gets constructed. The level's constructor should also create the HUD object (which will create the HUD component objects). Another method that could be considered a part of this stage is the level's `getModels` method (which constructs and returns the models for the level)
- **Loading** - This handles the loading of the level's assets (such as images and sounds). The assets for the other entity types are also loaded during this stage. This stage will happen in the background, while another level is running.
- **Preparation** - This is where the level (and the other entities) set any initial values needed for the starting of the level (for example, a character's health may be set to 100%). This stage happens when the level starts, but also when it is restarted (to reset everything).
- **Action** - This is where the actions of the game occur. E.g. the moving of a character, or a level's "Remaining Time" counter being updated. The event checks also run during this stage (e.g. collision detection). These actions will be triggered in a loop (the "game loop") continuously.
- **Drawing** - This is where the game's entities are drawn to the screen. E.g. the level's background, or a frame of a model's sprite animation. This drawing action will be tiggered in a loop (the "game loop") continuously.
- **Unloading** - This is where the level (and the models, HUDs and HUD components) unload their assets (e.g. images, sounds). Each entity defines an array of assets that should be unloaded, and any assets that aren't in this array will remain in memory (For example, you may not want to unload the assets for your main character, as those will be used on every level).