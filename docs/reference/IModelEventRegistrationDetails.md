# [IModelEventRegistrationDetails](../../Kernel/entities/Level/IModelEventManager.ts)

The details that are needed to register an event with an IModelEventManager

## Properties:

### `check`

The function that checks for the event (and then may call the action methods on the models involved)

### `class1`

The first model class that is involved in this type of event

### `class2`

The second model class that is involved in this type of event

### `reactionCallback`

A callback that should be triggered when this event occurs