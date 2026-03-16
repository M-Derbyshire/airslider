# AssetHandler
*Implements [IAssetHandler](../../Kernel/AssetHandler/IAssetHandler.ts)*

The asset handler is the object that manages the game's image/audio assets. It can be accessed via the Kernel.

You will use the `AssetHandler` in the `load` methods of your levels/models/HUDs/HUDComponents, to trigger the loading of their assets.

## Methods

### `loadImage`

The `loadImage` method loads an image with the asset handler. If the asset has already been loaded, the reference to it will be returned.

#### Parameters:
- **path** - The file path to the image (this should be a full file path, starting from the `/src` directory within the project)

### `loadAudio`

The `loadAudio` method loads an audio file with the asset handler. If the asset has already been loaded, the reference to it will be returned

#### Parameters:
- **path** - The file path to the audio file (this should be a full file path, starting from the `/src` directory within the project)

### `loadFont`

The `loadFont` method starts the loading of a font file into the HTML document. You shouldn't need to call this from your own code, as this will be called automatically by the kernel (which will load all of the fonts listed in the `/src/fonts/fonts.ts` file)

#### Parameters:
- **name** - The name of the font
- **path** - The path to the font file (this should be a full file path, starting from the root of the project)

### `releaseAsset`

The `releaseAsset` method deletes the asset with the given file path. You should not need to call this from your own code, as your entities (models/levels/HUDs/HUDComponents) will automatically call this during the unloading process (this will only happen for assets in the entity's assetsToUnload array)

#### Parameters:
- **path** - The file path to the asset file (this should be a full file path, starting from the `/src` directory within the project)

## Properties

### `assetsStillLoading`

The `assetsStillLoading` is the number of assets that are still loading