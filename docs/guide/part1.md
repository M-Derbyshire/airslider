# 1 - The Kernel; Settings; Fonts; Game Initialisation

## The Kernel

The Kernel is a singleton object that manages the running of the game. This object is the central place for you to access the information and entities that may be needed within your game's code.

If your game's code needs access to something (such as an entity, or a piece of information), you will most likely find it through the Kernel object (either as a property/method on that object, or through one of the objects it gives you access to).

You should familiarise yourself with the Kernel, by reading the [Kernel reference docs](../reference/Kernel.md).

You can access the Kernel object anywhere in your code by using the static method on the Kernel class: `Kernel.getInstance()`.

## The Settings Object

The settings object sets certain properties for the game. You will define multiple settings objects, but they will all implement the [ISettings](../reference/ISettings.md) interface. These files can be found in the `/settings` directory

- `settings.base.ts` - This file should contain the settings that are not limited to a specific environment.
- `settings.development.ts` - The object in this file should contain a spread of the contents of the base settings object. You should then add any settings to the object that are specific to your development environment.
- `settings.production.ts` - The object in this file should contain a spread of the contents of the base settings object. You should then add any settings to the object that are specific to your production environment.

### Examples

Below is an example of a base settings object:
```
export default {
    aspectRatioHorizontal: 8,
    aspectRatioVertical: 4,
    getInitialLevel: (kernel:IKernel) => new MyLevelLoadingScreen(
        new FrameManager(),
        new ModelEventManager(),
        new PointerEventManager(kernel.canvasContext.canvas),
        new KeyboardEventManager()
    )
} as ISettings;
```

And here is an example of a development settings object:

```
export default {
    ...baseSettings,
    fpsDisplayColor: "blue"
} as ISettings;
```

### Settings Properties

The settings interface has multiple properties that you can set. Most of the properties are optional (default values will be used if a property is not provided).

- `getInitialLevel` **(Required Property)** - This is a callback function that will construct the game's first level (the "level" could actually be a menu screen, or a loading screen -- but it will be an object that implements the [ILevel](../../Kernel/entities/Level/ILevel.ts) interface). We will look at how to create levels in a later part of the guides
- `fpsLimit` - This helps you to control the Frames-Per-Second of the game. While this puts an upper-limit on the FPS, the game may not actually hit that value. The default value for this is 70, but the game may be running closer to 60fps with that default value
- `fpsDisplayColor` - When this is set, the current FPS will be displayed in a corner of the screen. This setting allows you to determine what color it is displayed in
- `assetsDirUrl` - This should be used for the production build of your game. This will be a URL that points to the base directory that holds your game's assets. If this is not set, then the asset file paths that are defined in your code will be used instead
- `unitsWithinCameraX` - When images are drawn to the canvas, they will need to be drawn using pixel values. However, the game cannot use pixel values, as the size of the canvas may change. This is why we have the concept of "units". Units are used to determine the position/size of images, and those unit values are then converted to pixel values when it is time to actually draw the image. They allow your code to be consistent, regardless of the size of the canvas. This property will determine how many units there will be on the canvas, on the X axis. The default value for this is 1000
- `unitsWithinCameraY` - This is the same as the `unitsWithinCameraX` property, except this determines how many units are on the Y axis. The default value for this is 1000
- `aspectRatioHorizontal` - This is a part of determining the aspect ratio of the game. For example, with a 16:9 aspect ratio, this value would be 16. The default value for this property is 17
- `aspectRatioVertical` - This is a part of determining the aspect ratio of the game. For example, with a 16:9 aspect ratio, this value would be 9. The default value for this property is 9

## The Fonts Object

You can store all of your fonts in the `/src/fonts` directory.

The fonts object is found in `/src/fonts/fonts.ts`. Each property name on the object should be the name of a font, and the value should be the file path to the font (a full file path, starting from within the `/src` directory).

### Example

```
export default {
    MyCrazyFont: "/fonts/MyCrazyFont/MyCrazyFont-Regular.ttf",
    MySeriousFont: "/fonts/MySeriousFont/MySeriousFont.ttf"
};
```

## Initialising the Game

There are 2 files that are used to initialise the game
- `init.dev.ts` - This initialises the game for local development. You should not need to modify this
- `init.prod.ts`- This initialises the game in your production environment

The game is initialised using the Kernel's `init` static method. This method will take 2 parameters: the game's canvas element, and the settings object.

### Example

```
import Kernel from './Kernel/Kernel';
import settings from './settings/settings.production';

const canvas = document.getElementById("my-canvas") as HTMLCanvasElement;

Kernel.init(canvas, settings);
```

## Running/Building the Game

To run the game locally, using the development settings, you should run the `serve:dev` command using NPM.

To build the game for your production environment, you should use the `deploy:prod` NPM command. This will generate the `/build` directory. Inside this directory, you will find the bundled script (that will run the game) and the `/build/assets` directory (This will contain all of the game's assets. E.g. images, sounds, fonts).