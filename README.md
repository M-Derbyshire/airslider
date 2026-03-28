# Air Slider

Air Slider is a browser game, where you play as Tarian (a champion hoverboard racer), as she attempts to win the Air Slider Championship. The Air Slider Championship has 5 races, each held on a different planet in the galaxy. You, the player, will need to avoid all of the dangers and monsters that each planet can throw at you, as you attempt to reach the finish line.

Air Slider is a browser game, with a custom-built engine/framework. It is written in TypeScript.

## Documentation

There are 2 types of documentation for the game's framework:
- [**Guides**](/docs/guide/index.md) - These guide you through the different parts of the framework, and explain the concepts that you will need to understand when building a game with it
- [**Reference Documentation**](/docs/reference/index.md) - This is the documentation for the different types/entities that you may work with when building your game

## Running the Game Locally

To run the game locally, using the development settings, you should run the `serve:dev` command using NPM.

## Building the Game

To build the game for your production environment, you should use the `deploy:prod` NPM command. This will generate the `/build` directory. Inside this directory, you will find the bundled script (that will run the game) and the `/build/assets` directory (This will contain all of the game's assets. E.g. images, sounds, fonts).