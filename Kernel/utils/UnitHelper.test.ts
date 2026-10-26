import { initialiseKernel } from "../jest.setup";
import Kernel from "../Kernel";
import UnitHelper from "./UnitHelper";

describe("UnitHelper", () => {
    afterEach(() => {
        Kernel.dropInstance();
        initialiseKernel();
    });

    describe("xUnitsToPixels", () => {
        it.each([
            [502, 1000, 1024, 514.048],
            [257, 800, 768, 246.72],
            [1, 500, 1920, 3.84],
            [0, 1000, 1024, 0],
            [10, 1000, 1000, 10],
            [1000, 1000, 1024, 1024],
            [505, 500, 1024, 1034.24]
        ])(
            "should generate the correct pixel value for the given units value, based on the camera pixel size",
            (units:number, unitsWithinCamera:number, cameraSizePixels:number, expected:number) => {
                const kernel = Kernel.getInstance();

                kernel.settings.unitsWithinCameraX = unitsWithinCamera;
                Object.defineProperty(kernel.graphicEngine.camera, "canvasPositionWidth", {
                    value: cameraSizePixels
                });

                const result = UnitHelper.xUnitsToPixels(units);

                expect(result).toBe(expected);
            }
        );
    });

    describe("yUnitsToPixels", () => {
        it.each([
            [160, 500, 768, 245.76],
            [122, 400, 412, 125.66],
            [1, 500, 768, 1.536],
            [0, 768, 1024, 0],
            [10, 768, 768, 10],
            [1000, 1000, 768, 768],
            [505, 500, 1024, 1034.24]
        ])(
            "should generate the correct pixel value for the given units value, based on the camera pixel size",
            (units:number, unitsWithinCamera:number, cameraSizePixels:number, expected:number) => {
                const kernel = Kernel.getInstance();

                kernel.settings.unitsWithinCameraY = unitsWithinCamera;
                Object.defineProperty(kernel.graphicEngine.camera, "canvasPositionHeight", {
                    value: cameraSizePixels
                });

                const result = UnitHelper.yUnitsToPixels(units);

                expect(result).toBe(expected);
            }
        );
    });

    describe("consistentSpeed", () => {
        it.each([
            [12, 62.5, 0.192],
            [55.5, 2, 27.75],
            [30, 75, 0.4],
            [30, 30, 1],
            [45, 30, 1.5]
        ])("should return a new speed based on the current fps", (originalSpeed:number, fps:number, expected:number) => {
            Object.defineProperty(Kernel.getInstance(), "fps", {
                value: fps
            });

            const result = UnitHelper.consistentSpeed(originalSpeed);

            expect(result).toBe(expected);
        });
    });
});