# PointerEventManager
*Implements [IPointerEventManager](../../Kernel/entities/Level/IPointerEventManager.ts)*

Manages any events relating to mouse clicks

## Methods

### `addPointerEventSubject`

Registers callback functions that handle pointer events for a subject.

#### Parameters
- **isPointerOverlapping** - Callback function that determines if the pointer is overlapping the subject. The pointer X/Y parameters are the positions on the canvas, not on the screen
- **isActive** - Callback function that determines if the subject is active
- **onClick** - Callback function that should be called when the subject is clicked
- **onHover** - Callback function that should be called when the pointer is hovering over the subject
- **isActiveWhenPaused** - Should pointer events for this subject still be active when the game is paused?

### `removePointerEventSubjects`

Unregisters all of the event subjects

### `checkForHoverEvents`

Checks the pointer-event subjects to see if any are being hovered over, and triggers their "onHover" methods.

### `removeEventHandlers`

Removes the event listeners from the canvas