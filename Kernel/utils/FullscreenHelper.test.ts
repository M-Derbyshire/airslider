import { initialiseKernel } from "../jest.setup";
import Kernel from "../Kernel";
import FullscreenHelper from "./FullscreenHelper";

describe("FullscreenHelper", () => {
    const enableFullscreenFeature = () => {
        Kernel.dropInstance();
        initialiseKernel();

        Kernel.getInstance().settings.isFullscreenEnabled = true;
        Kernel.getInstance().canvasContext.canvas.requestFullscreen = jest.fn();
        Object.defineProperty(document, "fullscreenEnabled", {
            value: true,
            configurable: true
        });
    };

    const setCurrentFullscreenElement = (val:any) => {
        Object.defineProperty(document, "fullscreenElement", {
            value: val,
            configurable: true
        });
    };

    beforeEach(() => {
        enableFullscreenFeature();
        setCurrentFullscreenElement(undefined);
    });

    afterAll(() => {
        enableFullscreenFeature();
        setCurrentFullscreenElement(undefined);
    });

    describe("isFeatureAvailable", () => {
        it("should return true if feature is enabled in game settings, and the browser provides the feature", () => {
            // See beforeEach for the enabling of the feature
            expect(FullscreenHelper.isFeatureAvailable()).toBe(true);
        });

        it("should return false if feature is not enabled in game settings", () => {
            Kernel.getInstance().settings.isFullscreenEnabled = false;

            expect(FullscreenHelper.isFeatureAvailable()).toBe(false);
        });

        it("should return false if canvas element doesnt provide requestFullscreen method", () => {
            (Kernel.getInstance().canvasContext.canvas as any).requestFullscreen = undefined;

            expect(FullscreenHelper.isFeatureAvailable()).toBe(false);
        });

        it("should return false if canvas context not set in Kernel instance", () => {
            Object.defineProperty(Kernel.getInstance(), "canvasContext", {
                value: undefined,
                configurable: true
            });

            expect(FullscreenHelper.isFeatureAvailable()).toBe(false);
        });

        it("should return false if not enabled on document object", () => {
            Object.defineProperty(document, "fullscreenEnabled", {
                value: false,
                configurable: true
            });

            expect(FullscreenHelper.isFeatureAvailable()).toBe(false);
        });
    });

    describe("isFullscreen", () => {
        it("should return true if the current fullscreen element is the game's canvas", () => {
            setCurrentFullscreenElement(Kernel.getInstance().canvasContext.canvas);            

            expect(FullscreenHelper.isFullscreen()).toBe(true);
        });

        it("should return false if the current fullscreen element is not the game's canvas", () => {
            const otherCanvas = document.createElement("canvas");
            setCurrentFullscreenElement(otherCanvas); 

            expect(FullscreenHelper.isFullscreen()).toBe(false);
        });

        it("should return false if no element is set as the current fullscreen element", () => {
            setCurrentFullscreenElement(undefined); 

            expect(FullscreenHelper.isFullscreen()).toBe(false);
        });
    });

    describe("toggleFullscreen", () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should not toggle fullscreen mode if the feature is not available", () => {
            const isAvailableSpy = jest.spyOn(FullscreenHelper, "isFeatureAvailable");
            const canvas = Kernel.getInstance().canvasContext.canvas;

            isAvailableSpy.mockReturnValue(false);
            document.exitFullscreen = jest.fn();
            canvas.requestFullscreen = jest.fn();

            FullscreenHelper.toggleFullscreen();

            expect(document.exitFullscreen).not.toHaveBeenCalled();
            expect(canvas.requestFullscreen).not.toHaveBeenCalled();
        });

        it("should exit fullscreen mode if currently fullscreen", () => {
            const isFullscreenSpy = jest.spyOn(FullscreenHelper, "isFullscreen");
            const canvas = Kernel.getInstance().canvasContext.canvas;

            isFullscreenSpy.mockReturnValue(true);
            document.exitFullscreen = jest.fn();
            canvas.requestFullscreen = jest.fn();

            FullscreenHelper.toggleFullscreen();

            expect(canvas.requestFullscreen).not.toHaveBeenCalled();
            expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
        });

        it("should request fullscreen mode if not currently fullscreen", () => {
            const isFullscreenSpy = jest.spyOn(FullscreenHelper, "isFullscreen");
            const canvas = Kernel.getInstance().canvasContext.canvas;

            isFullscreenSpy.mockReturnValue(false);
            document.exitFullscreen = jest.fn();
            canvas.requestFullscreen = jest.fn();

            FullscreenHelper.toggleFullscreen();

            expect(document.exitFullscreen).not.toHaveBeenCalled();
            expect(canvas.requestFullscreen).toHaveBeenCalledTimes(1);
        });

        it("should do nothing if not currently fullscreen and canvas context not set in Kernel object", () => {
            const isFullscreenSpy = jest.spyOn(FullscreenHelper, "isFullscreen");
            
            Object.defineProperty(Kernel.getInstance(), "canvasContext", {
                value: undefined,
                configurable: true
            });

            isFullscreenSpy.mockReturnValue(false);
            document.exitFullscreen = jest.fn();

            FullscreenHelper.toggleFullscreen();

            expect(document.exitFullscreen).not.toHaveBeenCalled();
        });
    });
});