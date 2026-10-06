import AssetHandler from "../../AssetHandler/AssetHandler";
import FrameManager from "../../engines/GraphicEngine/FrameManager";
import IFrameManager from "../../engines/GraphicEngine/IFrameManager";
import SoundEngine from "../../engines/SoundEngine/SoundEngine";
import HUD from "../HUD/HUD";
import IHUD from "../HUD/IHUD";
import Model from "../Model/Model";
import ModelAnimationsManager from "../Model/ModelAnimationsManager/ModelAnimationsManager";
import { IEntitySound } from "../types";
import IKeyboardEventManager from "./IKeyboardEventManager";
import IModelEventManager from "./IModelEventManager";
import IPointerEventManager from "./IPointerEventManager";
import KeyboardEventManager from "./KeyboardEventManager";
import Level from "./Level";
import ModelEventManager from "./ModelEventManager";
import PointerEventManager from "./PointerEventManager";

describe("Level", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should set correct defaults in constructor for public and protected properties", () => {
        // We're going to create a child of the Level class, and use
        // its constructor to capture the set values
        let capturedFrameManager:IFrameManager;
        let capturedHUD:IHUD;
        let capturedModelEventManager:IModelEventManager;
        let capturedPointerEventManager:IPointerEventManager;
        let capturedKeyboardEventManager:IKeyboardEventManager;
        let capturedAssetsToUnload:string[];
        let capturedSounds:IEntitySound[];
        let capturedIsPausable:boolean;

        // Now we create and initialise a child Level, to capture the 
        class TestLevel extends Level {
            constructor(
                frameManager:IFrameManager,
                modelEventManager:IModelEventManager,
                pointerEventManager:IPointerEventManager,
                keyboardEventManager:IKeyboardEventManager
            ) {
                super(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

                capturedFrameManager = this.frameManager;
                capturedHUD = this.HUD;
                capturedModelEventManager = this.modelEventManager;
                capturedPointerEventManager = this.pointerEventManager;
                capturedKeyboardEventManager = this.keyboardEventManager;
                capturedAssetsToUnload = this.assetsToUnload;
                capturedSounds = this.sounds;
                capturedIsPausable = this.isPauseable;
            }
        };

        const canvas = document.createElement("canvas");
        const frameManager = new FrameManager();
        const modelEventManager = new ModelEventManager();
        const pointerEventManager = new PointerEventManager(canvas);
        const keyboardEventManager = new KeyboardEventManager();

        const testLevel = new TestLevel(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

        expect(capturedFrameManager!).toBe(frameManager);
        expect(capturedHUD!).toBeDefined();
        expect(capturedModelEventManager!).toBe(modelEventManager);
        expect(capturedPointerEventManager!).toBe(pointerEventManager);
        expect(capturedKeyboardEventManager!).toBe(keyboardEventManager);
        expect(capturedAssetsToUnload!.length).toBe(0);
        expect(capturedSounds!.length).toBe(0);
        expect(capturedIsPausable!).toBe(true);

        // The HUD of the level is passed the PointerEventManager in
        // its constructor. It doesn't explicitly use this property, so
        // we'll have to dig into the object to check it's correct
        const hud = testLevel.HUD as any;
        expect(hud.pointerEventManager).toBe(pointerEventManager);
    });

    it("should correctly set/get public properties", () => {
        const canvas = document.createElement("canvas");
        const frameManager = new FrameManager();
        const modelEventManager = new ModelEventManager();
        const pointerEventManager = new PointerEventManager(canvas);
        const keyboardEventManager = new KeyboardEventManager();

        const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

        level.isPauseable = false;
        expect(level.isPauseable).toBe(false);
        level.isPauseable = true;
        expect(level.isPauseable).toBe(true);

        expect(level.HUD).toBeDefined();
        expect(level.frameManager).toBe(frameManager);
    });

    it("should correctly set properties with protected setters", () => {
        class TestLevel extends Level {
            setHUD(hud:IHUD) {
                this.HUD = hud;
            }

            setFrameManager(manager:IFrameManager) {
                this.frameManager = manager;
            }
        };

        const canvas = document.createElement("canvas");
        const frameManager = new FrameManager();
        const modelEventManager = new ModelEventManager();
        const pointerEventManager = new PointerEventManager(canvas);
        const keyboardEventManager = new KeyboardEventManager();

        const testLevel = new TestLevel(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

        const newHUD = new HUD(new PointerEventManager(canvas));
        testLevel.setHUD(newHUD);
        const newFrameManager = new FrameManager();
        testLevel.setFrameManager(newFrameManager);

        expect(testLevel.HUD).toBe(newHUD);
        expect(testLevel.frameManager).toBe(newFrameManager);
    });

    describe("load", () => {
        it("should call the load and loadComponents methods on the HUD", () => {
            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();

            const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            level.HUD.load = jest.fn();
            level.HUD.loadComponents = jest.fn();

            const assetHandler = new AssetHandler(jest.fn());

            level.load(assetHandler);

            expect(level.HUD.load).toHaveBeenCalledTimes(1);
            expect(level.HUD.load).toHaveBeenCalledWith(assetHandler);
            expect(level.HUD.loadComponents).toHaveBeenCalledTimes(1);
            expect(level.HUD.loadComponents).toHaveBeenCalledWith(assetHandler);
        });
    });

    describe("registerSounds", () => {
        it("should add every registered sound to the SoundEngine", () => {
            const sounds:IEntitySound[] = [
                {
                    key: "test1.mp3",
                    asset: new Audio("test1.mp3")
                },
                {
                    key: "test2.mp3",
                    asset: new Audio("test2.mp3")
                },
                {
                    key: "test3.mp3",
                    asset: new Audio("test3.mp3")
                },
            ];

            class TestLevel extends Level {
                constructor(
                    frameManager:IFrameManager,
                    modelEventManager:IModelEventManager,
                    pointerEventManager:IPointerEventManager,
                    keyboardEventManager:IKeyboardEventManager
                ) {
                    super(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);
                    this.sounds = sounds;
                }
            };

            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();
            const testLevel = new TestLevel(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            const soundEngine = new SoundEngine(jest.fn());
            soundEngine.addSound = jest.fn();

            testLevel.registerSounds(soundEngine);

            expect(soundEngine.addSound).toHaveBeenCalledTimes(sounds.length);
            sounds.forEach(sound => expect(soundEngine.addSound).toHaveBeenCalledWith(sound.key, sound.asset));
        });

        it("should call the registerSounds method on the HUD", () => {
            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();
            const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            const soundEngine = new SoundEngine(jest.fn());
            soundEngine.addSound = jest.fn();

            level.HUD.registerSounds = jest.fn();

            level.registerSounds(soundEngine);

            expect(level.HUD.registerSounds).toHaveBeenCalledTimes(1);
            expect(level.HUD.registerSounds).toHaveBeenCalledWith(soundEngine);
        });
    });

    describe("unload", () => {
        it("should call the AssetHandler's releaseAsset method for every asset in the protected assetsToUnload array", () => {
            const assetsToUnload = ["asset1.png", "asset2.png", "asset3.png"];

            class TestLevel extends Level {
                constructor(
                    frameManager:IFrameManager,
                    modelEventManager:IModelEventManager,
                    pointerEventManager:IPointerEventManager,
                    keyboardEventManager:IKeyboardEventManager
                ) {
                    super(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);
                    this.assetsToUnload = assetsToUnload;
                }
            };

            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();
            const testLevel = new TestLevel(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            const assetHandler = new AssetHandler(jest.fn());
            assetHandler.releaseAsset = jest.fn();

            testLevel.unload(assetHandler);

            expect(assetHandler.releaseAsset).toHaveBeenCalledTimes(assetsToUnload.length);
            assetsToUnload.forEach(asset => expect(assetHandler.releaseAsset).toHaveBeenCalledWith(asset));
        });

        it("should call the removeEventHandlers methods on the pointer and keyboard event managers", () => {
            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();

            pointerEventManager.removeEventHandlers = jest.fn();
            keyboardEventManager.removeEventHandlers = jest.fn();

            const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            const assetHandler = new AssetHandler(jest.fn());
            level.unload(assetHandler);

            expect(pointerEventManager.removeEventHandlers).toHaveBeenCalledTimes(1);
            expect(keyboardEventManager.removeEventHandlers).toHaveBeenCalledTimes(1);
        });

        it("should call the unload method on the HUD", () => {
            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();

            const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            level.HUD.unload = jest.fn();

            const assetHandler = new AssetHandler(jest.fn());
            level.unload(assetHandler);

            expect(level.HUD.unload).toHaveBeenCalledTimes(1);
            expect(level.HUD.unload).toHaveBeenCalledWith(assetHandler);
        });
    });

    describe("prepare", () => {
        it("should call the necesary clear methods on the event managers", () => {
            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();

            pointerEventManager.removePointerEventSubjects = jest.fn();
            keyboardEventManager.removeKeyboardEventCallbacks = jest.fn();
            modelEventManager.clearEvents = jest.fn();

            const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            level.prepare();

            expect(pointerEventManager.removePointerEventSubjects).toHaveBeenCalledTimes(1);
            expect(keyboardEventManager.removeKeyboardEventCallbacks).toHaveBeenCalledTimes(1);
            expect(modelEventManager.clearEvents).toHaveBeenCalledTimes(1);
        });

        it("should call the protected registerLevelEvents method", () => {
            const registerLevelEventsHandler = jest.fn();

            class TestLevel extends Level {
                protected registerLevelEvents(): void {
                    registerLevelEventsHandler();
                }
            };

            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();

            const testLevel = new TestLevel(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);
            expect(registerLevelEventsHandler).not.toHaveBeenCalled();

            testLevel.prepare();

            expect(registerLevelEventsHandler).toHaveBeenCalledTimes(1);
        });

        it("should call the prepare method on the HUD", () => {
            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();

            const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            level.HUD.prepare = jest.fn();

            level.prepare();

            expect(level.HUD.prepare).toHaveBeenCalledTimes(1);
        });
    });

    describe("checkForModelEvents", () => {
        const createModel = () => new Model(new ModelAnimationsManager());

        it("should call the checkForEvents method on the ModelEventManager", () => {
            const models = [
                createModel(),
                createModel(),
                createModel(),
            ];

            // Adding some unique settings to the models, otherwise
            // an array with different models is considered equal
            // to this array
            models[0].x = 5;
            models[1].x = 10;
            models[2].x = 15;

            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();

            modelEventManager.checkForEvents = jest.fn();

            const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            level.checkForModelEvents(models);

            expect(modelEventManager.checkForEvents).toHaveBeenCalledTimes(1);
            expect(modelEventManager.checkForEvents).toHaveBeenCalledWith(models);
        });
    });

    describe("checkForHoverEvents", () => {
        it("should call the checkForHoverEvents method on the PointerEventManager", () => {
            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();
            
            pointerEventManager.checkForHoverEvents = jest.fn();

            const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);
            expect(pointerEventManager.checkForHoverEvents).not.toHaveBeenCalled();

            level.checkForHoverEvents();

            expect(pointerEventManager.checkForHoverEvents).toHaveBeenCalledTimes(1);
        });
    });

    describe("getModels", () => {
        it("should return an empty array", () => {
            const canvas = document.createElement("canvas");
            const frameManager = new FrameManager();
            const modelEventManager = new ModelEventManager();
            const pointerEventManager = new PointerEventManager(canvas);
            const keyboardEventManager = new KeyboardEventManager();

            const level = new Level(frameManager, modelEventManager, pointerEventManager, keyboardEventManager);

            const results = level.getModels();

            expect(results.length).toBe(0);
        });
    });
});