import { initialiseKernel } from "../jest.setup";
import Kernel from "../Kernel";
import TimeHelper from "./TimeHelper";

describe("TimeHelper", () => {
    afterEach(() => {
        Kernel.dropInstance();
        initialiseKernel();
    });

    describe("secondsToFrames", () => {
        it.each([
            [5, 30, 150],
            [2.5, 45, 112],
            [22, 62.75, 1380]
        ])("should calculate the correct amount of frames for the given seconds value, based on the fps", (seconds:number, fps:number, expected:number) => {
            Object.defineProperty(Kernel.getInstance(), "fps", {
                value: fps
            });

            const result = TimeHelper.secondsToFrames(seconds);
            expect(result).toBe(expected);
        });
    });
});