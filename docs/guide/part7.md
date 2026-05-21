# 7 - HUD Component Entities

[HUDComponents](../reference/HUDComponent.md) are entities that are displayed over the top of the game. They can provide information to the player (e.g. health) or they can give the player a control (e.g. a pause button).

## Public Properties
- **x/y** - These "unit" values are used to set the position of the component, on the canvas. You will use these properties when drawing the component
- **width/height** - These "unit" values are used to set the dimensions of the component, on the canvas. You will use these properties when drawing the component
- **active** - This boolean determines if the component is active. If it is not active, it will not be drawn
- **text** - This is used to set the text content for the component. This object will implement the [ITextContent](../reference/ITextContent.md) interface. If the `content` property on this object is set, then the component will trigger the drawing of the text

## Protected Properties
- **assetsToUnload** - This is an array of file paths to assets (e.g. images, sounds) that can be removed from memory when the component is unloaded. There may be some assets that you want to keep in memory, even after the component is unloaded (e.g. the image for your pause button), so those should not be included in this array
- **sounds** - This is an array of [IEntitySound](../reference/IEntitySound.md) objects. These objects are used to add the component's sounds to the [SoundEngine](../reference/SoundEngine.md), so they can be triggered during the playing of the game

## Public Methods
- **load** - This is called during the loading stage of the level's lifecycle. It is used to load the assets (images/sounds) for the component, and to set the `assetsToUnload` and `sounds` arrays
- **prepare** - This is called during the preparation stage of the level's lifecycle (when the level first runs, and whenever it restarts). This should be used to reset any properties, so they are ready for the start of the level
- **draw** - This is called during the drawing stage of the level's lifecycle. This is ran on every frame of the game loop. This should be used to draw the images that make up the component's display. This takes a [GraphicEngine](../reference/GraphicEngine.md) object as a parameter, as well as the canvas's context. You should use the Graphic Engine's `getStaticDrawPositionsAndDimensions` method to calculate the correct pixel values to use when drawing the component. You can then draw the component's images using the canvas context. **Note**: You will not need to manually draw the text to the canvas, as this will be handled automatically when you set the `content` property on the component's `text` object
- **isPointerOverlapping** - This is used to determine if the mouse pointer is currently overlapping the component (this can be useful when the HUD is registering pointer events with the [PointerEventManager](../reference/PointerEventManager.md))