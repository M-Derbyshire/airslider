import Camera from "./Camera";
import Frame from "./Frame";
import FrameManager from "./FrameManager";
import GraphicEngine from "./GraphicEngine";
import IFrame from "./IFrame";

describe("FrameManager", () => {
    const createFrame = (onDrawBackCalback:()=>void, onDrawFrontCalback:()=>void, onPrepareHandler:()=>void):IFrame => {
        const frame = new Frame(0, 0, 10, 10);
        frame.drawBack = onDrawBackCalback;
        frame.drawFront = onDrawFrontCalback;
        frame.calculateDrawPositionsAndDimensions = onPrepareHandler;

        Object.defineProperties(frame, {
            precalculatedDrawPositions: {
                value: { x: 0, y: 0 },
                configurable: true
            },
            precalculatedDrawDimensions: {
                value: { width: 0, height: 0 },
                configurable: true
            }
        });

        return frame;
    };

    const createGraphicEngine = (frameManager:FrameManager) => {
        const canvas = document.createElement("canvas");
        const camera = new Camera(canvas, 0, 0, 0, 0);
        camera.isOnCamera = jest.fn().mockReturnValue(true);

        return new GraphicEngine(camera, frameManager, canvas.getContext("2d")!);
    };

    describe("setFrames", () => {
        it("should add the frames to the manager", () => {
            const manager = new FrameManager();

            const frame1Prepare = jest.fn();
            const frame2Prepare = jest.fn();
            const frames = [
                createFrame(jest.fn(), jest.fn(), frame1Prepare),
                createFrame(jest.fn(), jest.fn(), frame2Prepare)
            ];

            manager.setFrames(frames);

            // check has been stored
            manager.prepareFramesForDrawing(createGraphicEngine(manager));

            expect(frame1Prepare).toHaveBeenCalledTimes(1);
            expect(frame2Prepare).toHaveBeenCalledTimes(1);
        });

        it("should clear the list of frames that are prepared for drawing", () => {
            const manager = new FrameManager();
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            const frame1DrawBack = jest.fn();
            const initialFrames = [
                createFrame(frame1DrawBack, jest.fn(), jest.fn())
            ];

            manager.setFrames(initialFrames);
            manager.prepareFramesForDrawing(createGraphicEngine(manager));

            const newFrames = [
                createFrame(jest.fn(), jest.fn(), jest.fn())
            ];

            manager.setFrames(newFrames);

            // The original frame shoukd not have its draw method called
            manager.drawFramesBack(context);
            expect(frame1DrawBack).not.toHaveBeenCalled();
        });
    });

    describe("prepareFramesForDrawing", () => {
        it("should run calculateDrawPositionsAndDimensions on each frame, before setting them to be drawn if they are on camera", () => {
            const manager = new FrameManager();
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            // We want to ensure that the frames will get calculated values, once they've been
            // prepared (we only set these values after they've had calculateDrawPositionsAndDimensions
            // called, to ensure that the method is called before the isOnCamera check)
            const frame1Prepare = jest.fn();
            const frame1DrawBack = jest.fn();
            const frame2Prepare = jest.fn();
            const frame2DrawBack = jest.fn();
            const frame3Prepare = jest.fn();
            const frame3DrawBack = jest.fn();

            const frame1 = createFrame(frame1DrawBack, jest.fn(), frame1Prepare);
            const frame2 = createFrame(frame2DrawBack, jest.fn(), frame2Prepare);
            const frame3 = createFrame(frame3DrawBack, jest.fn(), frame3Prepare);

            const frame1CalcValues = { x: 1, y: 2, width: 3, height: 4 };
            frame1Prepare.mockImplementation(() => {
                Object.defineProperties(frame1, {
                    precalculatedDrawPositions: {
                        value: frame1CalcValues
                    },
                    precalculatedDrawDimensions: {
                        value: frame1CalcValues
                    }
                });
            });

            const frame2CalcValues = { x: 5, y: 6, width: 7, height: 8 };
            frame2Prepare.mockImplementation(() => {
                Object.defineProperties(frame2, {
                    precalculatedDrawPositions: {
                        value: frame2CalcValues
                    },
                    precalculatedDrawDimensions: {
                        value: frame2CalcValues
                    }
                });
            });

            const frame3CalcValues = { x: 9, y: 10, width: 11, height: 12 };
            frame3Prepare.mockImplementation(() => {
                Object.defineProperties(frame3, {
                    precalculatedDrawPositions: {
                        value: frame3CalcValues
                    },
                    precalculatedDrawDimensions: {
                        value: frame3CalcValues
                    }
                });
            });

            const frames = [
                frame1,
                frame2,
                frame3,
            ];

            manager.setFrames(frames);

            // We want to ensure we return true for the isOnCamera method, but
            // we want to return false for the second frame (to ensure it doesn't
            // get added to the list of frames that should be drawn)
            const camera = new Camera(canvas, 0, 0, 0, 0);
            camera.isOnCamera = jest.fn().mockImplementation((x:number, y:number, width:number, height: number) => {
                if(x === 5)
                    return false; // The second frame should be off camera

                return true;
            });

            const graphicEngine = new GraphicEngine(camera, manager, context);

            // Now we want to ensure that all frames have calculateDrawPositionsAndDimensions called,
            // and that the calculated values are then used to confirm they are on camera
            manager.prepareFramesForDrawing(graphicEngine);

            expect(frame1Prepare).toHaveBeenCalledTimes(1);
            expect(frame2Prepare).toHaveBeenCalledTimes(1);
            expect(frame3Prepare).toHaveBeenCalledTimes(1);

            expect(camera.isOnCamera).toHaveBeenCalledTimes(3);
            expect(camera.isOnCamera).toHaveBeenCalledWith(frame1CalcValues.x, frame1CalcValues.y, frame1CalcValues.width, frame1CalcValues.height);
            expect(camera.isOnCamera).toHaveBeenCalledWith(frame2CalcValues.x, frame2CalcValues.y, frame2CalcValues.width, frame2CalcValues.height);
            expect(camera.isOnCamera).toHaveBeenCalledWith(frame3CalcValues.x, frame3CalcValues.y, frame3CalcValues.width, frame3CalcValues.height);

            // Now we want to confirm that the frames that are on camera were added to the list of
            // frames to be drawn (and that the frame that wasn't on camera was not)
            manager.drawFramesBack(context);

            expect(frame1DrawBack).toHaveBeenCalledTimes(1);
            expect(frame2DrawBack).not.toHaveBeenCalled();
            expect(frame3DrawBack).toHaveBeenCalledTimes(1);
        });
    });

    describe("drawFramesBack", () => {
        it("should call the drawBack method on each frame, in the order they were provided", () => {
            const manager = new FrameManager();
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            // We want to ensure they are triggered in the right order,
            // so going to capture the name of each frame in this array.
            // (if the methods were called in the right order, then this
            // array should be in the right order)
            const capturedMethodCalls:number[] = [];

            const frame1DrawBack = jest.fn().mockImplementation(() => capturedMethodCalls.push(0));
            const frame2DrawBack = jest.fn().mockImplementation(() => capturedMethodCalls.push(1));
            const frame3DrawBack = jest.fn().mockImplementation(() => capturedMethodCalls.push(2));

            const frames = [
                createFrame(frame1DrawBack, jest.fn(), jest.fn()),
                createFrame(frame2DrawBack, jest.fn(), jest.fn()),
                createFrame(frame3DrawBack, jest.fn(), jest.fn())
            ];

            manager.setFrames(frames);
            manager.prepareFramesForDrawing(createGraphicEngine(manager));

            manager.drawFramesBack(context);

            expect(frame1DrawBack).toHaveBeenCalledTimes(1);
            expect(frame1DrawBack).toHaveBeenCalledWith(context);
            expect(frame2DrawBack).toHaveBeenCalledTimes(1);
            expect(frame2DrawBack).toHaveBeenCalledWith(context);
            expect(frame3DrawBack).toHaveBeenCalledTimes(1);
            expect(frame3DrawBack).toHaveBeenCalledWith(context);

            // Now ensure they were called in the correct order
            expect(capturedMethodCalls.length).toBe(3);
            capturedMethodCalls.forEach((val:number, idx:number) => expect(val).toBe(idx));
        });
    });

    describe("drawFramesFront", () => {
        it("should call the drawFront method on each frame, in the order they were provided", () => {
            const manager = new FrameManager();
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            // We want to ensure they are triggered in the right order,
            // so going to capture the name of each frame in this array.
            // (if the methods were called in the right order, then this
            // array should be in the right order)
            const capturedMethodCalls:number[] = [];

            const frame1DrawFront = jest.fn().mockImplementation(() => capturedMethodCalls.push(0));
            const frame2DrawFront = jest.fn().mockImplementation(() => capturedMethodCalls.push(1));
            const frame3DrawFront = jest.fn().mockImplementation(() => capturedMethodCalls.push(2));

            const frames = [
                createFrame(jest.fn(), frame1DrawFront, jest.fn()),
                createFrame(jest.fn(), frame2DrawFront, jest.fn()),
                createFrame(jest.fn(), frame3DrawFront, jest.fn())
            ];

            manager.setFrames(frames);
            manager.prepareFramesForDrawing(createGraphicEngine(manager));

            manager.drawFramesFront(context);

            expect(frame1DrawFront).toHaveBeenCalledTimes(1);
            expect(frame1DrawFront).toHaveBeenCalledWith(context);
            expect(frame2DrawFront).toHaveBeenCalledTimes(1);
            expect(frame2DrawFront).toHaveBeenCalledWith(context);
            expect(frame3DrawFront).toHaveBeenCalledTimes(1);
            expect(frame3DrawFront).toHaveBeenCalledWith(context);

            // Now ensure they were called in the correct order
            expect(capturedMethodCalls.length).toBe(3);
            capturedMethodCalls.forEach((val:number, idx:number) => expect(val).toBe(idx));
        });
    });
});