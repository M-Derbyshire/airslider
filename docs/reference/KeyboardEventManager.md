# KeyboardEventManager
*Implements [IKeyboardEventManager](../../Kernel/entities/Level/IKeyboardEventManager.ts)*

Manages any keyboard events

## Methods

### `addKeyDownEventCallback`

Registers a callback function that will be called when a key-down event occurs

#### Parameters:
- **callback** - The callback to register
- **isActiveWhenPaused** - Should this callback still be triggered when the game is paused?

### `addKeyUpEventCallback`

Registers a callback function that will be called when a key-up event occurs

#### Parameters:
- **callback** - The callback to register
- **isActiveWhenPaused** - Should this callback still be triggered when the game is paused?

### `removeKeyboardEventCallbacks`

Unregisters all of the event callbacks

### `removeEventHandlers`

Removes the keyboard event listeners