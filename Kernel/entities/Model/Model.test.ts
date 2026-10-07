import AssetHandler from "../../AssetHandler/AssetHandler";
import Camera from "../../engines/GraphicEngine/Camera";
import FrameManager from "../../engines/GraphicEngine/FrameManager";
import GraphicEngine from "../../engines/GraphicEngine/GraphicEngine";
import IGraphicEngine from "../../engines/GraphicEngine/IGraphicEngine";
import SoundEngine from "../../engines/SoundEngine/SoundEngine";
import UnitHelper from "../../utils/UnitHelper";
import { IEntitySound } from "../types";
import { IHitBox } from "./IModel";
import Model from "./Model";
import IModelAnimationsManager from "./ModelAnimationsManager/IModelAnimationsManager";
import ModelAnimationsManager from "./ModelAnimationsManager/ModelAnimationsManager";

describe("Model", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should set the correct default values for properties in the constructor", () => {
        let capturedAnimationManager:IModelAnimationsManager;
        let capturedAssetsToUnload:string[];
        let capturedSounds:IEntitySound[];
        let capturedState:string;

        class TestModel extends Model {
            constructor(modelAnimationsManager:IModelAnimationsManager) {
                super(modelAnimationsManager);
                capturedAnimationManager = this.animationManager;
                capturedAssetsToUnload = this.assetsToUnload;
                capturedSounds = this.sounds;
                capturedState = this.state;
            }
        };

        const animManager = new ModelAnimationsManager();
        const testModel = new TestModel(animManager);

        expect(capturedAnimationManager!).toBe(animManager);
        expect(capturedAssetsToUnload!.length).toBe(0);
        expect(capturedSounds!.length).toBe(0);
        expect(capturedState!).toBe("");

        expect(testModel.x).toBe(0);
        expect(testModel.y).toBe(0);
        expect(testModel.z).toBe(0);
        expect(testModel.xSpeed).toBe(0);
        expect(testModel.ySpeed).toBe(0);
        expect(testModel.zSpeed).toBe(0);
        expect(testModel.active).toBe(false);
        expect(testModel.display).toBe(true);
    });

    it("should get the width/height of the model from the ModelAnimationManager, based on the model's current state", () => {
        const expectedWidth = 120;
        const expectedHeight = 230;

        const animManager = new ModelAnimationsManager();
        const animation = animManager.createAnimation({
            spritesheet: new Image(10, 10),
            fps: 25,
            drawWidth: expectedWidth,
            drawHeight: expectedHeight,
            frameCoordinates: []
        });

        const expectedState = "test-state";
        animManager.registerAnimations({
            [expectedState]: animation
        });

        const model = new Model(animManager);

        // Should initially be undefined, if state doesn't have an associated animation
        expect(model.width).toBeUndefined();
        expect(model.height).toBeUndefined();

        model.state = expectedState;
        expect(model.width).toBe(expectedWidth);
        expect(model.height).toBe(expectedHeight);
    });

    it("should get the precalculated positions/dimensions from the ModelAnimationManager", () => {
        const expectedX = 12;
        const expectedY = 13;
        const expectedWidth = 32;
        const expectedHeight = 26;

        const animManager = new ModelAnimationsManager();
        Object.defineProperties(animManager, {
            calculatedDrawPositions: {
                value: {
                    x: expectedX,
                    y: expectedY
                }
            },
            calculatedDrawDimensions: {
                value: {
                    width: expectedWidth,
                    height: expectedHeight
                }
            }
        });

        const model = new Model(animManager);

        const { x, y } = model.calculatedDrawPositions;
        const { width, height } = model.calculatedDrawDimensions;

        expect(x).toBe(expectedX);
        expect(y).toBe(expectedY);
        expect(width).toBe(expectedWidth);
        expect(height).toBe(expectedHeight);
    });

    it("should change the X/Y when state is changed, to add the animation offsets for that state", () => {
        const initialX = 1;
        const initialY = 2;
        const xOffset = 10;
        const yOffset = 20;
        const expectedX = initialX + xOffset;
        const expectedY = initialY + yOffset;
        
        const animManager = new ModelAnimationsManager();
        const animation = animManager.createAnimation({
            spritesheet: new Image(10, 10),
            fps: 25,
            drawWidth: 100,
            drawHeight: 100,
            frameCoordinates: [],
            xOffset: xOffset,
            yOffset: yOffset
        });

        const expectedState = "test-state";
        animManager.registerAnimations({
            [expectedState]: animation
        });

        const model = new Model(animManager);
        model.x = initialX;
        model.y = initialY;

        // Now change the state, to trigger the offset changes
        model.state = expectedState;
        expect(model.state).toBe(expectedState);
        expect(model.x).toBe(expectedX);
        expect(model.y).toBe(expectedY);
    });

    describe("registerSounds", () => {
        it("should register all of the Model's sounds with the SoundEngine", () => {
            const sounds:IEntitySound[] = [
                {
                    key: "sound1.mp3",
                    asset: new Audio("sound1.mp3")
                },
                {
                    key: "sound2.mp3",
                    asset: new Audio("sound2.mp3")
                },
                {
                    key: "sound3.mp3",
                    asset: new Audio("sound3.mp3")
                }
            ];

            class TestModel extends Model {
                constructor(modelAnimationsManager:IModelAnimationsManager) {
                    super(modelAnimationsManager);
                    this.sounds = sounds;
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            const soundEngine = new SoundEngine(jest.fn());
            soundEngine.addSound = jest.fn();

            testModel.registerSounds(soundEngine);

            expect(soundEngine.addSound).toHaveBeenCalledTimes(sounds.length);
            sounds.forEach(sound => expect(soundEngine.addSound).toHaveBeenCalledWith(sound.key, sound.asset));
        });
    });

    describe("prepare", () => {
        it("should clear, and re-register, all animations", () => {
            const animManager = new ModelAnimationsManager();
            const model = new Model(animManager);

            // We're going to capture the order that these methods were called in,
            // by adding method names to this array. If the names are in order, the calls
            // were made in order
            const capturedMethodCalls:string[] = [];
            animManager.clearAllAnimations = jest.fn().mockImplementation(() => capturedMethodCalls.push("clearAllAnimations"));
            model.registerAnimations = jest.fn().mockImplementation(() => capturedMethodCalls.push("registerAnimations"));

            model.prepare();

            expect(capturedMethodCalls.length).toBe(2);
            expect(capturedMethodCalls[0]).toBe("clearAllAnimations");
            expect(capturedMethodCalls[1]).toBe("registerAnimations");
        });

        it("should reset expected properties", () => {
            const model = new Model(new ModelAnimationsManager());

            model.active = true;
            model.display = false;

            model.prepare();

            expect(model.active).toBe(false);
            expect(model.display).toBe(true);
        });

        it("should reset the text object", () => {
            const model = new Model(new ModelAnimationsManager());

            model.text = {
                content: "my test content",
                x: 5,
                y: 10,
                size: 40,
                font: "Calibri",
                color: "blue",
                style: "bold",
                alignment: "right" as CanvasTextAlign,
                lineGap:5
            };

            model.prepare();

            expect(model.text.content).toBe("");
            expect(model.text.x).toBe(0);
            expect(model.text.y).toBe(0);
            expect(model.text.size).toBe(30);
            expect(model.text.font).toBe("Arial");
            expect(model.text.color).toBe("red");
            expect(model.text.style).toBe("bolder");
            expect(model.text.alignment).toBe("left");
            expect(model.text.lineGap).toBe(0);
        });
    });

    describe("unload", () => {
        it("should release every assetToUnload, using the AssetHandler", () => {
            const assetsToUnload = [
                "sound.mp3",
                "image.png",
                "sound2.mp3"
            ];

            class TestModel extends Model {
                constructor(modelAnimationsManager:IModelAnimationsManager) {
                    super(modelAnimationsManager);
                    this.assetsToUnload = assetsToUnload;
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            const assetHandler = new AssetHandler(jest.fn());
            assetHandler.releaseAsset = jest.fn();

            testModel.unload(assetHandler);

            expect(assetHandler.releaseAsset).toHaveBeenCalledTimes(assetsToUnload.length);
            assetsToUnload.forEach(asset => expect(assetHandler.releaseAsset).toHaveBeenCalledWith(asset));
        });
    });

    describe("precalculateDrawPositionsAndDimensions", () => {
        it("should call the precalculateDrawPositionsAndDimensions method on the ModelAnimationManager", () => {
            const animManager = new ModelAnimationsManager();
            const model = new Model(animManager);

            const canvas = document.createElement("canvas");
            const graphicEngine = new GraphicEngine(
                new Camera(canvas, 0, 0, 0, 0),
                new FrameManager(),
                canvas.getContext("2d")!
            );

            animManager.precalculateDrawPositionsAndDimensions = jest.fn();

            model.precalculateDrawPositionsAndDimensions(graphicEngine);

            expect(animManager.precalculateDrawPositionsAndDimensions).toHaveBeenCalledTimes(1);
            expect(animManager.precalculateDrawPositionsAndDimensions).toHaveBeenCalledWith(model, graphicEngine);
        });
    });

    describe("draw", () => {
        const createGraphicEngine = (canvas:HTMLCanvasElement):IGraphicEngine => {
            return new GraphicEngine(
                new Camera(canvas, 0, 0, 0, 0),
                new FrameManager(),
                canvas.getContext("2d")!
            );
        };

        it("should call the drawNextFrame method on the ModelAnimationManager", () => {
            const animManager = new ModelAnimationsManager();
            const model = new Model(animManager);

            animManager.drawNextFrame = jest.fn();

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const graphicEngine = createGraphicEngine(canvas);
            const fps = 23.5;
            const expectedState = "test-state-123";

            model.prepare();
            model.state = expectedState;

            model.draw(graphicEngine, context, fps);

            expect(animManager.drawNextFrame).toHaveBeenCalledTimes(1);
            expect(animManager.drawNextFrame).toHaveBeenCalledWith(expectedState, context, fps);
        });

        it("should call the drawText method on the ModelAnimationManager, if text content is set", () => {
            const animManager = new ModelAnimationsManager();
            const model = new Model(animManager);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const graphicEngine = createGraphicEngine(canvas);

            animManager.drawNextFrame = jest.fn();
            animManager.drawText = jest.fn();

            model.prepare();

            model.text.content = "test text";

            model.draw(graphicEngine, context, 60);

            expect(animManager.drawText).toHaveBeenCalledTimes(1);
            expect(animManager.drawText).toHaveBeenCalledWith(model.text, model, graphicEngine);
        });

        it("should not call the drawText method on the ModelAnimationManager, if no text content is set", () => {
            const animManager = new ModelAnimationsManager();
            const model = new Model(animManager);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const graphicEngine = createGraphicEngine(canvas);

            animManager.drawNextFrame = jest.fn();
            animManager.drawText = jest.fn();

            model.prepare();

            model.draw(graphicEngine, context, 60);

            expect(animManager.drawText).not.toHaveBeenCalled();
        });

        it("should call the drawHitBoxes method on the ModelAnimationManager, if hitBoxDrawColor property is set", () => {
            const drawColor = "purple";

            const hitBoxes = [
                {
                    x: 1,
                    y: 1,
                    z: 1,
                    width: 5,
                    height: 5
                },
                {
                    x: 1,
                    y: 2,
                    z: 3,
                    width: 4,
                    height: 5
                }
            ];

            class TestModel extends Model {
                constructor(modelAnimationsManager:IModelAnimationsManager) {
                    super(modelAnimationsManager);
                    this.hitBoxDrawColor = drawColor;
                }

                getHitBoxes():IHitBox[]
                {
                    return hitBoxes
                }
            };

            const animManager = new ModelAnimationsManager();
            const testModel = new TestModel(animManager);
            testModel.prepare();

            animManager.drawNextFrame = jest.fn();
            animManager.drawHitBoxes = jest.fn();

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const graphicEngine = createGraphicEngine(canvas);

            testModel.draw(graphicEngine, context, 60);

            expect(animManager.drawHitBoxes).toHaveBeenCalledTimes(1);
            expect(animManager.drawHitBoxes).toHaveBeenCalledWith(drawColor, hitBoxes, graphicEngine, context);
        });

        it("should not call the drawHitBoxes method on the ModelAnimationManager, if the hitBoxDrawColor property is not set", () => {
            const animManager = new ModelAnimationsManager();
            const model = new Model(animManager);
            model.prepare();

            animManager.drawNextFrame = jest.fn();
            animManager.drawHitBoxes = jest.fn();

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const graphicEngine = createGraphicEngine(canvas);

            model.draw(graphicEngine, context, 60);

            expect(animManager.drawHitBoxes).not.toHaveBeenCalled();
        });

        it("should call all of the expected methods in the correct order", () => {
            class TestModel extends Model {
                constructor(modelAnimationsManager:IModelAnimationsManager) {
                    super(modelAnimationsManager);
                    this.hitBoxDrawColor = "red";
                }
            };

            const animManager = new ModelAnimationsManager();
            const testModel = new TestModel(animManager);
            testModel.prepare();
            testModel.text.content = "test";

            // We're going to capture the names of the methods in this array, as they
            // get called. If the method names are in order, then they were called
            // in order
            const capturedMethodCalls:string[] = [];
            animManager.drawNextFrame = jest.fn().mockImplementation(() => capturedMethodCalls.push("drawNextFrame"));
            animManager.drawText = jest.fn().mockImplementation(() => capturedMethodCalls.push("drawText"));
            animManager.drawHitBoxes = jest.fn().mockImplementation(() => capturedMethodCalls.push("drawHitBoxes"));

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const graphicEngine = createGraphicEngine(canvas);

            testModel.draw(graphicEngine, context, 60);

            expect(capturedMethodCalls.length).toBe(3);
            expect(capturedMethodCalls[0]).toBe("drawNextFrame");
            expect(capturedMethodCalls[1]).toBe("drawText");
            expect(capturedMethodCalls[2]).toBe("drawHitBoxes");
        });
    });

    describe("isPointerOverlapping", () => {
        it.each([
            ["at the top", 15, 5],
            ["on the left", 2.5, 22.5],
            ["at the bottom", 17.5, 37],
            ["on the right", 25.75, 20]
        ])(
            "should return false if pointer is not overlapping the model's calculated draw positions/dimensions: %s",
            (_:string, pointX:number, pointY:number) => {
                const animManager = new ModelAnimationsManager();
                const model = new Model(animManager);
                model.state = "test";

                // We're going to set some values on the model's x/y/width/height.
                // These shouldn't be used, so we're making them a big square, so the
                // method would return true if they were used instead of the correct
                // values.
                model.x = -100;
                model.y = -100;
                const anim = animManager.createAnimation({
                    spritesheet: new Image(10, 10),
                    fps: 25,
                    drawWidth: 1000,
                    drawHeight: 1000,
                    frameCoordinates: []
                });
                animManager.registerAnimations({
                    [model.state]: anim
                });

                // These are the actual values to be used
                const calculatedDrawPositions = { x: 5, y: 10 };
                const calculatedDrawDimensions = { width: 20, height: 25 };
                Object.defineProperties(animManager, {
                    calculatedDrawPositions: {
                        value: calculatedDrawPositions
                    },
                    calculatedDrawDimensions: {
                        value: calculatedDrawDimensions
                    }
                });

                // Now run the check
                const result = model.isPointerOverlapping(pointX, pointY);

                expect(result).toBe(false);
            }
        );

        it.each([
            ["at the top", 15, 11],
            ["on the left", 6, 22.5],
            ["at the bottom", 17.5, 34],
            ["on the right", 24, 20],
            ["within the box", 17, 15],
            ["in the center", 15, 12.5]
        ])(
            "should return true if pointer is overlapping the model's calculated draw positions/dimensions: %s",
            (_:string, pointX:number, pointY:number) => {
                const animManager = new ModelAnimationsManager();
                const model = new Model(animManager);

                const calculatedDrawPositions = { x: 5, y: 10 };
                const calculatedDrawDimensions = { width: 20, height: 25 };
                Object.defineProperties(animManager, {
                    calculatedDrawPositions: {
                        value: calculatedDrawPositions
                    },
                    calculatedDrawDimensions: {
                        value: calculatedDrawDimensions
                    }
                });

                const result = model.isPointerOverlapping(pointX, pointY);

                expect(result).toBe(true);
            }
        );
    });

    describe("getHitBoxes", () => {
        it("should return single hitbox with current model position/dimension values", () => {
            const animManager = new ModelAnimationsManager();
            const model = new Model(animManager);
            model.state = "test";

            const expectedX = 101;
            const expectedY = 110;
            const expectedZ = 5;
            const expectedWidth = 45;
            const expectedHeight = 55;
            
            model.x = expectedX;
            model.y = expectedY;
            model.z = expectedZ;
            const anim = animManager.createAnimation({
                spritesheet: new Image(10, 10),
                fps: 25,
                drawWidth: expectedWidth,
                drawHeight: expectedHeight,
                frameCoordinates: []
            });
            animManager.registerAnimations({
                [model.state]: anim
            });

            const hitBoxes = model.getHitBoxes();

            expect(hitBoxes.length).toBe(1);
            const box = hitBoxes[0];

            expect(box.x).toBe(expectedX);
            expect(box.y).toBe(expectedY);
            expect(box.z).toBe(expectedZ);
            expect(box.width).toBe(expectedWidth);
            expect(box.height).toBe(expectedHeight);
        });
    });

    describe("moveLeft", () => {
        it("should move the model's X position left using the given speed, and the calculated consistent-speed from the UnitHelper", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed:number) {
                    this.moveLeft(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            testModel.x = 100;

            const expectedSpeed = 5;
            const expectedConsistentSpeed = 15;
            const expectedX = testModel.x - expectedConsistentSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(expectedConsistentSpeed);

            testModel.triggerMove(expectedSpeed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);

            expect(testModel.x).toBe(expectedX);
        });

        it("should use the model's xSpeed as the default speed", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed?:number) {
                    this.moveLeft(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            const expectedSpeed = 51.2;
            testModel.xSpeed = expectedSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");

            testModel.triggerMove();

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);
        });
    });

    describe("moveRight", () => {
        it("should move the model's X position right using the given speed, and the calculated consistent-speed from the UnitHelper", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed:number) {
                    this.moveRight(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            testModel.x = 100;

            const expectedSpeed = 5;
            const expectedConsistentSpeed = 15;
            const expectedX = testModel.x + expectedConsistentSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(expectedConsistentSpeed);

            testModel.triggerMove(expectedSpeed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);

            expect(testModel.x).toBe(expectedX);
        });

        it("should use the model's xSpeed as the default speed", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed?:number) {
                    this.moveRight(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            const expectedSpeed = 51.2;
            testModel.xSpeed = expectedSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");

            testModel.triggerMove();

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);
        });
    });

    describe("moveUp", () => {
        it("should move the model's Y position up using the given speed, and the calculated consistent-speed from the UnitHelper", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed:number) {
                    this.moveUp(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            testModel.y = 100;

            const expectedSpeed = 5;
            const expectedConsistentSpeed = 15;
            const expectedY = testModel.y - expectedConsistentSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(expectedConsistentSpeed);

            testModel.triggerMove(expectedSpeed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);

            expect(testModel.y).toBe(expectedY);
        });

        it("should use the model's ySpeed as the default speed", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed?:number) {
                    this.moveUp(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            const expectedSpeed = 51.2;
            testModel.ySpeed = expectedSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");

            testModel.triggerMove();

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);
        });
    });

    describe("moveDown", () => {
        it("should move the model's Y position down using the given speed, and the calculated consistent-speed from the UnitHelper", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed:number) {
                    this.moveDown(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            testModel.y = 100;

            const expectedSpeed = 5;
            const expectedConsistentSpeed = 15;
            const expectedY = testModel.y + expectedConsistentSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(expectedConsistentSpeed);

            testModel.triggerMove(expectedSpeed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);

            expect(testModel.y).toBe(expectedY);
        });

        it("should use the model's ySpeed as the default speed", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed?:number) {
                    this.moveDown(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            const expectedSpeed = 51.2;
            testModel.ySpeed = expectedSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");

            testModel.triggerMove();

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);
        });
    });

    describe("moveIn", () => {
        it("should move the model's Z position inwards using the given speed, and the calculated consistent-speed from the UnitHelper", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed:number) {
                    this.moveIn(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            testModel.z = 100;

            const expectedSpeed = 5;
            const expectedConsistentSpeed = 15;
            const expectedZ = testModel.z + expectedConsistentSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(expectedConsistentSpeed);

            testModel.triggerMove(expectedSpeed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);

            expect(testModel.z).toBe(expectedZ);
        });

        it("should use the model's zSpeed as the default speed", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed?:number) {
                    this.moveIn(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            const expectedSpeed = 51.2;
            testModel.zSpeed = expectedSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");

            testModel.triggerMove();

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);
        });
    });

    describe("moveOut", () => {
        it("should move the model's Z position outwards using the given speed, and the calculated consistent-speed from the UnitHelper", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed:number) {
                    this.moveOut(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            testModel.z = 100;

            const expectedSpeed = 5;
            const expectedConsistentSpeed = 15;
            const expectedZ = testModel.z - expectedConsistentSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(expectedConsistentSpeed);

            testModel.triggerMove(expectedSpeed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);

            expect(testModel.z).toBe(expectedZ);
        });

        it("should use the model's zSpeed as the default speed", () => {
            class TestModel extends Model {
                // The move method is protected, so we're creating a public wrapper method
                triggerMove(speed?:number) {
                    this.moveOut(speed);
                }
            };

            const testModel = new TestModel(new ModelAnimationsManager());

            const expectedSpeed = 51.2;
            testModel.zSpeed = expectedSpeed;

            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");

            testModel.triggerMove();

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(expectedSpeed);
        });
    });
});