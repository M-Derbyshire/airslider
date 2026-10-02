import HUD from "../../entities/HUD/HUD";
import ILevel from "../../entities/Level/ILevel";
import KeyboardEventManager from "../../entities/Level/KeyboardEventManager";
import Level from "../../entities/Level/Level";
import ModelEventManager from "../../entities/Level/ModelEventManager";
import PointerEventManager from "../../entities/Level/PointerEventManager";
import IModel from "../../entities/Model/IModel";
import Model from "../../entities/Model/Model";
import ModelAnimationsManager from "../../entities/Model/ModelAnimationsManager/ModelAnimationsManager";
import UnitHelper from "../../utils/UnitHelper";
import LinearVanishingPointStrategy from "../../utils/ZCalc/strategies/LinearVanishingPointStrategy";
import ZCalc from "../../utils/ZCalc/ZCalc";
import Camera from "./Camera";
import FrameManager from "./FrameManager";
import GraphicEngine from "./GraphicEngine";
import { ITextContent } from "./IGraphicEngine";

describe("GraphicEngine", () => {
    it("should set the camera property to the given camera", () => {
        const canvas = document.createElement("canvas");
        const camera = new Camera(canvas, 0, 0, 0, 0);

        const engine = new GraphicEngine(
            camera,
            new FrameManager(),
            {} as CanvasRenderingContext2D
        );

        expect(engine.camera).toBe(camera);
    });

    it("should call the camera's setCameraSize method when constructed", () => {
        const setCameraSize = jest.fn();

        const canvas = document.createElement("canvas");
        const camera = new Camera(canvas, 0, 0, 0, 0);
        camera.setCameraSize = setCameraSize;

        const engine = new GraphicEngine(
            camera,
            new FrameManager(),
            {} as CanvasRenderingContext2D
        );

        expect(setCameraSize).toHaveBeenCalledTimes(1);
    });

    describe("run", () => {
        const createLevel = ():ILevel => {
            return new Level(
                new FrameManager(),
                new ModelEventManager(),
                new PointerEventManager(document.createElement("canvas")),
                new KeyboardEventManager()
            );
        };

        const createModelWithMockMethods = ():IModel => {
            const m = new Model(new ModelAnimationsManager());
            m.active = true;
            m.precalculateDrawPositionsAndDimensions = jest.fn();
            m.draw = jest.fn();

            return m;
        };

        it("should call the camera's setCameraSize method when canvas size has changed", () => {
            const setCameraSize = jest.fn();

            // set initial style values
            const canvas = document.createElement("canvas");
            canvas.width = 10;
            canvas.height = 10;

            const canvasStyles = {
                width: "20px",
                height: "20px"
            };
            Object.defineProperty(window, "getComputedStyle", {
                value: () => canvasStyles
            });

            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.setCameraSize = setCameraSize;

            const engine = new GraphicEngine(
                camera,
                new FrameManager(),
                canvas.getContext("2d")!
            );

            expect(setCameraSize).toHaveBeenCalledTimes(1); // happens on engine construction

            const level = createLevel();

            // initial run with no size changes
            // (this will still make a call while setting its internal
            // state)
            engine.run(level, [], 60);
            expect(setCameraSize).toHaveBeenCalledTimes(2);

            // now change the style properties and check again
            canvasStyles.width = "5px";
            engine.run(level, [], 60);
            expect(setCameraSize).toHaveBeenCalledTimes(3);

            canvasStyles.height = "5px";
            engine.run(level, [], 60);
            expect(setCameraSize).toHaveBeenCalledTimes(4);

            // now change the canvas properties and check
            canvas.width = 30;
            engine.run(level, [], 60);
            expect(setCameraSize).toHaveBeenCalledTimes(5);

            canvas.height = 30;
            engine.run(level, [], 60);
            expect(setCameraSize).toHaveBeenCalledTimes(6);
        });

        it("should not call the camera's setCameraSize method when canvas size has not changed", () => {
            const setCameraSize = jest.fn();

            // set initial style values
            const canvas = document.createElement("canvas");
            canvas.width = 10;
            canvas.height = 10;

            Object.defineProperty(window, "getComputedStyle", {
                value: () => ({ width: "20px", height: "20px"})
            });

            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.setCameraSize = setCameraSize;

            const engine = new GraphicEngine(
                camera,
                new FrameManager(),
                canvas.getContext("2d")!
            );

            expect(setCameraSize).toHaveBeenCalledTimes(1); // happens on engine construction

            const level = createLevel();

            // initial run with no size changes
            // (this will still make a call while setting its internal
            // state)
            engine.run(level, [], 60);
            expect(setCameraSize).toHaveBeenCalledTimes(2);

            // further calls to run will not call the camera's method
            engine.run(level, [], 60);
            engine.run(level, [], 60);
            expect(setCameraSize).toHaveBeenCalledTimes(2);
        });

        it("should clear the canvas", () => {
            const canvas = document.createElement("canvas");
            canvas.width = 100;
            canvas.height = 200;

            const context = canvas.getContext("2d")!;
            context.clearRect = jest.fn();

            const engine = new GraphicEngine(
                new Camera(canvas, 0, 0, 0, 0),
                new FrameManager(),
                canvas.getContext("2d")!
            );

            expect(context.clearRect).not.toHaveBeenCalled();

            engine.run(createLevel(), [], 60);

            expect(context.clearRect).toHaveBeenCalledTimes(1);
        });

        it("should call the frame manager's prepareFramesForDrawing method", () => {
            const frameManager = new FrameManager();
            frameManager.prepareFramesForDrawing = jest.fn();
            
            const canvas = document.createElement("canvas");

            const engine = new GraphicEngine(
                new Camera(canvas, 0, 0, 0, 0),
                frameManager,
                canvas.getContext("2d")!
            );

            expect(frameManager.prepareFramesForDrawing).not.toHaveBeenCalled();

            engine.run(createLevel(), [], 60);

            expect(frameManager.prepareFramesForDrawing).toHaveBeenCalledTimes(1);
            expect(frameManager.prepareFramesForDrawing).toHaveBeenCalledWith(engine);
        });

        it("should draw everything that needs to be drawn behind the models", () => {
            const canvas = document.createElement("canvas");

            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.drawBack = jest.fn();

            const frameManager = new FrameManager();
            frameManager.drawFramesBack = jest.fn();

            const level = createLevel();
            level.drawBack = jest.fn();

            const context = canvas.getContext("2d")!
            const engine = new GraphicEngine(camera, frameManager, context);

            expect(camera.drawBack).not.toHaveBeenCalled();
            expect(frameManager.drawFramesBack).not.toHaveBeenCalled();

            engine.run(level, [], 60);

            expect(camera.drawBack).toHaveBeenCalledTimes(1);
            expect(frameManager.drawFramesBack).toHaveBeenCalledTimes(1);
            expect(frameManager.drawFramesBack).toHaveBeenCalledWith(context);
            expect(level.drawBack).toHaveBeenCalledTimes(1);
            expect(level.drawBack).toHaveBeenCalledWith(engine, context);
        });

        it.each([
            [60.5],
            [30.123]
        ])("should draw the given models, reverse-ordered by their Z position", (currentFps: number) => {
            const nearestModel = createModelWithMockMethods();
            nearestModel.z = 5;
            const middleModel = createModelWithMockMethods();
            middleModel.z = 10;
            const farthestModel = createModelWithMockMethods();
            farthestModel.z = 20;

            // out of Z order
            const models = [
                middleModel,
                nearestModel,
                farthestModel
            ];

            // The draw method on each model will push a number into this array.
            // If the models are drawn in the right order, then these numbers 
            // should be in the right order as well
            const capturedNumbers:number[] = [];

            farthestModel.draw = jest.fn().mockImplementation(() => {
                capturedNumbers.push(0);
            });
            middleModel.draw = jest.fn().mockImplementation(() => {
                capturedNumbers.push(1);
            });
            nearestModel.draw = jest.fn().mockImplementation(() => {
                capturedNumbers.push(2);
            });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.isOnCamera = () => true; // Treat all models as being on camera

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            engine.run(createLevel(), models, currentFps);

            // confirm all models drawn with the correct parameters
            models.forEach(m => {
                expect(m.draw).toHaveBeenCalledTimes(1);
                expect(m.draw).toHaveBeenCalledWith(engine, context, currentFps);
            });

            // now confirm the models were called in the correct order
            expect(capturedNumbers.length).toBe(3);
            capturedNumbers.forEach((val: number, idx: number) => {
                expect(val).toBe(idx);
            });
        });

        it.each([
            [null],
            [undefined]
        ])("should treat a model as having a zero Z position if the Z position is not truthy", (zValue: any) => {
            const nearestModel = createModelWithMockMethods();
            nearestModel.z = -1;
            const farthestModel = createModelWithMockMethods();
            farthestModel.z = 1;

            const modelWithNoZ1 = createModelWithMockMethods();
            modelWithNoZ1.z = zValue;
            const modelWithNoZ2 = createModelWithMockMethods();
            modelWithNoZ2.z = zValue;

            const models = [
                modelWithNoZ1, // this should be sorted into the middle
                nearestModel,
                farthestModel,
                modelWithNoZ2 // this should be sorted into the middle
            ];

            // The draw method on each model will push a number into this array.
            // If the models are drawn in the right order, then these numbers 
            // should be in the right order as well
            const capturedNumbers:number[] = [];

            farthestModel.draw = jest.fn().mockImplementation(() => {
                capturedNumbers.push(0);
            });
            modelWithNoZ1.draw = jest.fn().mockImplementation(() => {
                capturedNumbers.push(1);
            });
            modelWithNoZ2.draw = jest.fn().mockImplementation(() => {
                capturedNumbers.push(2);
            });
            nearestModel.draw = jest.fn().mockImplementation(() => {
                capturedNumbers.push(3);
            });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.isOnCamera = () => true; // Treat all models as being on camera

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            engine.run(createLevel(), models, 60);

            // confirm the models were called in the correct order
            expect(capturedNumbers.length).toBe(4);
            capturedNumbers.forEach((val: number, idx: number) => {
                expect(val).toBe(idx);
            });
        });

        it("should not draw a model if it is not active", () => {
            const model = createModelWithMockMethods();
            model.active = false;

            const canvas = document.createElement("canvas");
            const engine = new GraphicEngine(
                new Camera(canvas, 0, 0, 0, 0),
                new FrameManager(),
                canvas.getContext("2d")!
            );

            engine.run(createLevel(), [model], 60);

            expect(model.precalculateDrawPositionsAndDimensions).not.toHaveBeenCalled();
            expect(model.draw).not.toHaveBeenCalled();
        });

        it("should not draw a model if it is not set to be displayed", () => {
            const model = createModelWithMockMethods();
            model.display = false;

            const canvas = document.createElement("canvas");
            const engine = new GraphicEngine(
                new Camera(canvas, 0, 0, 0, 0),
                new FrameManager(),
                canvas.getContext("2d")!
            );

            engine.run(createLevel(), [model], 60);

            expect(model.precalculateDrawPositionsAndDimensions).not.toHaveBeenCalled();
            expect(model.draw).not.toHaveBeenCalled();
        });

        it("should call the model's precalculateDrawPositionsAndDimensions method before checking is on camera, and drawing", () => {
            const canvas = document.createElement("canvas");

            // We're going to mock the implementations of the called methods, so
            // they each push a number into this array. If they were called in the
            // right order, then the numbers should also be in the right order
            const capturedNumbers:number[] = [];

            const model = createModelWithMockMethods();
            model.precalculateDrawPositionsAndDimensions = jest.fn().mockImplementation(() => {
                capturedNumbers.push(0);
            });
            model.draw = jest.fn().mockImplementation(() => {
                capturedNumbers.push(2);
            });

            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.isOnCamera = jest.fn().mockImplementation(() => {
                capturedNumbers.push(1);
                return true;
            });

            const engine = new GraphicEngine(camera, new FrameManager(), canvas.getContext("2d")!);

            engine.run(createLevel(), [model], 60);

            // If the methods were called in the right order, these numbers
            // should be in the right order
            expect(capturedNumbers.length).toBe(3);
            capturedNumbers.forEach((val: number, idx: number) => {
                expect(val).toBe(idx);
            });
        });

        it("should not draw model if it's not on camera", () => {
            const canvas = document.createElement("canvas");

            const positons = { x: 10, y: 20 };
            const dimensions = { width: 30, height: 40 };

            const model = createModelWithMockMethods();
            Object.defineProperty(model, "calculatedDrawPositions", {
                value: positons
            });
            Object.defineProperty(model, "calculatedDrawDimensions", {
                value: dimensions
            });

            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.isOnCamera = jest.fn().mockReturnValue(false);

            const engine = new GraphicEngine(camera, new FrameManager(), canvas.getContext("2d")!);

            engine.run(createLevel(), [model], 60);

            expect(camera.isOnCamera).toHaveBeenCalledTimes(1);
            expect(camera.isOnCamera).toHaveBeenCalledWith(positons.x, positons.y, dimensions.width, dimensions.height);

            expect(model.draw).not.toHaveBeenCalled();
        });

        it("should draw everything that needs to be drawn in front of the models", () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            // We're going to mock the implementations of the called methods, so
            // they each push a number into this array. If they were called in the
            // right order, then the numbers should also be in the right order
            const capturedNumbers:number[] = [];

            const level = createLevel();
            level.drawFront = jest.fn().mockImplementation(() => capturedNumbers.push(0));

            const frameManager = new FrameManager();
            frameManager.drawFramesFront = jest.fn().mockImplementation(() => capturedNumbers.push(1));

            const hud = new HUD(new PointerEventManager(canvas));
            hud.draw = jest.fn().mockImplementation(() => capturedNumbers.push(2));
            Object.defineProperty(level, "HUD", {
                value: hud
            });

            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.drawFront = jest.fn().mockImplementation(() => capturedNumbers.push(3));

            const engine = new GraphicEngine(camera, frameManager, context);

            expect(camera.drawFront).not.toHaveBeenCalled();
            expect(frameManager.drawFramesFront).not.toHaveBeenCalled();

            engine.run(level, [], 60);

            // Check everything was called with correct parameters
            expect(level.drawFront).toHaveBeenCalledTimes(1);
            expect(level.drawFront).toHaveBeenCalledWith(engine, context);
            expect(frameManager.drawFramesFront).toHaveBeenCalledTimes(1);
            expect(frameManager.drawFramesFront).toHaveBeenCalledWith(context);
            expect(hud.draw).toHaveBeenCalledTimes(1);
            expect(hud.draw).toHaveBeenCalledWith(engine, context);
            expect(camera.drawFront).toHaveBeenCalledTimes(1);

            // now check everything was called in order
            expect(capturedNumbers.length).toBe(4);
            capturedNumbers.forEach((val, idx) => expect(val).toBe(idx));
        });

        it.each([
            ["#ff0000", 60],
            ["#0000ff", 30]
        ])("should draw the current fps display if given an fps display color", (color:string, fps:number) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            // set some initial values, to ensure they're changed
            context.font = "1px Calibri";
            context.fillStyle = "#00ff00";
            context.textAlign = "center";

            context.fillText = jest.fn();

            const engine = new GraphicEngine(new Camera(canvas, 0, 0, 0, 0), new FrameManager(), context);

            engine.run(createLevel(), [], fps, color);

            const expectedFont = "30px Arial";
            const expectTextAlign = "left";
            const expectedText = `FPS: ${fps}`;
            const expectedXPos = 10;
            const expectedYPos = 40;

            expect(context.font).toBe(expectedFont);
            expect(context.fillStyle).toBe(color);
            expect(context.textAlign).toBe(expectTextAlign);

            expect(context.fillText).toHaveBeenCalledTimes(1);
            expect(context.fillText).toHaveBeenCalledWith(expectedText, expectedXPos, expectedYPos);
        });

        it.each([
            [60.5, 60.5],
            [60.123, 60.12],
            [60.125, 60.13],
            [45.329, 45.33]
        ])("should round the given fps to 2 decimal places when displaying", (fps:number, expected:number) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            context.fillText = jest.fn();

            const engine = new GraphicEngine(new Camera(canvas, 0, 0, 0, 0), new FrameManager(), context);

            engine.run(createLevel(), [], fps, "#ff0000");

            const expectedText = `FPS: ${expected}`;
            expect(context.fillText).toHaveBeenCalledWith(expectedText, expect.anything(), expect.anything());
        });

        it("should not draw the fps display if not given a display color", () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            context.fillText = jest.fn();

            const engine = new GraphicEngine(new Camera(canvas, 0, 0, 0, 0), new FrameManager(), context);

            engine.run(createLevel(), [], 60);

            expect(context.fillText).not.toHaveBeenCalled();
        });

        it("should call everything in correct order", () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.isOnCamera = jest.fn().mockReturnValue(true);

            const frameManager = new FrameManager();
            const level = createLevel();
            const model = createModelWithMockMethods();
            
            const hud = new HUD(new PointerEventManager(canvas));
            Object.defineProperty(level, "HUD", {
                value: hud
            });

            // We're going to mock the implementations of the called methods, so
            // they each push a number into this array. If they were called in the
            // right order, then the numbers should also be in the right order
            const capturedNumbers:number[] = [];

            camera.setCameraSize = jest.fn().mockImplementation(() => capturedNumbers.push(0));
            context.clearRect = jest.fn().mockImplementation(() => capturedNumbers.push(1));
            frameManager.prepareFramesForDrawing = jest.fn().mockImplementation(() => capturedNumbers.push(2));
            camera.drawBack = jest.fn().mockImplementation(() => capturedNumbers.push(3));
            frameManager.drawFramesBack = jest.fn().mockImplementation(() => capturedNumbers.push(4));
            level.drawBack = jest.fn().mockImplementation(() => capturedNumbers.push(5));
            model.draw = jest.fn().mockImplementation(() => capturedNumbers.push(6));
            level.drawFront = jest.fn().mockImplementation(() => capturedNumbers.push(7));
            frameManager.drawFramesFront = jest.fn().mockImplementation(() => capturedNumbers.push(8));
            hud.draw = jest.fn().mockImplementation(() => capturedNumbers.push(9));
            camera.drawFront = jest.fn().mockImplementation(() => capturedNumbers.push(10));
            context.fillText = jest.fn().mockImplementation(() => capturedNumbers.push(11));

            // The engine constructor will call the camera's setCameraSize method, so
            // we're going to remove that call from the numbers
            const engine = new GraphicEngine(camera, frameManager, context);
            capturedNumbers.pop();

            engine.run(level, [model], 60, "#ff0000");

            // captured numbers should be in the correct order
            expect(capturedNumbers.length).toBe(12);
            capturedNumbers.forEach((val, idx) => expect(val).toBe(idx));
        });
    });

    describe("drawText", () => {
        beforeEach(() => {
            ZCalc.setStrategy(undefined);
        });

        it("should draw the given text with the correct font/text properties", () => {
            const textContent:ITextContent = {
                content: "my text 123",
                x: 0,
                y: 0,
                size: 25,
                font: "Courier",
                color: "#00ff00",
                style: "bold",
                alignment: "right",
                lineGap: 10
            };

            const canvas = document.createElement("canvas");
            canvas.width = 10;
            canvas.height = 10;
            const context = canvas.getContext("2d")!;
            context.fillText = jest.fn();

            // Set some initial values, to ensure they get changed
            context.font = "1px Arial";
            context.fillStyle = "#ff0000";
            context.textAlign = "left";

            const engine = new GraphicEngine(new Camera(canvas, 0, 0, 0, 0), new FrameManager(), context);

            engine.drawText(
                textContent,
                { x: 0, y: 0, z: 0 },
                "static",
                false
            );

            const expectedFontPixelSize = 3.75;
            expect(context.font).toBe(`${textContent.style} ${expectedFontPixelSize}px ${textContent.font}`);
            expect(context.fillStyle).toBe(textContent.color);
            expect(context.textAlign).toBe(textContent.alignment);

            expect(context.fillText).toHaveBeenCalledTimes(1);
            expect(context.fillText).toHaveBeenCalledWith(textContent.content, expect.anything(), expect.anything());
        });

        it.each([
            ["static", [2.1875, 6.6875, 11.1875]],
            ["scaled", [10.7005599547746, 14.689776357488125, 18.67899276020165]]
        ])("should draw each line of the given text seperately, with the expected line height", (scaleType: string, expectedYPositions: number[]) => {
            const expectedLines = ["my line 1", "my line 2", "My Line 3"];

            const textContent:ITextContent = {
                content: expectedLines.join("\n"),
                x: 0,
                y: 0,
                size: 25,
                font: "Courier",
                color: "#00ff00",
                style: "bold",
                alignment: "right",
                lineGap: 5
            };

            const canvas = document.createElement("canvas");
            canvas.width = 10;
            canvas.height = 10;
            const context = canvas.getContext("2d")!;
            context.fillText = jest.fn();

            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const zCalcStrat = new LinearVanishingPointStrategy();
            zCalcStrat.setVanishPoint(500, 500, 1000);
            ZCalc.setStrategy(zCalcStrat);
            
            const engine = new GraphicEngine(camera, new FrameManager(), context);

            engine.drawText(
                textContent,
                { x: 0, y: 0, z: 15 },
                scaleType as any,
                false
            );

            expect(context.fillText).toHaveBeenCalledTimes(3);
            expect(context.fillText).toHaveBeenNthCalledWith(1, expectedLines[0], expect.anything(), expectedYPositions[0]);
            expect(context.fillText).toHaveBeenNthCalledWith(2, expectedLines[1], expect.anything(), expectedYPositions[1]);
            expect(context.fillText).toHaveBeenNthCalledWith(3, expectedLines[2], expect.anything(), expectedYPositions[2]);
        });

        it("should draw scaled text at negative Z position if scale type is static", () => {
            const textContent:ITextContent = {
                content: "my text 123",
                x: 0,
                y: 0,
                size: 25,
                font: "Courier",
                color: "#00ff00",
                style: "bold",
                alignment: "right",
                lineGap: 5
            };

            const canvas = document.createElement("canvas");
            canvas.width = 10;
            canvas.height = 10;
            const context = canvas.getContext("2d")!;
            context.fillText = jest.fn();

            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const zCalcStrat = new LinearVanishingPointStrategy();
            zCalcStrat.setVanishPoint(500, 500, 1000);
            ZCalc.setStrategy(zCalcStrat);

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            engine.drawText(
                textContent,
                { x: 500, y: 500, z: -1 },
                "static",
                false // showNegative is false, but that should be ignored
            );

            expect(context.fillText).toHaveBeenCalledTimes(1);
            expect(context.font).toBe("bold 3.75px Courier"); // a positive font size means this is being rendered
        });

        it("should draw scaled text at negative Z position if showNegative is true and scale type is scaled", () => {
            const textContent:ITextContent = {
                content: "my text 123",
                x: 0,
                y: 0,
                size: 25,
                font: "Courier",
                color: "#00ff00",
                style: "bold",
                alignment: "right",
                lineGap: 5
            };

            const canvas = document.createElement("canvas");
            canvas.width = 10;
            canvas.height = 10;
            const context = canvas.getContext("2d")!;
            context.fillText = jest.fn();

            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const zCalcStrat = new LinearVanishingPointStrategy();
            zCalcStrat.setVanishPoint(500, 500, 1000);
            ZCalc.setStrategy(zCalcStrat);

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            engine.drawText(
                textContent,
                { x: 500, y: 500, z: -1 },
                "scaled",
                true // showNegative is true
            );

            expect(context.fillText).toHaveBeenCalledTimes(1);
            expect(context.font).toBe("bold 3.7800000000000002px Courier"); // a positive font size means this is being rendered
        });

        it("should not draw scaled text at negative Z position if showNegative is false and scale type is scaled", () => {
            const textContent:ITextContent = {
                content: "my text 123",
                x: 0,
                y: 0,
                size: 25,
                font: "Courier",
                color: "#00ff00",
                style: "bold",
                alignment: "right",
                lineGap: 5
            };

            const canvas = document.createElement("canvas");
            canvas.width = 10;
            canvas.height = 10;
            const context = canvas.getContext("2d")!;
            context.fillText = jest.fn();

            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const zCalcStrat = new LinearVanishingPointStrategy();
            zCalcStrat.setVanishPoint(500, 500, 1000);
            ZCalc.setStrategy(zCalcStrat);

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            engine.drawText(
                textContent,
                { x: 500, y: 500, z: -1 },
                "scaled",
                false // showNegative is false
            );

            expect(context.fillText).toHaveBeenCalledTimes(0);
        });

        it("should produce the correct size/position values, based on the given data", () => {
            const canvas = document.createElement("canvas");
            canvas.width = 10;
            canvas.height = 10;
            const context = canvas.getContext("2d")!;

            const zCalcStrat = new LinearVanishingPointStrategy();
            zCalcStrat.setVanishPoint(500, 500, 1000);
            ZCalc.setStrategy(zCalcStrat);

            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            // These values will be used to generate results, to be stored in a snapshot
            interface ITestValues {
                tX: number; // The X value of the text content
                tY: number; // The Y value of the text content
                eX: number; // The X value of the entity that owns the text
                eY: number; // The Y value of the entity that owns the text
                eZ: number; // The Z value of the entity that owns the text
                size: number; // The font size
                gap: number; // The gap between lines of text
            };

            // These are the results that will be stored in a snapshot
            interface IResult {
                x: number; // The X positon that the text was drawn at
                y: number; // The Y position that the text was drawn at
                height: number; // The height that the text was drawn with
            };

            const scaleTypes = ["static", "scaled"];

            // Results will be generated for this test data (for both "scaled" 
            // and "static" scaling). The results will then be saved in a snapshot
            const testData:ITestValues[] = [
                { tX: 12, tY: 14, eX: 101, eY: 205, eZ: 12, size: 17, gap: 5 },
                { tX: 452, tY: 143, eX: 318, eY:389, eZ: 224, size: 178, gap: 489 },
                { tX: 499, tY: 332, eX: 157, eY:353, eZ: 52, size: 406, gap: 343 },
                { tX: 333, tY: 198, eX: 230, eY:384, eZ: 395, size: 30, gap: 281 },
                { tX: 137, tY: 276, eX: 367, eY:278, eZ: 5, size: 299, gap: 8 },
                { tX: 389, tY: 318, eX: 153, eY:409, eZ: 170, size: 240, gap: 436 },
                { tX: 57, tY: 228, eX: 309, eY:158, eZ: -56, size: 401, gap: 7 },
                { tX: 48, tY: 287, eX: 89, eY:449, eZ: -66, size: 9, gap: 295 },
                { tX: 354, tY: 320, eX: 305, eY:288, eZ: 111, size: 297, gap: 48 },
                { tX: 10, tY: 374, eX: 158, eY:347, eZ: 88, size: 409, gap: 95 },
            ];

            // Mocking the fillText method so we can see what values it was
            // last called with
            let capturedX:number;
            let capturedY:number;
            context.fillText = jest.fn().mockImplementation((_, x: number, y: number) => {
                capturedX = x;
                capturedY = y;
            });

            // Now we generate the results from the test data (for both "static" and "scaled" scaling)
            const results:IResult[] = [];

            scaleTypes.forEach((scaleType: string) => {
                testData.forEach((data: ITestValues) => {
                    const textContent:ITextContent= {
                        content: "my text 123",
                        x: data.tX,
                        y: data.tY,
                        size: data.size,
                        font: "Courier",
                        color: "#00ff00",
                        style: "bold",
                        alignment: "right",
                        lineGap: data.gap
                    };

                    const entityValues = { x: data.eX, y: data.eY, z: data.eZ };

                    engine.drawText(textContent, entityValues, scaleType as any, true);

                    // extract height pixel value from font property
                    const height = context.font
                        .replace(`${textContent.style} `, "")
                        .replace(`px ${textContent.font}`, "");

                    const result = {
                        x: capturedX,
                        y: capturedY,
                        height: Number(height)
                    };

                    results.push(result);
                });
            });

            expect(results).toMatchSnapshot();
        });
    });

    describe("getStaticDrawPositionsAndDimensions", () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it.each([
            [undefined],
            ["5"],
            [null]
        ])("should return 0 for values if not provided", (invalidValue: any) => {
            const unitValues = {
                x: invalidValue,
                y: invalidValue,
                width: invalidValue,
                height: invalidValue
            };

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            const results = engine.getStaticDrawPositionsAndDimensions(unitValues);

            expect(results.x).toBe(0);
            expect(results.y).toBe(0);
            expect(results.width).toBe(0);
            expect(results.height).toBe(0);
        });

        it.each([
            [42, 62],
            [142, 162],
        ])("should return position values based on correct pixel values, added to camera X position", (xPixels: number, yPixels: number) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const cameraXPixels = 103;
            const cameraYPixels = 2;
            Object.defineProperties(camera, {
                canvasPositionX: {
                    value: cameraXPixels
                },
                canvasPositionY: {
                    value: cameraYPixels
                }
            });

            const unitValues = { x: 40, y: 60, width: 100, height: 100 };

            // Setup spies on UnitHelper, to return the x/y values we want
            const xUnitSpy = jest.spyOn(UnitHelper, "xUnitsToPixels");
            xUnitSpy.mockImplementation((unitValue: number) => {
                if(unitValue === unitValues.x)
                    return xPixels;

                return -1;
            });

            const yUnitSpy = jest.spyOn(UnitHelper, "yUnitsToPixels");
            yUnitSpy.mockImplementation((unitValue: number) => {
                if(unitValue === unitValues.y)
                    return yPixels;

                return -1;
            });

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            const results = engine.getStaticDrawPositionsAndDimensions(unitValues);

            expect(xUnitSpy).toHaveBeenCalledTimes(2);
            expect(xUnitSpy).toHaveBeenNthCalledWith(1, unitValues.x);
            expect(xUnitSpy).toHaveBeenNthCalledWith(2, unitValues.width);
            expect(yUnitSpy).toHaveBeenCalledTimes(2);
            expect(yUnitSpy).toHaveBeenNthCalledWith(1, unitValues.y);
            expect(yUnitSpy).toHaveBeenNthCalledWith(2, unitValues.height);

            const expectedX = xPixels + cameraXPixels;
            const expectedY = yPixels + cameraYPixels;
            expect(results.x).toBe(expectedX);
            expect(results.y).toBe(expectedY);
        });

        it.each([
            [42, 62],
            [142, 162],
        ])("should return dimension values based on corect pixel values", (xPixels: number, yPixels: number) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const unitValues = { x: 100, y: 100, width: 40, height: 60 };

            // Setup spies on UnitHelper, to return the x/y values we want
            const xUnitSpy = jest.spyOn(UnitHelper, "xUnitsToPixels");
            xUnitSpy.mockImplementation((unitValue: number) => {
                if(unitValue === unitValues.width)
                    return xPixels;

                return -1;
            });

            const yUnitSpy = jest.spyOn(UnitHelper, "yUnitsToPixels");
            yUnitSpy.mockImplementation((unitValue: number) => {
                if(unitValue === unitValues.height)
                    return yPixels;

                return -1;
            });

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            const results = engine.getStaticDrawPositionsAndDimensions(unitValues);
            
            expect(xUnitSpy).toHaveBeenCalledTimes(2);
            expect(xUnitSpy).toHaveBeenNthCalledWith(1, unitValues.x);
            expect(xUnitSpy).toHaveBeenNthCalledWith(2, unitValues.width);
            expect(yUnitSpy).toHaveBeenCalledTimes(2);
            expect(yUnitSpy).toHaveBeenNthCalledWith(1, unitValues.y);
            expect(yUnitSpy).toHaveBeenNthCalledWith(2, unitValues.height);

            expect(results.width).toBe(xPixels);
            expect(results.height).toBe(yPixels);
        });
    });

    describe("getUnscaledDrawPositionsAndDimensions", () => {
        it("should pass the given width and height values to getStaticDrawPositionsAndDimensions, unchanged, and return the results", () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            const unitValues = { x: 100, y: 100, width: 42, height: 62 };
            const mockWidthPixels = 421;
            const mockHeightPixels = 621;
            engine.getStaticDrawPositionsAndDimensions = jest.fn().mockReturnValue(
                { x: 0, y: 0, width: mockWidthPixels, height: mockHeightPixels }
            );

            const results = engine.getUnscaledDrawPositionsAndDimensions(unitValues);

            expect(engine.getStaticDrawPositionsAndDimensions).toHaveBeenCalledTimes(1);
            expect(engine.getStaticDrawPositionsAndDimensions).toHaveBeenCalledWith(expect.objectContaining({
                width: unitValues.width,
                height: unitValues.height
            }));

            expect(results.width).toBe(mockWidthPixels);
            expect(results.height).toBe(mockHeightPixels);
        });

        it.each([
            [undefined],
            ["5"],
            [null]
        ])("should return zeroes for position values if unit values not numbers", (invalidValue) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            const unitValues = { x: invalidValue, y: invalidValue, width: 42, height: 62 };

            const results = engine.getUnscaledDrawPositionsAndDimensions(unitValues as any);

            expect(results.x).toBe(0);
            expect(results.y).toBe(0);
        });

        it("should use the camera's position calculators to calculate the unit positions that are passed to getStaticDrawPositionsAndDimensions", () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            // Mock the unitCameraPositionCalc functions, to return specific results
            const calcXUnits = 42;
            const calcYUnits = 62;
            const mockCameraXCalc = jest.fn().mockReturnValue(calcXUnits);
            const mockCameraYCalc = jest.fn().mockReturnValue(calcYUnits);
            Object.defineProperty(camera, "unitCameraPositionCalc", {
                value: {
                    x: mockCameraXCalc,
                    y: mockCameraYCalc
                }
            });

            const engine = new GraphicEngine(camera, new FrameManager(), context);

            // Mock the getStaticDrawPositionsAndDimensions, to return the specific pixel values
            const expectedXPixels = 420;
            const expectedYPIxels = 620;
            engine.getStaticDrawPositionsAndDimensions = jest.fn().mockReturnValue(
                { x: expectedXPixels, y: expectedYPIxels, width: 0, height: 0 }
            );

            const originalUnitValues = { x: 12, y: 17, width: 100, height: 100 };
            const results = engine.getUnscaledDrawPositionsAndDimensions(originalUnitValues);

            expect(mockCameraXCalc).toHaveBeenCalledTimes(1);
            expect(mockCameraXCalc).toHaveBeenCalledWith(originalUnitValues.x);
            expect(mockCameraYCalc).toHaveBeenCalledTimes(1);
            expect(mockCameraYCalc).toHaveBeenCalledWith(originalUnitValues.y);

            expect(engine.getStaticDrawPositionsAndDimensions).toHaveBeenCalledTimes(1);
            expect(engine.getStaticDrawPositionsAndDimensions).toHaveBeenCalledWith(expect.objectContaining({
                x: calcXUnits,
                y: calcYUnits
            }));

            expect(results.x).toBe(expectedXPixels);
            expect(results.y).toBe(expectedYPIxels);
        });
    });

    describe("getScaledDrawPositionsAndDimensions", () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it.each([
            [true, 51],
            [false, 101],
            [undefined, 2],
        ])(
            "should generate pixel position values with getUnscaledDrawPositionsAndDimensions, then pass them on to ZCalc getDrawValues method to get final result",
            (showNegative: boolean|undefined, zPos: number) => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                const camera = new Camera(canvas, 16, 9, 1000, 1000);

                // Mock the ZCalc to return specific results
                const zCalcSpy = jest.spyOn(ZCalc, "getDrawValues");
                const mockZCalcResult = {
                    x: 42,
                    y: 72,
                    width: 102,
                    height: 202
                };
                zCalcSpy.mockReturnValue(mockZCalcResult);
                
                const engine = new GraphicEngine(camera, new FrameManager(), context);

                // Mock the getUnscaledDrawPositionsAndDimensions for the unscaled values
                const mockUnscaledPixelsResult = {
                    x: 420,
                    y: 721,
                    width: 105,
                    height: 203
                };
                engine.getUnscaledDrawPositionsAndDimensions = jest.fn().mockReturnValue(mockUnscaledPixelsResult);

                const unitValues = {
                    x: 5,
                    y: 7,
                    width: 2,
                    height: 23,
                    z: zPos
                };
                const results = engine.getScaledDrawPositionsAndDimensions(unitValues, showNegative);

                expect(engine.getUnscaledDrawPositionsAndDimensions).toHaveBeenCalledTimes(1);
                expect(engine.getUnscaledDrawPositionsAndDimensions).toHaveBeenCalledWith(expect.objectContaining({
                    x: unitValues.x,
                    y: unitValues.y,
                    width: unitValues.width,
                    height: unitValues.height
                }));

                expect(zCalcSpy).toHaveBeenCalledTimes(1);
                expect(zCalcSpy).toHaveBeenCalledWith(
                    camera,
                    mockUnscaledPixelsResult,
                    zPos,
                    !!showNegative
                );

                expect(results).toBe(mockZCalcResult);
            }
        );
    });
});