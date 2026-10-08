import Camera from "../../../engines/GraphicEngine/Camera";
import FrameManager from "../../../engines/GraphicEngine/FrameManager";
import GraphicEngine from "../../../engines/GraphicEngine/GraphicEngine";
import IGraphicEngine from "../../../engines/GraphicEngine/IGraphicEngine";
import { IAnimationDetails, IFrameCoordinates } from "./IModelAnimationsManager";
import ModelAnimationsManager from "./ModelAnimationsManager";

describe("ModelAnimationsManager", () => {
    const createGraphicEngine = ():IGraphicEngine => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        return new GraphicEngine(
            new Camera(canvas, 0, 0, 0, 0),
            new FrameManager(),
            context
        );
    };

    it("should set the correct defaults in the constructor", () => {
        const manager = new ModelAnimationsManager();

        const animations = manager.animations;
        const calculatedDrawPositions = manager.calculatedDrawPositions;
        const calculatedDrawDimensions = manager.calculatedDrawDimensions;

        expect(Object.keys(animations).length).toBe(0);
        expect(calculatedDrawPositions.x).toBe(0);
        expect(calculatedDrawPositions.y).toBe(0);
        expect(calculatedDrawDimensions.width).toBe(0);
        expect(calculatedDrawDimensions.height).toBe(0);
    });

    describe("createAnimation", () => {
        it("should create animation object with given values", () => {
            const manager = new ModelAnimationsManager();

            const expectedSpritesheet = new Image(0, 0);
            expectedSpritesheet.src = "/assets/sheet.png";
            const expectedFps = 65.2;
            const expectedDrawWidth = 124;
            const expectedDrawHeight = 145;
            const expectedFrameCoordinates = [
                { x: 1, y: 2, width: 3, height: 4 },
                { x: 11, y: 22, width: 33, height: 44 },
            ];
            const expectedOnAnimationEnd = jest.fn();
            const expectedXOffset = 37;
            const expectedYOffset = 12;

            const animation = manager.createAnimation({
                spritesheet: expectedSpritesheet,
                fps: expectedFps,
                drawWidth: expectedDrawWidth,
                drawHeight: expectedDrawHeight,
                frameCoordinates: expectedFrameCoordinates,
                onAnimationEnd: expectedOnAnimationEnd,
                xOffset: expectedXOffset,
                yOffset: expectedYOffset
            });

            expect(animation.spritesheet).toBe(expectedSpritesheet);
            expect(animation.fps).toBe(expectedFps);
            expect(animation.width).toBe(expectedDrawWidth);
            expect(animation.height).toBe(expectedDrawHeight);
            expect(animation.frameCoordinates).toBe(expectedFrameCoordinates);
            expect(animation.onAnimationEnd).toBe(expectedOnAnimationEnd);
            expect(animation.xOffset).toBe(expectedXOffset);
            expect(animation.yOffset).toBe(expectedYOffset);
        });

        it("should create animation object with correct default values", () => {
            const manager = new ModelAnimationsManager();

            const animation = manager.createAnimation({
                spritesheet: new Image(0, 0),
                fps: 60,
                drawWidth: 124,
                drawHeight: 145,
                frameCoordinates: [
                    { x: 1, y: 2, width: 3, height: 4 },
                    { x: 11, y: 22, width: 33, height: 44 },
                ],
            });

            expect(animation.onAnimationEnd).toBeUndefined();
            expect(animation.xOffset).toBe(0);
            expect(animation.yOffset).toBe(0);
            expect(animation.waitCount).toBe(0);
            expect(animation.nextCount).toBe(0);
            expect(animation.currentFrameIndex).toBe(0);
        });
    });

    describe("registerAnimations", () => {
        it("should add animation to the animations list", () => {
            const manager = new ModelAnimationsManager();
            
            const state1 = "test-state-1";
            const animation1 = manager.createAnimation({
                spritesheet: new Image(0, 0),
                fps: 60,
                drawWidth: 124,
                drawHeight: 145,
                frameCoordinates: [
                    { x: 1, y: 2, width: 3, height: 4 },
                    { x: 11, y: 22, width: 33, height: 44 },
                ],
            });

            const state2 = "test-state-2";
            const animation2 = manager.createAnimation({
                spritesheet: new Image(1, 1),
                fps: 25,
                drawWidth: 134,
                drawHeight: 155,
                frameCoordinates: [
                    { x: 12, y: 21, width: 31, height: 41 },
                    { x: 11, y: 22, width: 33, height: 44 },
                ],
            });

            manager.registerAnimations({
                [state1]: animation1,
                [state2]: animation2
            });

            expect(manager.animations[state1]).toBe(animation1);
            expect(manager.animations[state2]).toBe(animation2);
        });
    });

    describe("clearAllAnimations", () => {
        it("should clear the animations object", () => {
            const manager = new ModelAnimationsManager();
            
            const animation1 = manager.createAnimation({
                spritesheet: new Image(0, 0),
                fps: 60,
                drawWidth: 124,
                drawHeight: 145,
                frameCoordinates: [
                    { x: 1, y: 2, width: 3, height: 4 },
                    { x: 11, y: 22, width: 33, height: 44 },
                ],
            });

            const animation2 = manager.createAnimation({
                spritesheet: new Image(1, 1),
                fps: 25,
                drawWidth: 134,
                drawHeight: 155,
                frameCoordinates: [
                    { x: 12, y: 21, width: 31, height: 41 },
                    { x: 11, y: 22, width: 33, height: 44 },
                ],
            });

            manager.registerAnimations({
                state1: animation1,
                state2: animation2
            });

            manager.clearAllAnimations();

            expect(Object.keys(manager.animations).length).toBe(0);
        });
    });

    describe("precalculateDrawPositionsAndDimensions", () => {
        it("should use the GraphicEngine's getScaledDrawPositionsAndDimensions method to set the calculated values", () => {
            const manager = new ModelAnimationsManager();

            const expectedX = 42;
            const expectedY = 52;
            const expectedWidth = 142;
            const expectedHeight = 152;
            const mockScalingResult = {
                x: expectedX,
                y: expectedY,
                width: expectedWidth,
                height: expectedHeight
            };

            const graphicEngine = createGraphicEngine();
            graphicEngine.getScaledDrawPositionsAndDimensions = jest.fn().mockReturnValue(mockScalingResult);

            const coordinates = {
                x: 1,
                y: 2,
                z: 3,
                width: 4,
                height: 5,
            };

            manager.precalculateDrawPositionsAndDimensions(coordinates, graphicEngine);

            expect(graphicEngine.getScaledDrawPositionsAndDimensions).toHaveBeenCalledTimes(1);
            expect(graphicEngine.getScaledDrawPositionsAndDimensions).toHaveBeenCalledWith(coordinates);

            expect(manager.calculatedDrawPositions.x).toBe(expectedX);
            expect(manager.calculatedDrawPositions.y).toBe(expectedY);
            expect(manager.calculatedDrawDimensions.width).toBe(expectedWidth);
            expect(manager.calculatedDrawDimensions.height).toBe(expectedHeight);
        });
    });

    describe("drawText", () => {
        it("should call the drawText method on the GraphicEngine", () => {
            const manager = new ModelAnimationsManager();

            const text = {
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

            const positions = {
                x: 6,
                y: 8,
                z: 9,
            };

            const graphicEngine = createGraphicEngine();
            graphicEngine.drawText = jest.fn();

            manager.drawText(text, positions, graphicEngine);

            expect(graphicEngine.drawText).toHaveBeenCalledTimes(1);
            expect(graphicEngine.drawText).toHaveBeenCalledWith(text, positions, "scaled");
        });
    });

    describe("drawHitBoxes", () => {
        it.each([
            ["#ff0000", "#ff9900"],
            ["#0000ff", "#00ff00"]
        ])("should draw with the correct color and position/dimensions, and then reset the color afterwards", (color:string, originalColor:string) => {
            const manager = new ModelAnimationsManager();

            const hitBoxes = [
                {
                    x: 1,
                    y: 2,
                    z: 3,
                    width: 4,
                    height: 5
                }
            ];

            const graphicEngine = createGraphicEngine();
            const context = document.createElement("canvas").getContext("2d")!;

            // We're going to capture the calls to the setters/methods, to ensure they were
            // called in the correct order, and with the expected values
            const capturedCalls:{ name:string, data:any[] }[] = [];

            let currentColor = originalColor;
            Object.defineProperty(context, "strokeStyle", {
                set: (val) => {
                    capturedCalls.push({ name: "strokeStyle", data: [val] });
                    currentColor = val;
                },
                get: () => currentColor
            });
            context.strokeRect = jest.fn().mockImplementation((x, y, w, h) => capturedCalls.push({ name: "strokeRect", data: [x, y, w, h] }));

            const mockScaledCoordinates = {
                x: 15,
                y: 25,
                width: 35,
                height: 45
            };
            graphicEngine.getScaledDrawPositionsAndDimensions = jest.fn().mockImplementation(
                val => {
                    capturedCalls.push({ name: "getScaledDrawPositionsAndDimensions", data: [val] });
                    return mockScaledCoordinates;
                }
            );

            // Now we want to make the call, and ensure the methods were called in the correct order
            manager.drawHitBoxes(color, hitBoxes, graphicEngine, context);

            expect(capturedCalls.length).toBe(4);

            expect(capturedCalls[0].name).toBe("strokeStyle");
            expect(capturedCalls[0].data[0]).toBe(color);

            expect(capturedCalls[1].name).toBe("getScaledDrawPositionsAndDimensions");
            expect(capturedCalls[1].data[0]).toBe(hitBoxes[0]);

            expect(capturedCalls[2].name).toBe("strokeRect");
            expect(capturedCalls[2].data[0]).toBe(mockScaledCoordinates.x);
            expect(capturedCalls[2].data[1]).toBe(mockScaledCoordinates.y);
            expect(capturedCalls[2].data[2]).toBe(mockScaledCoordinates.width);
            expect(capturedCalls[2].data[3]).toBe(mockScaledCoordinates.height);

            expect(capturedCalls[3].name).toBe("strokeStyle");
            expect(capturedCalls[3].data[0]).toBe(originalColor);
        });
    });

    describe("drawNextFrame", () => {
        const createGraphicEngineWithMockScalingResults = (scaledX:number, scaledY:number, scaledWidth:number, scaledHeight:number):IGraphicEngine => {
            const graphicEngine = createGraphicEngine();
            graphicEngine.getScaledDrawPositionsAndDimensions = jest.fn().mockReturnValue({
                x: scaledX,
                y: scaledY,
                width: scaledWidth,
                height: scaledHeight
            });

            return graphicEngine;
        };

        const createAnimationDetails = (frameCoordinates:IFrameCoordinates[], fps = 60, spritesheet?:HTMLImageElement):IAnimationDetails => ({
            spritesheet: spritesheet ?? new Image(0, 0),
            fps,
            drawWidth: 124,
            drawHeight: 145,
            frameCoordinates
        });

        it("should draw a frame on the canvas, with the correct frame position/dimensions, and the correct draw position/dimensions", () => {
            const manager = new ModelAnimationsManager();

            const drawX = 5;
            const drawY = 12;
            const drawWidth = 22;
            const drawHeight = 32;
            const graphicEngine = createGraphicEngineWithMockScalingResults(drawX, drawY, drawWidth, drawHeight);

            const context = document.createElement("canvas").getContext("2d")!;
            context.drawImage = jest.fn();

            const spritesheet = new Image(5 , 10);
            spritesheet.src = "/assets/image1.png";
            const frameCoordinates:IFrameCoordinates[] = [
                { x: 11, y: 22, width: 33, height: 44 },
                { x: 12, y: 23, width: 34, height: 45 }
            ];
            const animation = manager.createAnimation(createAnimationDetails(frameCoordinates, 60, spritesheet));

            const animationName = "test1";
            manager.registerAnimations({
                [animationName]: animation
            });

            manager.precalculateDrawPositionsAndDimensions({ x: 0, y: 0, z: 0, width: 0, height: 0}, graphicEngine);
            manager.drawNextFrame(animationName, context, 60);

            expect(context.drawImage).toHaveBeenCalledTimes(1);
            expect(context.drawImage).toHaveBeenCalledWith(
                spritesheet,
                frameCoordinates[0].x,
                frameCoordinates[0].y,
                frameCoordinates[0].width,
                frameCoordinates[0].height,
                drawX,
                drawY,
                drawWidth,
                drawHeight
            );

            manager.drawNextFrame(animationName, context, 60);

            expect(context.drawImage).toHaveBeenCalledTimes(2);
            expect(context.drawImage).toHaveBeenCalledWith(
                spritesheet,
                frameCoordinates[1].x,
                frameCoordinates[1].y,
                frameCoordinates[1].width,
                frameCoordinates[1].height,
                drawX,
                drawY,
                drawWidth,
                drawHeight
            );
        });

        it.each([
            [5, 0],
            [0, 5],
            [0, 0]
        ])("should not draw a frame if the calculated width or height is 0", (drawWidth:number, drawHeight:number) => {
            const manager = new ModelAnimationsManager();

            const graphicEngine = createGraphicEngineWithMockScalingResults(5, 6, drawWidth, drawHeight);

            const context = document.createElement("canvas").getContext("2d")!;
            context.drawImage = jest.fn();

            const frameCoordinates:IFrameCoordinates[] = [
                { x: 11, y: 22, width: 33, height: 44 }
            ];
            const animation = manager.createAnimation(createAnimationDetails(frameCoordinates));

            const animationName = "test1";
            manager.registerAnimations({
                [animationName]: animation
            });

            manager.precalculateDrawPositionsAndDimensions({ x: 0, y: 0, z: 0, width: 0, height: 0}, graphicEngine);
            manager.drawNextFrame(animationName, context, 60);

            expect(context.drawImage).not.toHaveBeenCalled();
        });

        it("should still trigger a frame-change, even if the image doesn't need to be drawn due to the 0 dimensions", () => {
            const manager = new ModelAnimationsManager();

            const graphicEngine = createGraphicEngineWithMockScalingResults(5, 6, 0, 0);
            const context = document.createElement("canvas").getContext("2d")!;

            const frameCoordinates:IFrameCoordinates[] = [
                { x: 11, y: 22, width: 33, height: 44 },
                { x: 11, y: 22, width: 33, height: 44 }
            ];
            const animation = manager.createAnimation(createAnimationDetails(frameCoordinates, 1));

            const animationName = "test1";
            manager.registerAnimations({
                [animationName]: animation
            });

            manager.precalculateDrawPositionsAndDimensions({ x: 0, y: 0, z: 0, width: 0, height: 0}, graphicEngine);

            expect(animation.currentFrameIndex).toBe(0);
            animation.waitCount = 5; // This tells the manager that it's time to change the frame

            manager.drawNextFrame(animationName, context, 1);

            expect(animation.currentFrameIndex).toBe(1);
        });

        it("should not modify the animation object's timing/frame properties, if it only has one frame", () => {
            const manager = new ModelAnimationsManager();

            const graphicEngine = createGraphicEngineWithMockScalingResults(1, 1, 1, 1);
            const context = document.createElement("canvas").getContext("2d")!;
            context.drawImage = jest.fn();

            const frameCoordinates:IFrameCoordinates[] = [
                { x: 11, y: 22, width: 33, height: 44 }
            ];
            const animation = manager.createAnimation(createAnimationDetails(frameCoordinates, 1));

            const animationName = "test1";
            manager.registerAnimations({
                [animationName]: animation
            });

            manager.precalculateDrawPositionsAndDimensions({ x: 1, y: 1, z: 1, width: 1, height: 1}, graphicEngine);

            manager.drawNextFrame(animationName, context, 1);

            expect(animation.currentFrameIndex).toBe(0);
            expect(animation.waitCount).toBe(0);

            expect(context.drawImage).toHaveBeenCalledWith(
                animation.spritesheet,
                frameCoordinates[0].x,
                frameCoordinates[0].y,
                frameCoordinates[0].width,
                frameCoordinates[0].height,
                1,
                1,
                1,
                1
            );
        });

        it.each([
            [10, 2],
            [5, 1],
            [60, 25]
        ])("should not change to next frame until correct time, when animation fps is less than game fps", (gameFps:number, animationFps:number) => {
            const manager = new ModelAnimationsManager();

            const graphicEngine = createGraphicEngineWithMockScalingResults(1, 1, 1, 1);
            const context = document.createElement("canvas").getContext("2d")!;
            context.drawImage = jest.fn();

            const frameCoordinates:IFrameCoordinates[] = [
                { x: 11, y: 22, width: 33, height: 44 },
                { x: 12, y: 23, width: 34, height: 45 },
                { x: 13, y: 24, width: 35, height: 46 }
            ];
            const animation = manager.createAnimation(createAnimationDetails(frameCoordinates, animationFps));

            const animationName = "test1";
            manager.registerAnimations({
                [animationName]: animation
            });

            manager.precalculateDrawPositionsAndDimensions({ x: 1, y: 1, z: 1, width: 1, height: 1}, graphicEngine);

            // First, confirm the animation frame doesn't change
            const noChangeRunCount = Math.floor(gameFps / animationFps);
            for(let i = 0; i < noChangeRunCount; i++) {
                manager.drawNextFrame(animationName, context, gameFps);

                expect(animation.currentFrameIndex).toBe(0);

                expect(context.drawImage).toHaveBeenCalledWith(
                    animation.spritesheet,
                    frameCoordinates[0].x,
                    frameCoordinates[0].y,
                    frameCoordinates[0].width,
                    frameCoordinates[0].height,
                    1,
                    1,
                    1,
                    1
                );
            }

            // Now run another draw, and we should see the frame change
            manager.drawNextFrame(animationName, context, gameFps);

            expect(animation.currentFrameIndex).toBe(1);
            expect(animation.waitCount).toBe(1);

            expect(context.drawImage).toHaveBeenCalledWith(
                animation.spritesheet,
                frameCoordinates[1].x,
                frameCoordinates[1].y,
                frameCoordinates[1].width,
                frameCoordinates[1].height,
                1,
                1,
                1,
                1
            );
        });

        it.each([
            [1, 5, 5],
            [2, 12, 6],
            [25, 60, 2],
            [45, 75, 1],
            [60, 120, 2]
        ])(
            "should skip the correct amount of frames, when the animation fps is greater than the game fps",
            (gameFps:number, animationFps:number, expectedNextFrameIdx:number) => {
                const manager = new ModelAnimationsManager();

                const graphicEngine = createGraphicEngineWithMockScalingResults(1, 1, 1, 1);
                const context = document.createElement("canvas").getContext("2d")!;
                context.drawImage = jest.fn();

                const frameCoordinates:IFrameCoordinates[] = [
                    { x: 10, y: 20, width: 30, height: 40 },
                    { x: 11, y: 21, width: 31, height: 41 },
                    { x: 12, y: 22, width: 32, height: 42 },
                    { x: 13, y: 23, width: 33, height: 43 },
                    { x: 14, y: 24, width: 34, height: 44 },
                    { x: 15, y: 25, width: 35, height: 45 },
                    { x: 16, y: 26, width: 36, height: 46 },
                    { x: 17, y: 27, width: 37, height: 47 },
                    { x: 18, y: 28, width: 38, height: 48 },
                    { x: 19, y: 29, width: 39, height: 49 },
                ];
                const animation = manager.createAnimation(createAnimationDetails(frameCoordinates, animationFps));

                const animationName = "test1";
                manager.registerAnimations({
                    [animationName]: animation
                });

                manager.precalculateDrawPositionsAndDimensions({ x: 1, y: 1, z: 1, width: 1, height: 1}, graphicEngine);

                manager.drawNextFrame(animationName, context, gameFps);

                expect(animation.currentFrameIndex).toBe(expectedNextFrameIdx);
                expect(animation.waitCount).toBe(1);

                expect(context.drawImage).toHaveBeenCalledWith(
                    animation.spritesheet,
                    frameCoordinates[expectedNextFrameIdx].x,
                    frameCoordinates[expectedNextFrameIdx].y,
                    frameCoordinates[expectedNextFrameIdx].width,
                    frameCoordinates[expectedNextFrameIdx].height,
                    1,
                    1,
                    1,
                    1
                );
            }
        );

        it("should loop frame index back round to 0, once it's gone past the end of the animation", () => {
            const manager = new ModelAnimationsManager();

            const graphicEngine = createGraphicEngineWithMockScalingResults(1, 1, 1, 1);
            const context = document.createElement("canvas").getContext("2d")!;

            const frameCoordinates:IFrameCoordinates[] = [
                { x: 11, y: 22, width: 33, height: 44 },
                { x: 12, y: 23, width: 34, height: 45 }
            ];
            const animation = manager.createAnimation(createAnimationDetails(frameCoordinates, 1));

            const animationName = "test1";
            manager.registerAnimations({
                [animationName]: animation
            });

            manager.precalculateDrawPositionsAndDimensions({ x: 0, y: 0, z: 0, width: 0, height: 0}, graphicEngine);

            expect(animation.currentFrameIndex).toBe(0);

            manager.drawNextFrame(animationName, context, 1);
            manager.drawNextFrame(animationName, context, 1);
            expect(animation.currentFrameIndex).toBe(1); // on 2nd frame

            // Now loop back round to the first frame
            manager.drawNextFrame(animationName, context, 1);

            expect(animation.currentFrameIndex).toBe(0);
            expect(animation.waitCount).toBe(1);

            expect(context.drawImage).toHaveBeenLastCalledWith(
                animation.spritesheet,
                frameCoordinates[0].x,
                frameCoordinates[0].y,
                frameCoordinates[0].width,
                frameCoordinates[0].height,
                1,
                1,
                1,
                1
            );
        });

        it("should call onAnimationEnd and draw last frame, if onAnimationEnd was provided and the animation has gone past its last frame", () => {
            const manager = new ModelAnimationsManager();

            const graphicEngine = createGraphicEngineWithMockScalingResults(1, 1, 1, 1);
            const context = document.createElement("canvas").getContext("2d")!;

            const frameCoordinates:IFrameCoordinates[] = [
                { x: 11, y: 22, width: 33, height: 44 },
                { x: 12, y: 23, width: 34, height: 45 }
            ];
            const animation = manager.createAnimation(createAnimationDetails(frameCoordinates, 1));

            const onAnimationEnd = jest.fn();
            animation.onAnimationEnd = onAnimationEnd;

            const animationName = "test1";
            manager.registerAnimations({
                [animationName]: animation
            });

            manager.precalculateDrawPositionsAndDimensions({ x: 0, y: 0, z: 0, width: 0, height: 0}, graphicEngine);

            expect(animation.currentFrameIndex).toBe(0);

            manager.drawNextFrame(animationName, context, 1);
            manager.drawNextFrame(animationName, context, 1);
            expect(animation.currentFrameIndex).toBe(1); // on 2nd frame
            expect(onAnimationEnd).not.toHaveBeenCalled();

            // Now trigger a draw that takes us past the last frame
            // (the last frame should be drawn, and the onAnimationEnd
            // callback should be triggered)
            manager.drawNextFrame(animationName, context, 1);

            expect(onAnimationEnd).toHaveBeenCalledTimes(1);
            expect(animation.currentFrameIndex).toBe(1);
            expect(animation.waitCount).toBe(1);

            expect(context.drawImage).toHaveBeenCalledTimes(3);
            expect(context.drawImage).toHaveBeenLastCalledWith(
                animation.spritesheet,
                frameCoordinates[1].x,
                frameCoordinates[1].y,
                frameCoordinates[1].width,
                frameCoordinates[1].height,
                1,
                1,
                1,
                1
            );
        });

        it("should trigger onAnimationEnd if callback was provided for a single-frame animation", () => {
            const manager = new ModelAnimationsManager();

            const graphicEngine = createGraphicEngineWithMockScalingResults(1, 1, 1, 1);
            const context = document.createElement("canvas").getContext("2d")!;

            const frameCoordinates:IFrameCoordinates[] = [
                { x: 11, y: 22, width: 33, height: 44 }
            ];
            const animation = manager.createAnimation(createAnimationDetails(frameCoordinates, 1));

            const onAnimationEnd = jest.fn();
            animation.onAnimationEnd = onAnimationEnd;

            const animationName = "test1";
            manager.registerAnimations({
                [animationName]: animation
            });

            manager.precalculateDrawPositionsAndDimensions({ x: 0, y: 0, z: 0, width: 0, height: 0}, graphicEngine);

            // First draw should just draw the frame
            manager.drawNextFrame(animationName, context, 1);
            expect(onAnimationEnd).not.toHaveBeenCalled();

            // The second draw should trigger the onAnimationEnd callback
            manager.drawNextFrame(animationName, context, 1);

            expect(onAnimationEnd).toHaveBeenCalledTimes(1);
            expect(animation.currentFrameIndex).toBe(0);
            expect(animation.waitCount).toBe(1);

            expect(context.drawImage).toHaveBeenCalledTimes(2);
            expect(context.drawImage).toHaveBeenLastCalledWith(
                animation.spritesheet,
                frameCoordinates[0].x,
                frameCoordinates[0].y,
                frameCoordinates[0].width,
                frameCoordinates[0].height,
                1,
                1,
                1,
                1
            );
        });
    });
});