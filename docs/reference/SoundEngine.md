# SoundEngine
*Implements [ISoundEngine](../../Kernel/engines/SoundEngine/ISoundEngine.ts)*

The `SoundEngine` is the engine that controls the sound/music of the game.

## Methods

### `addSound`

The `addSound` method adds a sound to the engine's library (or replaces an existing sound)

#### Parameters:
- **key** - A unique key, used to identify the sound
- **asset** - The sound asset to add to the library

### `getSoundStatus`

The `getSoundStatus` method gets the current status of a sound (e.g. playing, paused, stopped, force-loading).

#### Parameters:
- **key** - The key used to identify the sound

### `getSoundVolume`

The `getSoundVolume` method is gets the current volume of a sound

#### Parameters:
- **key** - The key used to identify the sound

### `setSoundVolume`

The `setSoundVolume` method is changes the volume of a sound

#### Parameters:
- **key** - The key used to identify the sound

### `playSound`

The `playSound` method starts (or unpauses) a sound. If the sound is already playing, this will restart it

#### Parameters:
- **key** - The key used to identify the sound
- **loop** - Should the sound be looped?

### `pauseSound`

The `pauseSound` method pauses a sound

#### Parameters:
- **key** - The key used to identify the sound

### `stopSound`

The `stopSound` method stops a sound

#### Parameters:
- **key** - The key used to identify the sound

### `reset`

The `reset` method stops and resets all of the current sounds

### `forceSoundToLoad`

The `forceSoundToLoad` method forces a sound to be loaded (so it's definitely ready to be played)

#### Parameters:
- **key** - The key used to identify the sound

### `getSoundKeys`

The `getSoundKeys` method generates an array that contains the keys of all of the sounds in the engine's library

### `getPlayingSoundKeys`

The `getPlayingSoundKeys` method generates an array that contains the keys of the currently playing sounds