import { waitFor } from "@testing-library/dom";
import AssetHandler from "../AssetHandler/AssetHandler";
import FrameManager from "../engines/GraphicEngine/FrameManager";
import ILevel from "../entities/Level/ILevel";
import KeyboardEventManager from "../entities/Level/KeyboardEventManager";
import Level from "../entities/Level/Level";
import ModelEventManager from "../entities/Level/ModelEventManager";
import PointerEventManager from "../entities/Level/PointerEventManager";
import Model from "../entities/Model/Model";
import ModelAnimationsManager from "../entities/Model/ModelAnimationsManager/ModelAnimationsManager";
import { SettingsWithDefaults } from "../settings/ISettings";
import LevelQueue from "./LevelQueue";
import IFrameManager from "../engines/GraphicEngine/IFrameManager";
import IModelEventManager from "../entities/Level/IModelEventManager";
import IPointerEventManager from "../entities/Level/IPointerEventManager";
import IKeyboardEventManager from "../entities/Level/IKeyboardEventManager";
import IModelAnimationsManager from "../entities/Model/ModelAnimationsManager/IModelAnimationsManager";

describe("LevelQueue", () => {
    const createLevel = (canvas:HTMLCanvasElement):ILevel => {
        return new Level(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(canvas),
            new KeyboardEventManager()
        );
    };

    const createSettingsObject = ():SettingsWithDefaults => {
        return {
            getInitialLevel: jest.fn(),
            fpsLimit: 70    ,
            isFullscreenEnabled: true,
            unitsWithinCameraX: 1000,
            unitsWithinCameraY: 1000,
            aspectRatioHorizontal: 17,
            aspectRatioVertical: 9
        };
    };

    it("should return undefined for currentLevel property when no level has been loaded", () => {
        const queue = new LevelQueue(new AssetHandler(jest.fn()));

        expect(queue.currentLevel).toBeUndefined();
    });

    it("should return undefined for currentEngines property when no level has been loaded", () => {
        const queue = new LevelQueue(new AssetHandler(jest.fn()));

        expect(queue.currentEngines).toBeUndefined();
    });

    it("should return false for currentLevelHasBeenPrepared property when no level has been loaded", () => {
        const queue = new LevelQueue(new AssetHandler(jest.fn()));

        expect(queue.currentLevelHasBeenPrepared).toBe(false);
    });

    it("should return empty array for currentModels property when no level has been loaded", () => {
        const queue = new LevelQueue(new AssetHandler(jest.fn()));

        expect(queue.currentModels.length).toBe(0);
    });

    describe("loadLevel", () => {
        it("should call the load method on the given level, with the given AssetHandler", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const queue = new LevelQueue(assetHandler);

            const canvas = document.createElement("canvas");
            const level = createLevel(canvas);
            level.load = jest.fn();

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());

            expect(level.load).toHaveBeenCalledTimes(1);
            expect(level.load).toHaveBeenCalledWith(assetHandler);
        });

        it("should initialise a new camera with the correct settings, and pass it to the new GraphicEngine", () => {
            const settings = {
                ...createSettingsObject(),
                unitsWithinCameraX: 1042,
                unitsWithinCameraY: 1043,
                aspectRatioHorizontal: 19,
                aspectRatioVertical: 7
            };

            const queue = new LevelQueue(new AssetHandler(jest.fn()));

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            canvas.width = 190;
            canvas.height = 150;
            context.fill = jest.fn();

            const level = createLevel(canvas);
            queue.loadLevel(level, settings, context, jest.fn());

            const graphicEngineCamera = queue.currentEngines.graphicEngine.camera;

            // Confirm the correct units-within-camera values were passed in
            expect(graphicEngineCamera.unitsWithinCameraX).toBe(settings.unitsWithinCameraX);
            expect(graphicEngineCamera.unitsWithinCameraY).toBe(settings.unitsWithinCameraY);

            // Check correct aspect ratio values were passed in
            const expectedPositionWidth = 190;
            const expectedPositionHeight = 70;
            expect(graphicEngineCamera.canvasPositionWidth).toBe(expectedPositionWidth);
            expect(graphicEngineCamera.canvasPositionHeight).toBe(expectedPositionHeight);

            // Check the correct canvas was passed in
            expect(context.fill).not.toHaveBeenCalled();
            graphicEngineCamera.drawBack();
            expect(context.fill).toHaveBeenCalled();
        });

        it("should initialise new engines, with the correct parameters", async () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            // We want to ensure the correct error handler was passed to the SoundEngine
            const errorHandler = jest.fn();

            // We want to ensure the correct level and models were passed to the GameEngine.
            // We also want to ensure the correct FrameManager was passed to the GraphicEngine
            const model = new Model(new ModelAnimationsManager());
            model.act = jest.fn();
            model.active = true;

            const frameManager = new FrameManager();
            frameManager.prepareFramesForDrawing = jest.fn();

            const level = new Level(
                frameManager,
                new ModelEventManager(),
                new PointerEventManager(canvas),
                new KeyboardEventManager()
            );
            level.getModels = jest.fn().mockReturnValue([model]);
            level.act = jest.fn();
            level.drawBack = jest.fn();

            queue.loadLevel(level, createSettingsObject(), context, errorHandler);

            // Check correct parameters passed to GameEngine
            const gameEngine = queue.currentEngines.gameEngine;
            expect(level.act).not.toHaveBeenCalled();
            expect(model.act).not.toHaveBeenCalled();
            gameEngine.run();
            expect(level.act).toHaveBeenCalledTimes(1);
            expect(model.act).toHaveBeenCalledTimes(1);

            // Check correct parameters passed to GraphicEngine
            const graphicEngine = queue.currentEngines.graphicEngine;
            expect(frameManager.prepareFramesForDrawing).not.toHaveBeenCalled();
            expect(level.drawBack).not.toHaveBeenCalled();
            graphicEngine.run(level, [], 60);
            expect(frameManager.prepareFramesForDrawing).toHaveBeenCalledTimes(1);
            expect(level.drawBack).toHaveBeenCalledWith(expect.anything(), context);

            // Check correct parameters passed to SoundEngine
            const soundEngine = queue.currentEngines.soundEngine;
            const expectedError = "test error 123"
            const soundKey = "test";
            const sound = new Audio(soundKey);
            sound.pause = jest.fn();
            sound.play = jest.fn().mockRejectedValue(expectedError);

            soundEngine.addSound(soundKey, sound);
            expect(errorHandler).not.toHaveBeenCalled();

            soundEngine.playSound(soundKey);
            await waitFor(() => {
                expect(errorHandler).toHaveBeenCalledTimes(1);
                expect(errorHandler).toHaveBeenCalledWith(expectedError);
            });
        });
        
        it("should call the registerSounds method on the given level, with the created SoundEngine", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");

            const expectedSoundKey = "test-sound-123.mp3";

            class TestLevel extends Level {
                constructor(
                    frameManager:IFrameManager,
                    modelEventManager:IModelEventManager,
                    pointerEventManager:IPointerEventManager,
                    keyboardEventManager:IKeyboardEventManager
                ) {
                    super(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

                    const sound = new Audio(expectedSoundKey);
                    sound.pause = jest.fn();
                    this.sounds = [
                        {
                            key: expectedSoundKey,
                            asset: sound
                        }
                    ];
                }
            }

            const level = new TestLevel(
                new FrameManager(),
                new ModelEventManager(),
                new PointerEventManager(canvas),
                new KeyboardEventManager()
            );

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());
            const soundEngine = queue.currentEngines.soundEngine;
            
            const soundKeys = soundEngine.getSoundKeys();
            expect(soundKeys).toContain(expectedSoundKey);
        });

        it("should call the load and registration methods on all models", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const queue = new LevelQueue(assetHandler);

            // We will use this to ensure the registerSounds method was called on all models
            // the soundKeyNum helps us to create a unique key for each model
            class TestModel extends Model {
                constructor(animManager:IModelAnimationsManager, soundKey:string) {
                    super(animManager);

                    const sound = new Audio(soundKey);
                    sound.pause = jest.fn();
                    this.sounds = [
                        {
                            key: soundKey,
                            asset: sound
                        }
                    ];
                }
            }

            const expectedSoundKeys = [
                "sound-key-1.mp3",
                "sound-key-2.mp3",
                "sound-key-3.mp3"
            ];
            const models = [
                new TestModel(new ModelAnimationsManager, expectedSoundKeys[0]),
                new TestModel(new ModelAnimationsManager, expectedSoundKeys[1]),
                new TestModel(new ModelAnimationsManager, expectedSoundKeys[2])
            ];
            models.forEach(model => {
                model.load = jest.fn();
                model.registerAnimations = jest.fn();
            });

            const canvas = document.createElement("canvas");
            const level = createLevel(canvas);
            level.getModels = jest.fn().mockReturnValue(models);

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());
            const soundKeys = queue.currentEngines.soundEngine.getSoundKeys();

            models.forEach((model, idx) => {
                expect(model.load).toHaveBeenCalledTimes(1);
                expect(model.load).toHaveBeenCalledWith(assetHandler);

                expect(model.registerAnimations).toHaveBeenCalledTimes(1);
                expect(soundKeys).toContain(expectedSoundKeys[idx]);
            });
        });

        it("should add the correct values to the queue", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));

            const models = [
                new Model(new ModelAnimationsManager),
                new Model(new ModelAnimationsManager),
                new Model(new ModelAnimationsManager)
            ];
            models.forEach((model, idx) => {
                // Giving the model a unique value, to make them identifiable by Jest
                model.x = idx;
            });

            const canvas = document.createElement("canvas");
            const level = createLevel(canvas);
            level.getModels = jest.fn().mockReturnValue(models);

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());

            // The current engines are checked in other tests, so not repeating that logic here
            // for brevity (it requires a lot of setup to check, and would make this test less readable)
            expect(queue.currentLevel).toBe(level);
            expect(queue.currentModels).toBe(models);
            expect(queue.currentLevelHasBeenPrepared).toBe(false);
        });

        it("should add the result to the end of the queue", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            const level1 = createLevel(canvas);
            const level2 = createLevel(canvas);

            queue.loadLevel(level1, createSettingsObject(), context, jest.fn());
            queue.loadLevel(level2, createSettingsObject(), context, jest.fn());

            expect(queue.currentLevel).toBe(level1);

            queue.unloadCurrentLevel();

            expect(queue.currentLevel).toBe(level2);
        });

        it("should load level before getting its models, or registering its sounds", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");

            const level = createLevel(canvas);

            // We're going to capture the names of the methods that are called, and
            // push them into this array. If this array is in the right order, then
            // the methods were called in the right order
            const capturedMethodNames:string[] = [];
            level.load = jest.fn().mockImplementation(() => capturedMethodNames.push("load"));
            level.getModels = jest.fn().mockImplementation(() => {
                capturedMethodNames.push("getModels");
                return [];
            }); 
            level.registerSounds = jest.fn().mockImplementation(() => capturedMethodNames.push("registerSounds"));

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());

            expect(capturedMethodNames.length).toBe(3);
            expect(capturedMethodNames[0]).toBe("load");
            expect(capturedMethodNames).toContain("getModels");
            expect(capturedMethodNames).toContain("registerSounds");
        });

        it("should not call the prepare method on the level, or models", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");

            const model = new Model(new ModelAnimationsManager());
            model.prepare = jest.fn();

            const level = createLevel(canvas);
            level.prepare = jest.fn();
            level.getModels = jest.fn().mockReturnValue([model]);

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());
            
            expect(level.prepare).not.toHaveBeenCalled();
            expect(model.prepare).not.toHaveBeenCalled();
            expect(queue.currentLevelHasBeenPrepared).toBe(false);
        });
    });

    describe("unloadCurrentLevel", () => {
        it("should not throw if no level currently loaded", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));

            expect(() => queue.unloadCurrentLevel()).not.toThrow();
        });

        it("should call reset method on soundEngine", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");
            const level = createLevel(canvas);

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());
            const soundEngine = queue.currentEngines.soundEngine;

            soundEngine.reset = jest.fn();

            queue.unloadCurrentLevel();

            expect(soundEngine.reset).toHaveBeenCalledTimes(1);
        });

        it("should call the unload methods on the level and models", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const queue = new LevelQueue(assetHandler);
            const canvas = document.createElement("canvas");

            const models = [
                new Model(new ModelAnimationsManager()),
                new Model(new ModelAnimationsManager()),
                new Model(new ModelAnimationsManager())
            ];
            models.forEach(model => {
                model.unload = jest.fn();
            });

            const level = createLevel(canvas);
            level.unload = jest.fn();
            level.getModels = jest.fn().mockReturnValue(models);

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());

            expect(level.unload).not.toHaveBeenCalled();
            models.forEach(model => expect(model.unload).not.toHaveBeenCalled());

            queue.unloadCurrentLevel();

            expect(level.unload).toHaveBeenCalledTimes(1);
            expect(level.unload).toHaveBeenCalledWith(assetHandler);
            models.forEach(model => {
                expect(model.unload).toHaveBeenCalledTimes(1);
                expect(model.unload).toHaveBeenCalledWith(assetHandler);
            });
        });

        it("should remove current level from queue", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            const level1 = createLevel(canvas);
            const level2 = createLevel(canvas);

            queue.loadLevel(level1, createSettingsObject(), context, jest.fn());
            queue.loadLevel(level2, createSettingsObject(), context, jest.fn());

            expect(queue.currentLevel).toBe(level1);

            queue.unloadCurrentLevel();

            expect(queue.currentLevel).toBe(level2);
        });
    });

    describe("markCurrentLevelAsUnprepared", () => {
        it("should not throw if no level currently loaded", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));

            expect(() => queue.markCurrentLevelAsUnprepared()).not.toThrow();
        });

        it("should mark the current level as prepared", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");

            const level = createLevel(canvas);

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());
            queue.prepareCurrentLevelAndModels();
            expect(queue.currentLevelHasBeenPrepared).toBe(true);

            queue.markCurrentLevelAsUnprepared();
            expect(queue.currentLevelHasBeenPrepared).toBe(false);
        });
    });

    describe("prepareCurrentLevelAndModels", () => {
        it("should not throw if no level currently loaded", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));

            expect(() => queue.prepareCurrentLevelAndModels()).not.toThrow();
        });

        it("should call reset method on soundEngine", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");
            const level = createLevel(canvas);

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());
            const soundEngine = queue.currentEngines.soundEngine;

            soundEngine.reset = jest.fn();

            queue.prepareCurrentLevelAndModels();

            expect(soundEngine.reset).toHaveBeenCalledTimes(1);
        });

        it("should call the prepare methods on the level and models", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");

            const models = [
                new Model(new ModelAnimationsManager()),
                new Model(new ModelAnimationsManager()),
                new Model(new ModelAnimationsManager())
            ];
            models.forEach(model => {
                model.prepare = jest.fn();
            });

            const level = createLevel(canvas);
            level.prepare = jest.fn();
            level.getModels = jest.fn().mockReturnValue(models);

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());

            expect(level.prepare).not.toHaveBeenCalled();
            models.forEach(model => expect(model.prepare).not.toHaveBeenCalled());

            queue.prepareCurrentLevelAndModels();

            expect(level.prepare).toHaveBeenCalledTimes(1);
            expect(level.prepare).toHaveBeenCalledWith();
            models.forEach(model => {
                expect(model.prepare).toHaveBeenCalledTimes(1);
                expect(model.prepare).toHaveBeenCalledWith();
            });
        });

        it("should mark the level as prepared", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");

            const level = createLevel(canvas);

            queue.loadLevel(level, createSettingsObject(), canvas.getContext("2d")!, jest.fn());
            expect(queue.currentLevelHasBeenPrepared).toBe(false);

            queue.prepareCurrentLevelAndModels();
            expect(queue.currentLevelHasBeenPrepared).toBe(true);
        });

        it("should not prepare any other levels in the queue", () => {
            const queue = new LevelQueue(new AssetHandler(jest.fn()));
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const settings = createSettingsObject();

            const level1 = createLevel(canvas);
            const level2 = createLevel(canvas);
            const level3 = createLevel(canvas);
            const level2Model = new Model(new ModelAnimationsManager());
            const level3Model = new Model(new ModelAnimationsManager());

            level2Model.prepare = jest.fn();
            level3Model.prepare = jest.fn();

            level2.getModels = jest.fn().mockReturnValue([level2Model]);
            level2.prepare = jest.fn();
            level3.getModels = jest.fn().mockReturnValue([level3Model]);
            level3.prepare = jest.fn();

            queue.loadLevel(level1, settings, context, jest.fn());
            queue.loadLevel(level2, settings, context, jest.fn());
            queue.loadLevel(level3, settings, context, jest.fn());

            queue.prepareCurrentLevelAndModels();

            expect(level2.prepare).not.toHaveBeenCalled();
            expect(level2Model.prepare).not.toHaveBeenCalled();
            expect(level3.prepare).not.toHaveBeenCalled();
            expect(level3Model.prepare).not.toHaveBeenCalled();
            
            // Check the levels have not been marked as prepared within the queue's state
            queue.unloadCurrentLevel();
            expect(queue.currentLevelHasBeenPrepared).toBe(false);
            queue.unloadCurrentLevel();
            expect(queue.currentLevelHasBeenPrepared).toBe(false);
        });
    });
});