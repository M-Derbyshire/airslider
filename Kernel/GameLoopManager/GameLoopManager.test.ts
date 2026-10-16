import AssetHandler from "../AssetHandler/AssetHandler";
import IAssetHandler from "../AssetHandler/IAssetHandler";
import FrameManager from "../engines/GraphicEngine/FrameManager";
import KeyboardEventManager from "../entities/Level/KeyboardEventManager";
import Level from "../entities/Level/Level";
import ModelEventManager from "../entities/Level/ModelEventManager";
import PointerEventManager from "../entities/Level/PointerEventManager";
import Model from "../entities/Model/Model";
import ModelAnimationsManager from "../entities/Model/ModelAnimationsManager/ModelAnimationsManager";
import ILevelQueue from "../LevelQueue/ILevelQueue";
import LevelQueue from "../LevelQueue/LevelQueue";
import { SettingsWithDefaults } from "../settings/ISettings";
import GameLoopManager from "./GameLoopManager";
import IGameLoopManager, { GameLoopStatus } from "./IGameLoopManager";

describe("GameLoopManager", () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    const createSettingsObject = (fpsLimit = 70):SettingsWithDefaults => {
        return {
            getInitialLevel: jest.fn(),
            fpsLimit,
            isFullscreenEnabled: true,
            unitsWithinCameraX: 1000,
            unitsWithinCameraY: 1000,
            aspectRatioHorizontal: 17,
            aspectRatioVertical: 9
        };
    };

    const createLevelQueueWithLoadedLevel = (assetHandler :IAssetHandler, fpsLimit = 70):ILevelQueue => {
        const levelQueue = new LevelQueue(assetHandler);

        const canvas = document.createElement("canvas");
        const level = new Level(
            new FrameManager(),
            new ModelEventManager(),
            new PointerEventManager(canvas),
            new KeyboardEventManager()
        );

        levelQueue.loadLevel(level, createSettingsObject(fpsLimit), canvas.getContext("2d")!, jest.fn());

        return levelQueue;
    };

    const createGameLoopManager = (fpsLimit = 70, prepareLevel = true):IGameLoopManager => {
        const assetHandler = new AssetHandler(jest.fn());

        const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, fpsLimit);
        if(prepareLevel)
            levelQueue.prepareCurrentLevelAndModels();

        return new GameLoopManager(levelQueue, assetHandler, jest.fn(), fpsLimit);
    };

    it("should set the correct default values on construction", () => {
        const fpsLimit = 27;

        const manager = createGameLoopManager(fpsLimit);

        expect(manager.status).toBe(GameLoopStatus.Active);
        expect(manager.totalLevelActiveMilliseconds).toBe(0);
        expect(manager.fps).toBe(fpsLimit);
    });

    it("should return the correct status value", () => {
        const manager = createGameLoopManager();
        
        manager.toggleGamePause();
        expect(manager.status).toBe(GameLoopStatus.PrePaused);
        
        jest.advanceTimersByTime(1000);
        manager.runFrame();
        expect(manager.status).toBe(GameLoopStatus.Paused);

        manager.toggleGamePause();
        expect(manager.status).toBe(GameLoopStatus.Active);
    });

    it("should return correct fps value", () => {
        const fpsLimit = 75;

        const manager = createGameLoopManager(fpsLimit);
        expect(manager.fps).toBe(fpsLimit);

        jest.advanceTimersByTime(1000);
        manager.runFrame();
        expect(manager.fps).toBe(1);

        jest.advanceTimersByTime(500);
        manager.runFrame();
        expect(manager.fps).toBe(2);

        jest.advanceTimersByTime(20);
        manager.runFrame();
        expect(manager.fps).toBe(50);
    });

    it("should return the correct totalLevelActiveMilliseconds value", () => {
        const manager = createGameLoopManager();
        expect(manager.totalLevelActiveMilliseconds).toBe(0);

        jest.advanceTimersByTime(1000);
        manager.runFrame();
        expect(manager.totalLevelActiveMilliseconds).toBe(1000);

        jest.advanceTimersByTime(1000);
        manager.runFrame();
        expect(manager.totalLevelActiveMilliseconds).toBe(2000);

        jest.advanceTimersByTime(500);
        manager.runFrame();
        expect(manager.totalLevelActiveMilliseconds).toBe(2500);
    });

    it("should set the visibilitychange event handler to trigger the pause-toggle", () => {
        const manager = createGameLoopManager();
        manager.toggleGamePause = jest.fn();

        expect(manager.toggleGamePause).not.toHaveBeenCalled();
        
        Object.defineProperty(document, "visibilityState", {
            value: "hidden",
            configurable: true
        });
        document.dispatchEvent(new Event("visibilitychange"));

        expect(manager.toggleGamePause).toHaveBeenCalledTimes(1);
    });

    it.each([
        ["visible"],
        ["something-else"]
    ])("should set the visibilitychange event handler to not trigger the pause-toggle, if document visibility is not hidden", (visibilityState:string) => {
        const manager = createGameLoopManager();
        manager.toggleGamePause = jest.fn();
        
        Object.defineProperty(document, "visibilityState", {
            value: visibilityState,
            configurable: true
        });
        document.dispatchEvent(new Event("visibilitychange"));

        expect(manager.toggleGamePause).not.toHaveBeenCalled();
    });

    it("should set the visibilitychange event handler to not trigger the pause-toggle, if the game-loop status is not active", () => {
        const manager = createGameLoopManager();

        manager.toggleGamePause(); // Set the state to pre-paused

        manager.toggleGamePause = jest.fn();
        
        Object.defineProperty(document, "visibilityState", {
            value: "hidden",
            configurable: true
        });
        document.dispatchEvent(new Event("visibilitychange"));

        expect(manager.toggleGamePause).not.toHaveBeenCalled();
    });

    it("should set the resize event handler to toggle the game status back to active, if the game is paused", () => {
        const manager = createGameLoopManager();

        manager.toggleGamePause(); // Set the state to pre-paused
        jest.advanceTimersByTime(1000);
        manager.runFrame(); // Switch from pre-paused to paused
        expect(manager.status).toBe(GameLoopStatus.Paused);

        manager.toggleGamePause = jest.fn();
        
        window.dispatchEvent(new Event("resize"));

        expect(manager.toggleGamePause).toHaveBeenCalledTimes(1);
    });

    it("should set the resize event handler to not toggle the game status, if the game is not paused", () => {
        const manager = createGameLoopManager();

        manager.toggleGamePause = jest.fn();
        
        window.dispatchEvent(new Event("resize"));

        expect(manager.toggleGamePause).not.toHaveBeenCalled();
    });

    describe("toggleGamePause", () => {
        it("should not toggle to a pre-paused state if the level is not pauseable", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = new LevelQueue(assetHandler);
            const canvas = document.createElement("canvas");
            const level = new Level(
                new FrameManager(),
                new ModelEventManager(),
                new PointerEventManager(canvas),
                new KeyboardEventManager()
            );

            level.isPauseable = false;

            levelQueue.loadLevel(level, createSettingsObject(70), canvas.getContext("2d")!, jest.fn());

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 70);

            manager.toggleGamePause();

            expect(manager.status).toBe(GameLoopStatus.Active);
        });

        it("should not toggle to an active state if the level is not pauseable", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = new LevelQueue(assetHandler);
            const canvas = document.createElement("canvas");
            const level = new Level(
                new FrameManager(),
                new ModelEventManager(),
                new PointerEventManager(canvas),
                new KeyboardEventManager()
            );
            levelQueue.loadLevel(level, createSettingsObject(70), canvas.getContext("2d")!, jest.fn());

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 70);
            manager.toggleGamePause(); // set it to pre-paused

            level.isPauseable = false;
            manager.toggleGamePause();

            expect(manager.status).toBe(GameLoopStatus.PrePaused);
        });

        it("should toggle the status to pre-paused, if the game was active and level is pauseable", () => {
            const manager = createGameLoopManager();

            manager.toggleGamePause();

            expect(manager.status).toBe(GameLoopStatus.PrePaused);
        });

        it("should toggle the status to active, if the game was pre-paused and level is pauseable", () => {
            const manager = createGameLoopManager();

            manager.toggleGamePause(); // toggle to pre-paused

            manager.toggleGamePause(); // toggle back to active

            expect(manager.status).toBe(GameLoopStatus.Active);
        });

        it("should toggle the status to active, if the game was paused and level is pauseable", () => {
            const manager = createGameLoopManager();

            manager.toggleGamePause(); // toggle to pre-paused
            jest.advanceTimersByTime(1000);
            manager.runFrame(); // run a frame, to switch to paused state

            manager.toggleGamePause(); // toggle back to active

            expect(manager.status).toBe(GameLoopStatus.Active);
        });

        it("should pause only the currently playing sounds, when toggling to pre-paused", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler);

            // These are the playing sound keys we expect the pauseSound to be called with
            const playingSoundKeys = ["sound1.mp3", "sount_test_123.mp3", "sound42.mp3"];
            const getPlayingSoundKeysMock = jest.fn().mockReturnValue(playingSoundKeys);
            const pauseSoundMock = jest.fn();
            levelQueue.currentEngines!.soundEngine.getPlayingSoundKeys = getPlayingSoundKeysMock;
            levelQueue.currentEngines!.soundEngine.pauseSound = pauseSoundMock;

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 70);

            expect(getPlayingSoundKeysMock).not.toHaveBeenCalled();

            manager.toggleGamePause();

            expect(getPlayingSoundKeysMock).toHaveBeenCalledTimes(1);
            expect(pauseSoundMock).toHaveBeenCalledTimes(playingSoundKeys.length);
            playingSoundKeys.forEach(key => expect(pauseSoundMock).toHaveBeenCalledWith(key));
        });

        it("should play the sounds that were originaly playing before the pause, when toggling to active", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler);

            // These are the playing sound keys we expect the playSound to be called with
            const playingSoundKeys = ["sound1.mp3", "sount_test_123.mp3", "sound42.mp3"];
            const getPlayingSoundKeysMock = jest.fn().mockReturnValue(playingSoundKeys);
            const playSoundMock = jest.fn();
            levelQueue.currentEngines!.soundEngine.getPlayingSoundKeys = getPlayingSoundKeysMock;
            levelQueue.currentEngines!.soundEngine.playSound = playSoundMock;

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 70);

            manager.toggleGamePause(); // toggle to pre-paused
            expect(playSoundMock).not.toHaveBeenCalled();

            manager.toggleGamePause(); // toggle back to active

            expect(getPlayingSoundKeysMock).toHaveBeenCalledTimes(1);
            expect(playSoundMock).toHaveBeenCalledTimes(playingSoundKeys.length);
            playingSoundKeys.forEach(key => expect(playSoundMock).toHaveBeenCalledWith(key));
        });
    });

    describe("runFrame", () => {
        const setManagerToGivenNonActiveStatus = (manager:IGameLoopManager, status:GameLoopStatus, advanceTimeBy = 1000) => {
            const pausedStatuses = [GameLoopStatus.PrePaused, GameLoopStatus.Paused];

            if(manager.status === status || status === GameLoopStatus.Active)
                return;

            if(pausedStatuses.includes(status))
                manager.toggleGamePause(); // sets the manager to pre-paused
            
            if(status === GameLoopStatus.Paused) {
                jest.advanceTimersByTime(advanceTimeBy);
                manager.runFrame(); // if pre-paused, sets to paused
            }
        };

        it.each([
            [10],
            [60],
            [120]
        ])("should not run the frame if the game would be over the maximum fps limit", (fpsLimit:number) => {
            const assetHandler = new AssetHandler(jest.fn());

            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, fpsLimit);
            levelQueue.prepareCurrentLevelAndModels();

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), fpsLimit);

            manager.runFrame(); // Initial frame

            const gameEngineRun = jest.fn();
            const graphicEngineRun = jest.fn();
            levelQueue.currentEngines!.gameEngine.run = gameEngineRun;
            levelQueue.currentEngines!.graphicEngine.run = graphicEngineRun;

            // We want to move the timer multiple times, and check the engines haven't been called each time.
            // The internal property that stores the previous frame time should not be updated unless the frame
            // actually runs, so bear that in mind when trying to understand this
            const maxMsPerFrame = 1000 / fpsLimit;
            for(let i = 1; i < maxMsPerFrame; i++) {
                jest.advanceTimersByTime(1);

                manager.runFrame();

                expect(gameEngineRun).not.toHaveBeenCalled();
                expect(graphicEngineRun).not.toHaveBeenCalled();
            }

            // should now run
            jest.advanceTimersByTime(1);
            manager.runFrame();
            expect(gameEngineRun).toHaveBeenCalledTimes(1);
            expect(graphicEngineRun).toHaveBeenCalledTimes(1);
        });

        it("should not run the frame if the current level is not prepared and still has assets loading", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);

            manager.runFrame(); // initial run

            const gameEngineRun = jest.fn();
            const graphicEngineRun = jest.fn();
            const levelPrepare = jest.fn();
            levelQueue.currentEngines!.gameEngine.run = gameEngineRun;
            levelQueue.currentEngines!.graphicEngine.run = graphicEngineRun;
            levelQueue.prepareCurrentLevelAndModels = levelPrepare;

            Object.defineProperty(assetHandler, "assetsStillLoading", {
                value: 1,
                configurable: true
            });

            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(gameEngineRun).not.toHaveBeenCalled();
            expect(graphicEngineRun).not.toHaveBeenCalled();
            expect(levelPrepare).not.toHaveBeenCalled();
            
            // Should run if assets loading is 0
            Object.defineProperty(assetHandler, "assetsStillLoading", {
                value: 0
            });

            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(gameEngineRun).toHaveBeenCalledTimes(1);
            expect(graphicEngineRun).toHaveBeenCalledTimes(1);
            expect(levelPrepare).toHaveBeenCalledTimes(1);
        });

        it("should not update the fps value if a frame did not run", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);

            manager.runFrame(); // initial run
            const initialFps = manager.fps;

            // Stops the frame from running
            Object.defineProperty(assetHandler, "assetsStillLoading", {
                value: 1
            });

            jest.advanceTimersByTime(100);
            manager.runFrame();
            expect(manager.fps).toBe(initialFps);

            jest.advanceTimersByTime(200);
            manager.runFrame();
            expect(manager.fps).toBe(initialFps);
        });

        it("should run the frame if the current level is prepared, even if assets are loading", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);

            levelQueue.prepareCurrentLevelAndModels();
            Object.defineProperty(assetHandler, "assetsStillLoading", {
                value: 1,
                configurable: true
            });

            const gameEngineRun = jest.fn();
            const graphicEngineRun = jest.fn();
            levelQueue.currentEngines!.gameEngine.run = gameEngineRun;
            levelQueue.currentEngines!.graphicEngine.run = graphicEngineRun;

            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(gameEngineRun).toHaveBeenCalledTimes(1);
            expect(graphicEngineRun).toHaveBeenCalledTimes(1);
        });

        it.each([
            [GameLoopStatus.Active],
            [GameLoopStatus.Paused],
            [GameLoopStatus.PrePaused]
        ])("should reset the manager for a new level's start, if level not prepared", (status:GameLoopStatus) => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const canvas = document.createElement("canvas");
            const level = new Level(
                new FrameManager(),
                new ModelEventManager(),
                new PointerEventManager(canvas),
                new KeyboardEventManager()
            );
            levelQueue.loadLevel(level, createSettingsObject(10), canvas.getContext("2d")!, jest.fn());

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);

            levelQueue.prepareCurrentLevelAndModels(); // prepare the initial level, so we can confirm the initial values
            jest.advanceTimersByTime(100);
            manager.runFrame();

            setManagerToGivenNonActiveStatus(manager, status);

            // Initial values
            expect(manager.status).toBe(status);
            expect(manager.totalLevelActiveMilliseconds).not.toBe(0);

            // Next level is not prepared
            const level2 = new Level(
                new FrameManager(),
                new ModelEventManager(),
                new PointerEventManager(canvas),
                new KeyboardEventManager()
            );
            levelQueue.loadLevel(level2, createSettingsObject(10), canvas.getContext("2d")!, jest.fn());
            levelQueue.unloadCurrentLevel();

            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(manager.status).toBe(GameLoopStatus.Active);
            expect(manager.totalLevelActiveMilliseconds).toBe(100); // This includes the time for this frame, but shouldn't include the previous frame time
        });

        it.each([
            [GameLoopStatus.Active],
            [GameLoopStatus.Paused],
            [GameLoopStatus.PrePaused]
        ])("should call the prepareCurrentLevelAndModels LevelQueue method, if level is not prepared", (status:GameLoopStatus) => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);
            setManagerToGivenNonActiveStatus(manager, status);

            // If setting manager to paused state, a frame is ran, so the level would get
            // marked as prepared
            levelQueue.markCurrentLevelAsUnprepared();
            levelQueue.unloadCurrentLevel();
            levelQueue.prepareCurrentLevelAndModels = jest.fn();

            jest.advanceTimersByTime(1000);
            manager.runFrame();

            expect(levelQueue.prepareCurrentLevelAndModels).toHaveBeenCalledTimes(1);
        });

        it.each([
            [GameLoopStatus.Active],
            [GameLoopStatus.Paused],
            [GameLoopStatus.PrePaused]
        ])("should update fps on every ran frame", (status:GameLoopStatus) => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);

            jest.advanceTimersByTime(100);
            manager.runFrame();

            setManagerToGivenNonActiveStatus(manager, status);

            jest.advanceTimersByTime(100);
            manager.runFrame(); // If the status was set to pre-paused, future calls should be paused
            expect(manager.fps).toBe(10);

            jest.advanceTimersByTime(200);
            manager.runFrame();
            expect(manager.fps).toBe(5);

            jest.advanceTimersByTime(500);
            manager.runFrame();
            expect(manager.fps).toBe(2);
        });

        it("should update totalLevelActiveMilliseconds on every frame, if game is active", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);

            jest.advanceTimersByTime(100);
            manager.runFrame();
            expect(manager.totalLevelActiveMilliseconds).toBe(100);

            jest.advanceTimersByTime(200);
            manager.runFrame();
            expect(manager.totalLevelActiveMilliseconds).toBe(300);

            jest.advanceTimersByTime(400);
            manager.runFrame();
            expect(manager.totalLevelActiveMilliseconds).toBe(700);
        });

        it.each([
            [GameLoopStatus.Paused],
            [GameLoopStatus.PrePaused]
        ])("should not update totalLevelActiveMilliseconds on frame run, if game is not active", (status:GameLoopStatus) => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);
            levelQueue.prepareCurrentLevelAndModels();

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);
            setManagerToGivenNonActiveStatus(manager, status);
            expect(manager.status).toBe(status);

            jest.advanceTimersByTime(100);
            manager.runFrame(); // If the status was set to pre-paused, future calls should be paused
            expect(manager.totalLevelActiveMilliseconds).toBe(0);

            jest.advanceTimersByTime(200);
            manager.runFrame();
            expect(manager.totalLevelActiveMilliseconds).toBe(0);

            jest.advanceTimersByTime(500);
            manager.runFrame();
            expect(manager.totalLevelActiveMilliseconds).toBe(0);
        });

        it("should not change totalLevelActiveMilliseconds on frame run, if no time has passed", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);
            levelQueue.prepareCurrentLevelAndModels();

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);

            manager.runFrame(); // Calling without moving the time forward
            
            expect(manager.totalLevelActiveMilliseconds).toBe(0);
        });

        it("should run the GameEngine and GraphicEngine run methods if game is active", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);
            levelQueue.prepareCurrentLevelAndModels();

            const gameEngineRun = jest.fn();
            const graphicEngineRun = jest.fn();
            levelQueue.currentEngines!.gameEngine.run = gameEngineRun;
            levelQueue.currentEngines!.graphicEngine.run = graphicEngineRun;

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);

            jest.advanceTimersByTime(100);
            manager.runFrame();
            expect(gameEngineRun).toHaveBeenCalledTimes(1);
            expect(graphicEngineRun).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(100);
            manager.runFrame();
            expect(gameEngineRun).toHaveBeenCalledTimes(2);
            expect(graphicEngineRun).toHaveBeenCalledTimes(2);
        });

        it("should not run the GameEngine and GraphicEngine run methods, if the game is paused", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);
            levelQueue.prepareCurrentLevelAndModels();

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);
            setManagerToGivenNonActiveStatus(manager, GameLoopStatus.Paused);

            const gameEngineRun = jest.fn();
            const graphicEngineRun = jest.fn();
            levelQueue.currentEngines!.gameEngine.run = gameEngineRun;
            levelQueue.currentEngines!.graphicEngine.run = graphicEngineRun;

            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(gameEngineRun).not.toHaveBeenCalled();
            expect(graphicEngineRun).not.toHaveBeenCalled();
        });

        it("should pass the correct parameters to the GraphicEngine run method", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            Object.defineProperty(levelQueue, "currentModels", {
                value: [new Model(new ModelAnimationsManager())]
            });
            levelQueue.prepareCurrentLevelAndModels();

            const fpsDisplayColor = "#ff0099";
            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10, fpsDisplayColor);

            const graphicEngineRun = jest.fn();
            levelQueue.currentEngines!.graphicEngine.run = graphicEngineRun;

            jest.advanceTimersByTime(100);
            manager.runFrame();
            expect(graphicEngineRun).toHaveBeenCalledTimes(1);
            expect(graphicEngineRun).toHaveBeenLastCalledWith(
                levelQueue.currentLevel,
                levelQueue.currentModels,
                manager.fps,
                fpsDisplayColor
            );

            jest.advanceTimersByTime(200);
            manager.runFrame();
            expect(graphicEngineRun).toHaveBeenCalledTimes(2);
            expect(graphicEngineRun).toHaveBeenLastCalledWith(
                levelQueue.currentLevel,
                levelQueue.currentModels,
                manager.fps,
                fpsDisplayColor
            );

            jest.advanceTimersByTime(300);
            manager.runFrame();
            expect(graphicEngineRun).toHaveBeenCalledTimes(3);
            expect(graphicEngineRun).toHaveBeenLastCalledWith(
                levelQueue.currentLevel,
                levelQueue.currentModels,
                manager.fps,
                fpsDisplayColor
            );
        });

        it("should call the GraphicEngine run method, even if game is pre-paused", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);
            setManagerToGivenNonActiveStatus(manager, GameLoopStatus.PrePaused);

            const graphicEngineRun = jest.fn();
            levelQueue.currentEngines!.graphicEngine.run = graphicEngineRun;

            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(graphicEngineRun).toHaveBeenCalledTimes(1);
        });

        it("should not call the GameEngine run method, if the game is pre-paused", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);
            levelQueue.prepareCurrentLevelAndModels();

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);
            setManagerToGivenNonActiveStatus(manager, GameLoopStatus.PrePaused);

            const gameEngineRun = jest.fn();
            levelQueue.currentEngines!.gameEngine.run = gameEngineRun;

            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(gameEngineRun).not.toHaveBeenCalled();
        });

        it("should change the status to paused, if the current status is pre-paused", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);
            levelQueue.prepareCurrentLevelAndModels();

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);
            setManagerToGivenNonActiveStatus(manager, GameLoopStatus.PrePaused);

            expect(manager.status).toBe(GameLoopStatus.PrePaused);

            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(manager.status).toBe(GameLoopStatus.Paused);
        });

        it.each([
            [GameLoopStatus.Active],
            [GameLoopStatus.Paused],
            [GameLoopStatus.PrePaused]
        ])("should call the checkForHoverEvents method on the level, regardless of the game status", (status:GameLoopStatus) => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);
            levelQueue.prepareCurrentLevelAndModels();

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);
            setManagerToGivenNonActiveStatus(manager, status);

            const eventCheck = jest.fn();
            levelQueue.currentLevel!.checkForHoverEvents = eventCheck;

            jest.advanceTimersByTime(100);
            manager.runFrame();
            expect(eventCheck).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(100);
            manager.runFrame();
            expect(eventCheck).toHaveBeenCalledTimes(2);
        });

        it("should call the given error callback with an error that is thrown while preparing the level", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const errorHandler = jest.fn();
            const manager = new GameLoopManager(levelQueue, assetHandler, errorHandler, 10);

            const mockError = new Error("test error 123");
            const levelPrepare = jest.fn().mockImplementation(() => {throw mockError});
            levelQueue.prepareCurrentLevelAndModels = levelPrepare;

            jest.advanceTimersByTime(100);
            manager.runFrame();
            
            expect(errorHandler).toHaveBeenCalledTimes(1);
            expect(errorHandler).toHaveBeenCalledWith(mockError);
        });

        it("should call the given error callback with an error that is thrown while running the GameEngine run method", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const errorHandler = jest.fn();
            const manager = new GameLoopManager(levelQueue, assetHandler, errorHandler, 10);

            const mockError = new Error("test error 123");
            const gameEngineRun = jest.fn().mockImplementation(() => {throw mockError});
            levelQueue.currentEngines!.gameEngine.run = gameEngineRun;

            jest.advanceTimersByTime(100);
            manager.runFrame();
            
            expect(errorHandler).toHaveBeenCalledTimes(1);
            expect(errorHandler).toHaveBeenCalledWith(mockError);
        });

        it("should call the given error callback with an error that is thrown while running the GraphicEngine run method", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const errorHandler = jest.fn();
            const manager = new GameLoopManager(levelQueue, assetHandler, errorHandler, 10);

            const mockError = new Error("test error 123");
            const graphicEngineRun = jest.fn().mockImplementation(() => {throw mockError});
            levelQueue.currentEngines!.graphicEngine.run = graphicEngineRun;

            jest.advanceTimersByTime(100);
            manager.runFrame();
            
            expect(errorHandler).toHaveBeenCalledTimes(1);
            expect(errorHandler).toHaveBeenCalledWith(mockError);
        });

        it("should call the given error callback with an error that is thrown while running the level's checkForHoverEvents method", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const errorHandler = jest.fn();
            const manager = new GameLoopManager(levelQueue, assetHandler, errorHandler, 10);

            const mockError = new Error("test error 123");
            const eventCheck = jest.fn().mockImplementation(() => {throw mockError});
            levelQueue.currentLevel!.checkForHoverEvents = eventCheck;

            jest.advanceTimersByTime(100);
            manager.runFrame();
            
            expect(errorHandler).toHaveBeenCalledTimes(1);
            expect(errorHandler).toHaveBeenCalledWith(mockError);
        });

        it("should run each action in the loop in the correct order", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);

            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);
            setManagerToGivenNonActiveStatus(manager, GameLoopStatus.Paused);
            levelQueue.markCurrentLevelAsUnprepared();

            // This array will hold the names of the called methods. If the array values are in
            // the correct order, then the methods were called in the expected order
            const calledMethodNames:string[] = [];

            // We want to ensure the manager's state is reset (for the starting of a new level)
            // before the prepare method is called, so we're going to capture some of the manager's
            // state during the call
            let statusWhenPreparing:GameLoopStatus;
            let activeMillisecondsWhenPreparing:number;
            levelQueue.prepareCurrentLevelAndModels = jest.fn().mockImplementation(() => {
                calledMethodNames.push("prepareCurrentLevelAndModels");

                statusWhenPreparing = manager.status;
                activeMillisecondsWhenPreparing = manager.totalLevelActiveMilliseconds;

                // Bit of a hack, but we're going to change the status mid-way through, to
                // ensure it is pre-paused (which means we can confirm it gets switched
                // to paused at the right time)
                manager.toggleGamePause();
            });

            let statusWhenRunningGraphicEngine:GameLoopStatus;
            levelQueue.currentEngines!.graphicEngine.run = jest.fn().mockImplementation(() => {
                calledMethodNames.push("GraphicEngine.run");
                statusWhenRunningGraphicEngine = manager.status;
            });

            let statusWhenCheckingHoverEvents:GameLoopStatus;
            levelQueue.currentLevel!.checkForHoverEvents = jest.fn().mockImplementation(() => {
                calledMethodNames.push("checkForHoverEvents");
                statusWhenCheckingHoverEvents = manager.status;
            });

            // Now run the frame, to capture all the data/calls
            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(calledMethodNames.length).toBe(3);

            // The state of the manager should be reset (ready for a new level) before the level is prepared
            expect(calledMethodNames[0]).toBe("prepareCurrentLevelAndModels");
            expect(statusWhenPreparing!).toBe(GameLoopStatus.Active);
            expect(activeMillisecondsWhenPreparing!).toBe(0);

            // The game engine should not be called, as the status is pre-paused (another test checks these 2).
            // When the graphic engine was called, the status should still have been pre-paused
            expect(calledMethodNames[1]).toBe("GraphicEngine.run");
            expect(statusWhenRunningGraphicEngine!).toBe(GameLoopStatus.PrePaused);

            // The status should have been changed to paused before the hover-event check
            expect(calledMethodNames[2]).toBe("checkForHoverEvents");
            expect(statusWhenCheckingHoverEvents!).toBe(GameLoopStatus.Paused);
        });

        it("should run the GameEngine run method before the GraphicEngine run method", () => {
            const assetHandler = new AssetHandler(jest.fn());
            const levelQueue = createLevelQueueWithLoadedLevel(assetHandler, 10);
            const manager = new GameLoopManager(levelQueue, assetHandler, jest.fn(), 10);

            // This array will hold the names of the called methods. If the array values are in
            // the correct order, then the methods were called in the expected order
            const calledMethodNames:string[] = [];
            levelQueue.currentEngines!.gameEngine.run = jest.fn().mockImplementation(() => calledMethodNames.push("GameEngine.run"));
            levelQueue.currentEngines!.graphicEngine.run = jest.fn().mockImplementation(() => calledMethodNames.push("GraphicEngine.run"));

            jest.advanceTimersByTime(100);
            manager.runFrame();

            expect(calledMethodNames.length).toBe(2);
            expect(calledMethodNames[0]).toBe("GameEngine.run");
            expect(calledMethodNames[1]).toBe("GraphicEngine.run");
        });
    });
});