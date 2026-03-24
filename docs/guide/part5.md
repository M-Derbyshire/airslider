# 5 - Model Entities

The models are the objects in your game (such as a character, power-up or enemy). The [Model](../reference/Model.md) can act during the running of the game, and will draw its sprite animation to the canvas.

## Model Constructor Parameters
- A new instance of the [ModelAnimationsManager](../reference/ModelAnimationsManager.md) class

## Public Properties
- **text** - This is used to set the text content for the Model. This object will implement the [ITextContent](../reference/ITextContent.md) interface. If the `content` property on this object is set, then the Model will trigger the drawing of the text
- **active** - This boolean determines if the Model is active. If it is not active, its `act` method will not be called as the level runs. Also, if it is not active, its sprite will not be drawn, and it will not trigger any events
- **display** - This boolean determines if the model should be drawn. If this is false, the Model's `act` method will still be called on each frame, but the model will not be drawn
- **x** - The X-axis position of the model (in units)
- **y** - The Y-axis position of the model (in units)
- **z** - The Z-axis position of the model
- **width** - The current width of the Model's sprite (in units)
- **height** - The current height of the Model's sprite (in units)
- **xSpeed** - The speed of the Model, on the X-axis. If the `moveLeft`/`moveRight` methods are called without a speed parameter, this is the speed value that will be used
- **ySpeed** - The speed of the Model, on the Y-axis. If the `moveUp`/`moveDown` methods are called without a speed parameter, this is the speed value that will be used
- **zSpeed** - The speed of the Model, on the Z-axis. If the `moveIn`/`moveOut` methods are called without a speed parameter, this is the speed value that will be used
- **state** - This is the current "state" of the Model. The "state" could be many things: "movingUp", "movingDown", "walkingLeft", "walkingRight", "exploding", etc. The state property will be used when the Model's animation manager is deciding which animation to draw

## Protected Properties
- **animationManager** - This manages the drawing of the Model's animations to the canvas.
- **assetsToUnload** - This is an array of file paths to assets (e.g. images, sounds) that can be removed from memory when the Model is unloaded. There may be some assets that you want to keep in memory, even after the Model is unloaded (e.g. the spritesheet for your main character, as that is used in every level), so those should not be included in this array
- **sounds** - This is an array of [IEntitySound](../reference/IEntitySound.md) objects. These objects are used to add the Model's sounds to the [SoundEngine](../reference/SoundEngine.md), so they can be triggered during the playing of the game
- **hitBoxDrawColor** - If this is set, the Model's hitboxes will be drawn over the Model (using the color set in this property). This is useful during development

## Public Methods
- **load** - This is called during the loading stage of the level's lifecycle. It is used to load the assets (images/sounds) for the Model, and to set the `assetsToUnload` and `sounds` arrays
- **prepare** - This is called during the preparation stage of the level's lifecycle (when the level first runs, and whenever it restarts). This should be used to reset any properties, so they are ready for the start of the level
- **registerAnimations** - This is called during the preparation stage of the level's lifecycle (when the level first runs, and whenever it restarts). This is used to create and register the Model's animations with the animation manager. This will be explained in a later section
- **act** - This is called during the action stage of the level's lifecycle. This is ran on every frame of the game loop. This should be used to make the Model do things
- **checkForExtraEvents** - Events that occur between Models are handled by the [ModelEventManager](../reference/ModelEventManager.md) (e.g. collision detection). However, there may be other events (specific to a single Model) that you want to check for, and react to (e.g. bouncing when colliding with the ground). These event checks should be handled in this method
- **getHitBoxes** - This method is used to generate an array of [IHitBox](../reference/IHitBox.md) objects. These objects can then be used in your event checks (e.g. to check for collision events). Each hitbox should cover a part of your model's sprite. For example, if you had a "Spaceship" Model, you may want a hit box covering its body, and another covering its wings (meaning the empty spaces between the wings and the body will not cause a collision). You may also want to return different hitboxes, based on the `state` property (as different sprite animations may require different hitbox positions/sizes). The base implementation of this method will place a box around the whole sprite.
- **isPointerOverlapping** - This is used to determine if the mouse pointer is currently overlapping the Model (this can be useful when the Level is registering pointer events with the [PointerEventManager](../reference/PointerEventManager.md)).

## Protected Methods
- **moveLeft/moveRight** - These methods are used to move the Model along the X-axis
- **moveUp/moveDown** - These methods are used to move the Model along the Y-axis
- **moveIn/moveOut** - These methods are used to move the Model along the Z-axis

## Creating and Registering Animations with the Model Animation Manager

You should create and register your Model's animations in the `registerAnimations` method.

### Creating Animations

To create an animation, you will use the animation manager's `createAnimation` method. This method will take an object that implements [IAnimationDetails](../reference/IAnimationDetails.md), and will return an animation object ([IAnimation](../reference/IAnimation.md)).

The `IAnimationDetails` interface has the following properties:
- **spritesheet** - This is the "spritesheet" image (an image that contains all of the frames of the animation)
- **frameCoordinates** - This takes an array of [IFrameCoordinates](../reference/IFrameCoordinates.md) objects. Each object will represent a single frame of the animation. The values in the object describe the location (on the spritesheet) of the correct image for the frame
- **fps** - This determines the Frames-Per-Second that the animation should run at (this can be different to the FPS of the game itself)
- **drawWidth** - This "unit" value determines the width of the image, when drawing it to the canvas
- **drawHeight** - This "unit" value determines the height of the image, when drawing it to the canvas
- **xOffset** *(Optional)* - If the X-axis position of the model needs to change when switching to this animation, it will be changed using this value (the value will be added to it, allowing you to shift the Model's position)
- **yOffset** *(Optional)* - If the Y-axis position of the model needs to change when switching to this animation, it will be changed using this value (the value will be added to it, allowing you to shift the Model's position)
- **onAnimationEnd** *(Optional)* - A callback that will be triggered when this animation has ended. If you don't want the animation to be looped, you can use this to change the model's `state` property

### Registering Animations

Once you have created your animations, you will need to register them using the animation manager's `registerAnimations` method. This method takes an object as its parameter. The property names on the object should be the valid "states" that the Model can have (the possible values of the `state` property). The values of each property will be one of the animations you created. When your model is being drawn, the animation manager will use the animation that corresponds with the current "state" of the Model.