# ModelEventManager
*Implements [IModelEventManager](../../Kernel/entities/Level/IModelEventManager.ts)*

Manages the event monitoring between models (e.g. collision events)

## Methods

### `registerEvent`

Registers a new event check. All models that are instances of the 2 given classes will be collected. When the event check is ran, each model of the first class will be checked against each model of the second class, to see if the event has occurred between them.

#### Parameters:
- **event** - The details of an event to be registered
- **models** - The models for the current level

### `registerEventsArray`

Registers multiple event checks. See registerEvent method for more details

#### Parameters:
- **event** - The details of an event to be registered
- **models** - The models for the current level

### `clearEvents`

Removes all the registered event checks

### `checkForEvents`

Runs the event checks, along with any extra events associated with the level's models. You should not need to call this from your own code

#### Parameters:
- **models** - The models for the current level