import Camera from "./Camera";
import Frame from "./Frame";
import FrameManager from "./FrameManager";
import GraphicEngine from "./GraphicEngine";
import IGraphicEngine from "./IGraphicEngine";

describe("Frame", () => {
    const createGraphicEngine = ():IGraphicEngine => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        const camera = new Camera(canvas, 0, 0, 0, 0);
        return new GraphicEngine(camera, new FrameManager(), context);
    };

    it.each([
        ["x"],
        ["y"],
        ["width"],
        ["height"]
    ])("should clear the pre-calculated position/dimensions when position or size is changed", (propertyToChange:string) => {
        const initialX = 5;
        const initialY = 10;
        const initialWidth = 50;
        const initialHeight = 100;

        const frame = new Frame(initialX, initialY, initialWidth, initialHeight);

        frame.calculateDrawPositionsAndDimensions(createGraphicEngine());
        
        expect(() => frame.precalculatedDrawPositions).not.toThrow();
        expect(() => frame.precalculatedDrawDimensions).not.toThrow();
        
        (frame as any)[propertyToChange] = 1;

        expect(() => frame.precalculatedDrawPositions).toThrow();
        expect(() => frame.precalculatedDrawDimensions).toThrow();
    });

    it("should set/get the position and dimension properties correctly", () => {
        const initialX = 5;
        const initialY = 10;
        const initialWidth = 50;
        const initialHeight = 100;

        const frame = new Frame(initialX, initialY, initialWidth, initialHeight);

        expect(frame.x).toBe(initialX);
        expect(frame.y).toBe(initialY);
        expect(frame.width).toBe(initialWidth);
        expect(frame.height).toBe(initialHeight);

        const newX = 7;
        const newY = 12;
        const newWidth = 52;
        const newHeight = 102;

        frame.x = newX;
        frame.y = newY;
        frame.width = newWidth;
        frame.height = newHeight;

        expect(frame.x).toBe(newX);
        expect(frame.y).toBe(newY);
        expect(frame.width).toBe(newWidth);
        expect(frame.height).toBe(newHeight);        
    });

    describe("setBackgroundColor", () => {
        it.each([
            ["#ff0000"],
            ["#00ff00"],
            ["#0000ff"]
        ])("should set the background color", (color: string) => {
            const frame = new Frame(0, 0, 0, 0);
            frame.calculateDrawPositionsAndDimensions(createGraphicEngine());

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            frame.setBackgroundColor(color);

            frame.drawBack(context);
            expect(context.fillStyle).toBe(color);
        });
    });

    describe("setBackgroundImage", () => {
        it("should set the background image", () => {
            const frame = new Frame(0, 0, 0, 0);
            frame.calculateDrawPositionsAndDimensions(createGraphicEngine());

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            context.drawImage = jest.fn();

            const image = new Image();
            image.src = "test.png";
            frame.setBackgroundImage(image);

            frame.drawBack(context);
            expect(context.drawImage).toHaveBeenCalledWith(image, expect.anything(), expect.anything(), expect.anything(), expect.anything());
        });
    });

    describe("setLightMaskImage", () => {
        it("should set the light mask image and luminosity", () => {
            const frame = new Frame(0, 0, 0, 0);
            frame.calculateDrawPositionsAndDimensions(createGraphicEngine());

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            context.drawImage = jest.fn();

            // The luminosity value is drawn using the globalAlpha property.
            // We need to use a setter to check this is set, as it gets reset
            // afterwards
            const capturedGlobalAlphas:number[] = [];
            Object.defineProperty(context, "globalAlpha", {
                set:(v:number) => capturedGlobalAlphas.push(v)
            });

            const image = new Image();
            image.src = "test.png";

            frame.setLightMaskImage(image, 0.4);

            frame.drawFront(context);
            expect(context.drawImage).toHaveBeenCalledWith(image, expect.anything(), expect.anything(), expect.anything(), expect.anything());
            expect(capturedGlobalAlphas).toContain(0.6);
        });
    });

    describe("calculateDrawPositionsAndDimensions", () => {
        it("should calculate pixel values using the unit values provided in the constructor", () => {
            const initialX = 5;
            const initialY = 10;
            const initialWidth = 50;
            const initialHeight = 100;

            const frame = new Frame(initialX, initialY, initialWidth, initialHeight);

            // We don't actually need to test the calculations. We just need to confirm
            // that the values are passed to the GraphicEngine's getUnscaledDrawPositionsAndDimensions
            // method, and that the result values are set in the frame.
            const mockPixelValues = { x: 1, y: 2, width: 3, height: 4 };
            const graphicEngine = createGraphicEngine();
            graphicEngine.getUnscaledDrawPositionsAndDimensions = jest.fn().mockReturnValue(mockPixelValues);

            frame.calculateDrawPositionsAndDimensions(graphicEngine);

            expect(graphicEngine.getUnscaledDrawPositionsAndDimensions).toHaveBeenCalledTimes(1);
            expect(graphicEngine.getUnscaledDrawPositionsAndDimensions).toHaveBeenCalledWith({
                x: initialX,
                y: initialY,
                width: initialWidth,
                height: initialHeight
            });

            const positionPixelValues = frame.precalculatedDrawPositions;
            expect(positionPixelValues.x).toBe(mockPixelValues.x);
            expect(positionPixelValues.y).toBe(mockPixelValues.y);

            const dimensionPixelValues = frame.precalculatedDrawDimensions;
            expect(dimensionPixelValues.width).toBe(mockPixelValues.width);
            expect(dimensionPixelValues.height).toBe(mockPixelValues.height);
        });

        it("should calculate pixel values using the set unit values", () => {
            const initialX = 5;
            const initialY = 10;
            const initialWidth = 50;
            const initialHeight = 100;

            const frame = new Frame(0, 0, 0, 0);
            frame.x = initialX;
            frame.y = initialY;
            frame.width = initialWidth;
            frame.height = initialHeight;

            // We don't actually need to test the calculations. We just need to confirm
            // that the values are passed to the GraphicEngine's getUnscaledDrawPositionsAndDimensions
            // method, and that the result values are set in the frame.
            const mockPixelValues = { x: 1, y: 2, width: 3, height: 4 };
            const graphicEngine = createGraphicEngine();
            graphicEngine.getUnscaledDrawPositionsAndDimensions = jest.fn().mockReturnValue(mockPixelValues);

            frame.calculateDrawPositionsAndDimensions(graphicEngine);

            expect(graphicEngine.getUnscaledDrawPositionsAndDimensions).toHaveBeenCalledTimes(1);
            expect(graphicEngine.getUnscaledDrawPositionsAndDimensions).toHaveBeenCalledWith({
                x: initialX,
                y: initialY,
                width: initialWidth,
                height: initialHeight
            });

            const positionPixelValues = frame.precalculatedDrawPositions;
            expect(positionPixelValues.x).toBe(mockPixelValues.x);
            expect(positionPixelValues.y).toBe(mockPixelValues.y);

            const dimensionPixelValues = frame.precalculatedDrawDimensions;
            expect(dimensionPixelValues.width).toBe(mockPixelValues.width);
            expect(dimensionPixelValues.height).toBe(mockPixelValues.height);
        });
    });

    describe("drawFront", () => {
        it("should not attempt to draw if no lightmask has been set", () => {
            const frame = new Frame(1, 1, 1, 1);
            frame.calculateDrawPositionsAndDimensions(createGraphicEngine());

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            context.drawImage = jest.fn();
            
            frame.drawFront(context);

            expect(context.drawImage).not.toHaveBeenCalled();
            expect(context.globalAlpha).toBe(1); // This shouldn't be changed at any point, in this scenario
        });

        it("should draw the lightmask with the precalculated positions/dimensions", () => {
            const initialX = 5;
            const initialY = 10;
            const initialWidth = 50;
            const initialHeight = 100;

            const frame = new Frame(initialX, initialY, initialWidth, initialHeight);

            const mockCalculatedValues = { x: 12, y: 24, width: 48, height: 96 };
            const graphicEngine = createGraphicEngine();
            graphicEngine.getUnscaledDrawPositionsAndDimensions = jest.fn().mockReturnValue(mockCalculatedValues);
            frame.calculateDrawPositionsAndDimensions(graphicEngine);

            const image = new Image();
            image.src = "image.png";
            frame.setLightMaskImage(image, 1);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            context.drawImage = jest.fn();

            frame.drawFront(context);

            expect(context.drawImage).toHaveBeenCalledTimes(1);
            expect(context.drawImage).toHaveBeenCalledWith(
                image,
                mockCalculatedValues.x,
                mockCalculatedValues.y,
                mockCalculatedValues.width,
                mockCalculatedValues.height
            );
        });

        it.each([
            [1],
            [0],
            [0.5],
            [0.56]
        ])("should set the luminosity before drawing the lightmask, then reset it afterwards", (luminosity:number) => {
            const frame = new Frame(0, 0, 0, 0);
            frame.calculateDrawPositionsAndDimensions(createGraphicEngine());

            const image = new Image();
            image.src = "image.png";
            frame.setLightMaskImage(image, luminosity);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            // We want to ensure the methods and property-setters are called in the right order,
            // so we're going to capture details about the calls in this array
            const capturedMethodCalls:{method:string,params:any[]}[] = [];

            context.drawImage = jest.fn().mockImplementation(() => capturedMethodCalls.push({ method: "drawImage", params: [] }));
            Object.defineProperty(context, "globalAlpha", {
                set: (v) => capturedMethodCalls.push({ method: "globalAlpha", params: [v] })
            });

            frame.drawFront(context);

            // Ensure the calls to methods/setters were called in right order
            expect(capturedMethodCalls.length).toBe(3);
            expect(capturedMethodCalls[0].method).toBe("globalAlpha");
            expect(capturedMethodCalls[0].params[0]).toBe(1 - luminosity);
            expect(capturedMethodCalls[1].method).toBe("drawImage");
            expect(capturedMethodCalls[2].method).toBe("globalAlpha");
            expect(capturedMethodCalls[2].params[0]).toBe(1); // The alpha should be reset
        });
    });

    describe("drawBack", () => {
        it("should not draw backgrounds if no image or color are set", () => {
            const frame = new Frame(0, 0, 0, 0);
            frame.calculateDrawPositionsAndDimensions(createGraphicEngine());

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            context.fillRect = jest.fn();
            context.drawImage = jest.fn();

            frame.drawBack(context);

            expect(context.fillRect).not.toHaveBeenCalled();
            expect(context.drawImage).not.toHaveBeenCalled();
        });

        it("should draw only the color if no background image is provided", () => {
            const initialX = 5;
            const initialY = 10;
            const initialWidth = 50;
            const initialHeight = 100;
            const frame = new Frame(initialX, initialY, initialWidth, initialHeight);

            frame.calculateDrawPositionsAndDimensions(createGraphicEngine());
            const calculatedPositions = frame.precalculatedDrawPositions;
            const calculatedDimensions = frame.precalculatedDrawDimensions;

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            context.fillStyle = "#ff0000";
            context.drawImage = jest.fn();

            // We want to ensure the methods and property-setters are called in the right order,
            // so we're going to capture details about the calls in this array
            const capturedMethodCalls:{method:string,params:any[]}[] = [];

            context.fillRect = jest.fn().mockImplementation(() => capturedMethodCalls.push({ method: "fillRect", params: [] }));
            Object.defineProperty(context, "fillStyle", {
                set: (v) => capturedMethodCalls.push({ method: "fillStyle", params: [v] })
            });

            const expectedColor = "#99ff99";
            frame.setBackgroundColor(expectedColor);

            frame.drawBack(context);

            expect(context.drawImage).not.toHaveBeenCalled();
            expect(context.fillRect).toHaveBeenCalledTimes(1);
            expect(context.fillRect).toHaveBeenCalledWith(
                calculatedPositions.x,
                calculatedPositions.y,
                calculatedDimensions.width,
                calculatedDimensions.height
            );

            // Make sure the fillStyle was set before the rectangle was drawn
            expect(capturedMethodCalls.length).toBe(2);
            expect(capturedMethodCalls[0].method).toBe("fillStyle");
            expect(capturedMethodCalls[0].params[0]).toBe(expectedColor);
            expect(capturedMethodCalls[1].method).toBe("fillRect");
        });

        it("should draw only the image if no background color is provided", () => {
            const initialX = 5;
            const initialY = 10;
            const initialWidth = 50;
            const initialHeight = 100;
            const frame = new Frame(initialX, initialY, initialWidth, initialHeight);

            const mockCalculatedValues = { x: 12, y: 24, width: 48, height: 96 };
            const graphicEngine = createGraphicEngine();
            graphicEngine.getUnscaledDrawPositionsAndDimensions = jest.fn().mockReturnValue(mockCalculatedValues);
            frame.calculateDrawPositionsAndDimensions(graphicEngine);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            context.fillRect = jest.fn();
            context.drawImage = jest.fn();

            const image = new Image();
            image.src = "image.png";
            frame.setBackgroundImage(image);

            frame.drawBack(context);

            expect(context.fillRect).not.toHaveBeenCalled();
            expect(context.drawImage).toHaveBeenCalledTimes(1);
            expect(context.drawImage).toHaveBeenCalledWith(
                image,
                mockCalculatedValues.x,
                mockCalculatedValues.y,
                mockCalculatedValues.width,
                mockCalculatedValues.height
            );
        });

        it("should draw both image and color if both provided", () => {
            const initialX = 5;
            const initialY = 10;
            const initialWidth = 50;
            const initialHeight = 100;
            const frame = new Frame(initialX, initialY, initialWidth, initialHeight);

            const mockCalculatedValues = { x: 12, y: 24, width: 48, height: 96 };
            const graphicEngine = createGraphicEngine();
            graphicEngine.getUnscaledDrawPositionsAndDimensions = jest.fn().mockReturnValue(mockCalculatedValues);
            frame.calculateDrawPositionsAndDimensions(graphicEngine);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            context.fillRect = jest.fn();
            context.drawImage = jest.fn();

            const expectedColor = "#99ff99";
            frame.setBackgroundColor(expectedColor);

            const image = new Image();
            image.src = "image.png";
            frame.setBackgroundImage(image);

            frame.drawBack(context);

            expect(context.fillStyle).toBe(expectedColor);
            expect(context.fillRect).toHaveBeenCalledTimes(1);
            expect(context.fillRect).toHaveBeenCalledWith(
                mockCalculatedValues.x,
                mockCalculatedValues.y,
                mockCalculatedValues.width,
                mockCalculatedValues.height
            );

            expect(context.drawImage).toHaveBeenCalledTimes(1);
            expect(context.drawImage).toHaveBeenCalledWith(
                image,
                mockCalculatedValues.x,
                mockCalculatedValues.y,
                mockCalculatedValues.width,
                mockCalculatedValues.height
            );
        });
    });
});