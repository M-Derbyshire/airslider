import Camera from "../../engines/GraphicEngine/Camera";
import LinearVanishingPointStrategy from "./strategies/LinearVanishingPointStrategy";
import ZCalc from "./ZCalc";

describe("ZCalc", () => {
    afterEach(() => {
        ZCalc.setStrategy(undefined);
    });

    const callZCalcGetDrawValues = () => {
        const canvas = document.createElement("canvas");

        ZCalc.getDrawValues(
            new Camera(canvas, 0, 0, 0, 0),
            { x: 0, y: 0, width: 0, height: 0 },
            0
        );
    };

    describe("setStrategy", () => {
        it("should set the strategy of the ZCalc", () => {
            const strategy1 = new LinearVanishingPointStrategy();
            strategy1.getDrawValues = jest.fn();
            const strategy2 = new LinearVanishingPointStrategy();
            strategy2.getDrawValues = jest.fn();
            
            ZCalc.setStrategy(strategy1);
            callZCalcGetDrawValues();

            expect(strategy1.getDrawValues).toHaveBeenCalledTimes(1);
            expect(strategy2.getDrawValues).not.toHaveBeenCalled();

            // Now change the strategy
            ZCalc.setStrategy(strategy2);
            callZCalcGetDrawValues();

            expect(strategy1.getDrawValues).toHaveBeenCalledTimes(1); // just the original call
            expect(strategy2.getDrawValues).toHaveBeenCalledTimes(1);
        });

        it ("should remove the strategy", () => {
            const strategy = new LinearVanishingPointStrategy();
            strategy.getDrawValues = jest.fn();
            
            ZCalc.setStrategy(strategy);
            callZCalcGetDrawValues();

            expect(strategy.getDrawValues).toHaveBeenCalledTimes(1);

            ZCalc.setStrategy(undefined);
            callZCalcGetDrawValues();

            expect(strategy.getDrawValues).toHaveBeenCalledTimes(1); // just the original call
        });
    });

    describe("getDrawValues", () => {
        it.each([
            [42, true],
            [442, false],
            [100, undefined]
        ])(
            "should call the getDrawValues method on the set strategy, with the given parameters, and return the result", 
            (zPosition: number, showNegative: boolean|undefined) => {
                const expectedResults = {
                    x: 42,
                    y: 43,
                    width: 44,
                    height: 45
                };

                const canvas = document.createElement("canvas");
                const camera = new Camera(canvas, 1, 2, 3, 4);
                const pixelValues = { x: 5, y: 6, width: 7, height: 8 };

                const strategy = new LinearVanishingPointStrategy();
                strategy.getDrawValues = jest.fn().mockReturnValue(expectedResults);

                ZCalc.setStrategy(strategy);

                const result = ZCalc.getDrawValues(
                    camera,
                    pixelValues,
                    zPosition,
                    showNegative
                );

                expect(strategy.getDrawValues).toHaveBeenCalledTimes(1);
                expect(strategy.getDrawValues).toHaveBeenCalledWith(camera, pixelValues, zPosition, showNegative);

                expect(result).toBe(expectedResults);
            }
        );

        it("should return the given pixel values unchanged, if strategy is not set", () => {
            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 0, 0, 0, 0);

            const expectedPixelValues = { x: 5, y: 6, width: 7, height: 7 };

            const result = ZCalc.getDrawValues(camera, expectedPixelValues, 100);

            expect(result).toEqual(expectedPixelValues);
        });
    });
});