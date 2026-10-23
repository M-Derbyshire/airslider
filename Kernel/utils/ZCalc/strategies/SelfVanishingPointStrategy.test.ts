import Camera from "../../../engines/GraphicEngine/Camera";
import LinearVanishingPointStrategy from "./LinearVanishingPointStrategy";
import SelfVanishingPointStrategy from "./SelfVanishingPointStrategy";

describe("SelfVanishingPointStrategy", () => {
    it("should get vanishingPointDepth property from linear strategy", () => {
        const linearStrategy = new LinearVanishingPointStrategy();
        const strategy = new SelfVanishingPointStrategy(linearStrategy);

        const depth1 = 1001;
        linearStrategy.setVanishPoint(5, 10, depth1);
        expect(strategy.vanishingPointDepth).toBe(depth1);

        const depth2 = 2002;
        linearStrategy.setVanishPoint(5, 10, depth2);
        expect(strategy.vanishingPointDepth).toBe(depth2);
    });

    it("should set the vanishing point depth of the linear strategy, using the setVanishPoint method", () => {
        const linearStrategy = new LinearVanishingPointStrategy();
        const strategy = new SelfVanishingPointStrategy(linearStrategy);

        linearStrategy.setVanishPoint = jest.fn();
        const expectedDeph = 1235;

        strategy.vanishingPointDepth = expectedDeph;

        expect(linearStrategy.setVanishPoint).toHaveBeenCalledTimes(1);
        expect(linearStrategy.setVanishPoint).toHaveBeenCalledWith(0, 0, expectedDeph);
    });

    describe("getDrawValues", () => {
        it.each([
            [10, true],
            [12, false],
            [13, undefined]
        ])(
            "should get the dimension values from the linear strategy's getDrawDimensionValues method, and return in result", 
            (zPosition:number, showNegative: boolean|undefined) => {
                const linearStrategy = new LinearVanishingPointStrategy();
                const strategy = new SelfVanishingPointStrategy(linearStrategy);

                const expectedDimensions = { width: 7, height: 27 };
                linearStrategy.getDrawDimensionValues = jest.fn().mockReturnValue(expectedDimensions);

                const canvas = document.createElement("canvas");
                const camera = new Camera(canvas, 1, 2, 3, 4);
                const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

                const result = strategy.getDrawValues(camera, pixelValues, zPosition, showNegative);

                expect(linearStrategy.getDrawDimensionValues).toHaveBeenCalledTimes(1);
                expect(linearStrategy.getDrawDimensionValues).toHaveBeenCalledWith(camera, pixelValues, zPosition, showNegative);

                expect(result.width).toBe(expectedDimensions.width);
                expect(result.height).toBe(expectedDimensions.height);
            }
        );

        it("should not call the linear strategy's getDrawPositionValues method", () => {
            const linearStrategy = new LinearVanishingPointStrategy();
            const strategy = new SelfVanishingPointStrategy(linearStrategy);

            linearStrategy.getDrawPositionValues = jest.fn();

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

            strategy.getDrawValues(camera, pixelValues, 5, true);

            expect(linearStrategy.getDrawPositionValues).not.toHaveBeenCalled();
        });

        it.each([
            [10, 20, 100, 200, 75, 175, 22.5, 32.5],
            [0, 0, 100, 200, 50, 100, 25, 50],
            [1, 101, 207, 305, 98, 99, 55.5, 204],
            [-5, -2, 10, 20, 5, 17, -2.5, -0.5]
        ])(
            "should use the calculated dimensions to determine the correct new position values",
            (
                pixelsX:number,
                pixelsY:number,
                pixelsWidth:number,
                pixelsHeight:number,
                calculatedWidth:number,
                calculatedHeight:number,
                expectedX:number,
                expectedY:number
            ) => {
                const linearStrategy = new LinearVanishingPointStrategy();
                const strategy = new SelfVanishingPointStrategy(linearStrategy);

                linearStrategy.getDrawDimensionValues = jest.fn().mockReturnValue({ width: calculatedWidth, height: calculatedHeight });

                const canvas = document.createElement("canvas");
                const camera = new Camera(canvas, 1, 2, 3, 4);
                const pixelValues = { x: pixelsX, y: pixelsY, width: pixelsWidth, height: pixelsHeight };

                const result = strategy.getDrawValues(camera, pixelValues, 0);

                expect(result.x).toBe(expectedX);
                expect(result.y).toBe(expectedY);
            }
        );
    });

    describe("getDrawPositionValues", () => {
        it("should throw the expected error", () => {
            const linearStrategy = new LinearVanishingPointStrategy();
            const strategy = new SelfVanishingPointStrategy(linearStrategy);

            const expectedErrMsg = "The getDrawPositionValues method of the SelfVanishingPointStrategy class has not been implemented. You should use the getDrawValues method instead";
            const expectedErr = new Error(expectedErrMsg);

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 0, y: 0 };

            expect(() => strategy.getDrawPositionValues(camera, pixelValues, 10)).toThrow(expectedErr);
        });
    });

    describe("getDrawDimensionValues", () => {
        it.each([
            [1, true],
            [2, false],
            [33, undefined]
        ])(
            "should pass the given values to the linear strategy's getDrawDimensionValues method, and return the results",
            (zPosition:number, showNegative:boolean|undefined) => {
                const linearStrategy = new LinearVanishingPointStrategy();
                const strategy = new SelfVanishingPointStrategy(linearStrategy);

                const expectedDimensions = { width: 32, height: 64 };
                linearStrategy.getDrawDimensionValues = jest.fn().mockReturnValue(expectedDimensions);

                const canvas = document.createElement("canvas");
                const camera = new Camera(canvas, 1, 2, 3, 4);
                const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

                const result = strategy.getDrawDimensionValues(camera, pixelValues, zPosition, showNegative);

                expect(linearStrategy.getDrawDimensionValues).toHaveBeenCalledTimes(1);
                expect(linearStrategy.getDrawDimensionValues).toHaveBeenCalledWith(camera, pixelValues, zPosition, showNegative);

                expect(result.width).toBe(expectedDimensions.width);
                expect(result.height).toBe(expectedDimensions.height);
            }
        );
    });
});