import AssetHandler from "./AssetHandler";
import { waitFor } from "@testing-library/dom";

describe("AssetHandler", () => {
    it("should set assetsStillLoading property to 0 as default", () => {
        const handler = new AssetHandler(jest.fn());

        expect(handler.assetsStillLoading).toBe(0);
    });

    describe("loadImage", () => {
        it("should load image asset from local directory path", () => {
            const path = "/models/Test/anim/spritesheet.png";
            const expected = `http://localhost/src${path}`;
            const handler = new AssetHandler(jest.fn());

            const loadedImg = handler.loadImage(path);

            expect(loadedImg.src).toBe(expected);
        });

        it("should load image asset from given directory path", () => {
            const assetsDirPath = "http://my-website.com/game/assets";
            const path = "/moDelS/Test/aNIm/spritesheet.png";
            const expected = `${assetsDirPath}/m.test.anim.spritesheet.png`;

            const handler = new AssetHandler(jest.fn(), assetsDirPath);

            const loadedImg = handler.loadImage(path);

            expect(loadedImg.src).toBe(expected);
        });

        it("should return existing object if image object has been previously created", () => {
            const path = "/models/Test/anim/spritesheet.png";
            const handler = new AssetHandler(jest.fn());

            const loadedImg = handler.loadImage(path);
            const loadedImg2 = handler.loadImage(path);

            expect(loadedImg).toBe(loadedImg2);
        });

        it("should not return existing object if image path differs", () => {
            const path1 = "/models/Test/anim/spritesheet.png";
            const path2 = "/models/Test/anim/spritesheet2.png";
            const handler = new AssetHandler(jest.fn());

            const loadedImg = handler.loadImage(path1);
            const loadedImg2 = handler.loadImage(path2);

            expect(loadedImg).not.toBe(loadedImg2);
        });

        it("should set the error handler on the image to call the given callback", () => {
            const path = "/models/Test/anim/spritesheet.png";
            const errorCallback = jest.fn();
            const expectedErr = "test error 123";
            
            const handler = new AssetHandler(errorCallback);
            const loadedImg = handler.loadImage(path);

            expect(errorCallback).not.toHaveBeenCalled();
            loadedImg.onerror?.(expectedErr);
            expect(errorCallback).toHaveBeenCalledTimes(1);
            expect(errorCallback).toHaveBeenCalledWith(expectedErr);
        });

        it("should increase assetsStillLoading while waiting for asset to load, then decrease when loaded", () => {
            const path1 = "/models/Test/anim/spritesheet.png";
            const path2 = "/models/Test/anim/spritesheet2.png";
            
            const handler = new AssetHandler(jest.fn());

            const loadedImg1 = handler.loadImage(path1);
            expect(handler.assetsStillLoading).toBe(1);

            const loadedImg2 = handler.loadImage(path2);
            expect(handler.assetsStillLoading).toBe(2);

            loadedImg1.onload?.(new Event(""));
            expect(handler.assetsStillLoading).toBe(1);

            loadedImg2.onload?.(new Event(""));
            expect(handler.assetsStillLoading).toBe(0);
        });

        it("should not increase assetsStillLoading while waiting for asset to load, if load is called again with same path", () => {
            const path = "/models/Test/anim/spritesheet.png";
            
            const handler = new AssetHandler(jest.fn());

            const loadedImg = handler.loadImage(path);
            expect(handler.assetsStillLoading).toBe(1);

            handler.loadImage(path);
            expect(handler.assetsStillLoading).toBe(1);

            loadedImg.onload?.(new Event(""));
            expect(handler.assetsStillLoading).toBe(0);
        });
    });

    describe("loadAudio", () => {
        it("should load audio asset from local directory path", () => {
            const path = "/models/Test/sounds/sound.mp3";
            const expected = `http://localhost/src${path}`;
            const handler = new AssetHandler(jest.fn());

            const loadedAudio = handler.loadAudio(path);

            expect(loadedAudio.src).toBe(expected);
        });

        it("should load audio asset from given directory path", () => {
            const assetsDirPath = "http://my-website.com/game/assets";
            const path = "/moDelS/Test/sounds/sound.mp3";
            const expected = `${assetsDirPath}/m.test.sounds.sound.mp3`;

            const handler = new AssetHandler(jest.fn(), assetsDirPath);

            const loadedAudio = handler.loadAudio(path);

            expect(loadedAudio.src).toBe(expected);
        });

        it("should return existing object if audio object has been previously created", () => {
            const path = "/models/Test/sounds/sound.mp3";
            const handler = new AssetHandler(jest.fn());

            const loadedAudio = handler.loadAudio(path);
            const loadedAudio2 = handler.loadAudio(path);

            expect(loadedAudio).toBe(loadedAudio2);
        });

        it("should not return existing object if audio path differs", () => {
            const path1 = "/models/Test/sounds/sound.mp3";
            const path2 = "/models/Test/sounds/sound2.mp3";
            const handler = new AssetHandler(jest.fn());

            const loadedAudio = handler.loadAudio(path1);
            const loadedAudio2 = handler.loadAudio(path2);

            expect(loadedAudio).not.toBe(loadedAudio2);
        });

        it("should set the error handler on the audio to call the given callback", () => {
            const path = "/models/Test/sounds/sound.mp3";
            const errorCallback = jest.fn();
            const expectedErr = "test error 123";
            
            const handler = new AssetHandler(errorCallback);
            const loadedAudio = handler.loadAudio(path);

            expect(errorCallback).not.toHaveBeenCalled();
            loadedAudio.onerror?.(expectedErr);
            expect(errorCallback).toHaveBeenCalledTimes(1);
            expect(errorCallback).toHaveBeenCalledWith(expectedErr);
        });

        it("should increase assetsStillLoading while waiting for asset to load, then decrease when loaded", () => {
            const path1 = "/models/Test/sounds/sound.mp3";
            const path2 = "/models/Test/sounds/sound2.mp3";
            
            const handler = new AssetHandler(jest.fn());

            const loadedAudio1 = handler.loadAudio(path1);
            expect(handler.assetsStillLoading).toBe(1);

            const loadedAudio2 = handler.loadAudio(path2);
            expect(handler.assetsStillLoading).toBe(2);

            const eventName = "canplaythrough";
            loadedAudio1.dispatchEvent(new Event(eventName));
            expect(handler.assetsStillLoading).toBe(1);

            loadedAudio2.dispatchEvent(new Event(eventName));
            expect(handler.assetsStillLoading).toBe(0);
        });

        it("should not increase assetsStillLoading while waiting for asset to load, if load is called again with same path", () => {
            const path = "/models/Test/sounds/sound.mp3";
            
            const handler = new AssetHandler(jest.fn());

            const loadedAudio = handler.loadAudio(path);
            expect(handler.assetsStillLoading).toBe(1);

            handler.loadAudio(path);
            expect(handler.assetsStillLoading).toBe(1);

            loadedAudio.dispatchEvent(new Event("canplaythrough"));
            expect(handler.assetsStillLoading).toBe(0);
        });
    });

    describe("loadFont", () => {
        const initialiseMockFontObjects = (
            fontConstructorCallback:(family:string, source:string, createdInstance:any)=>void,
            loadFontCallback:()=>Promise<void>,
            addFontCallback:(f:FontFace)=>void
        ) => {
            // Mock the FontFaceSet
            Object.defineProperty(document, "fonts", {
                configurable: true,
                value: {
                    add: addFontCallback
                }
            });

            // Mock the FontFace class
            class MockFontFace {
                family: string;
                source: string;

                constructor(family: string, source: string) {
                    this.family = family;
                    this.source = source;
                    fontConstructorCallback(family, source, this);
                }

                load():Promise<void>{
                    return loadFontCallback();
                }
            }

            Object.assign(globalThis, {
                FontFace: MockFontFace,
            });
        };

        it("should load the font with local path and add it to the document FontFaceSet", async () => {
            const name = "test-font-name";
            const path = "/test/font/path";
            const expectedPath = `url(${path})`;

            let resolveLoadPromise:(v:unknown)=>void;
            const loadFontPromise = new Promise((res, _) => resolveLoadPromise = res);
            const loadFontHandler = jest.fn().mockReturnValue(loadFontPromise);

            let createdFontFace:any;
            const fontConstructorHandler = jest.fn().mockImplementation((family: string, source: string, createdInstance: any) => {
                createdFontFace = createdInstance;
            });

            const addFontHandler = jest.fn();

            initialiseMockFontObjects(fontConstructorHandler, loadFontHandler, addFontHandler);

            const handler = new AssetHandler(jest.fn());
            
            expect(fontConstructorHandler).not.toHaveBeenCalled();
            expect(addFontHandler).not.toHaveBeenCalled();
            expect(loadFontHandler).not.toHaveBeenCalled();

            handler.loadFont(name, path);

            expect(fontConstructorHandler).toHaveBeenCalledTimes(1);
            expect(fontConstructorHandler).toHaveBeenCalledWith(name, expectedPath, expect.anything());

            expect(loadFontHandler).toHaveBeenCalledTimes(1);
            
            resolveLoadPromise!(createdFontFace);
            await waitFor(() => {
                expect(addFontHandler).toHaveBeenCalledTimes(1);
                expect(addFontHandler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        family: name
                    })
                );
            });
        });

        it("should load the font with given assets path and add it to the document FontFaceSet", async () => {
            const name = "test-font-name";
            const path = "/test/font/path";
            const assetsDirPath = "http://my-website.com/game/assets";
            const expectedPath = `url(${assetsDirPath}/test.font.path)`;

            let resolveLoadPromise:(v:unknown)=>void;
            const loadFontPromise = new Promise((res, _) => resolveLoadPromise = res);
            const loadFontHandler = jest.fn().mockReturnValue(loadFontPromise);

            let createdFontFace:any;
            const fontConstructorHandler = jest.fn().mockImplementation((family: string, source: string, createdInstance: any) => {
                createdFontFace = createdInstance;
            });

            const addFontHandler = jest.fn();

            initialiseMockFontObjects(fontConstructorHandler, loadFontHandler, addFontHandler);

            const handler = new AssetHandler(jest.fn(), assetsDirPath);
            
            expect(fontConstructorHandler).not.toHaveBeenCalled();
            expect(addFontHandler).not.toHaveBeenCalled();
            expect(loadFontHandler).not.toHaveBeenCalled();

            handler.loadFont(name, path);

            expect(fontConstructorHandler).toHaveBeenCalledTimes(1);
            expect(fontConstructorHandler).toHaveBeenCalledWith(name, expectedPath, expect.anything());

            expect(loadFontHandler).toHaveBeenCalledTimes(1);
            
            resolveLoadPromise!(createdFontFace);
            await waitFor(() => {
                expect(addFontHandler).toHaveBeenCalledTimes(1);
                expect(addFontHandler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        family: name
                    })
                );
            });
        });

        it("should not load a font if it has already been loaded", () => {
            const name = "test-font-name";
            const path = "/test/font/path";

            const loadFontHandler = jest.fn().mockResolvedValue({});
            const fontConstructorHandler = jest.fn();

            initialiseMockFontObjects(fontConstructorHandler, loadFontHandler, jest.fn());

            const handler = new AssetHandler(jest.fn());

            handler.loadFont(name, path);

            expect(fontConstructorHandler).toHaveBeenCalledTimes(1);
            expect(loadFontHandler).toHaveBeenCalledTimes(1);
            
            handler.loadFont("other-name-but-same-path", path);

            expect(fontConstructorHandler).toHaveBeenCalledTimes(1);
            expect(loadFontHandler).toHaveBeenCalledTimes(1);
        });

        it("should call the given error handler if failure when loading font", async () => {
            const name = "test-font-name";
            const path = "/test/font/path";

            const expectedError = new Error("test error 123");
            const errorHandler = jest.fn();
            const loadFontHandler = jest.fn().mockRejectedValue(expectedError);

            initialiseMockFontObjects(jest.fn(), loadFontHandler, jest.fn());

            const handler = new AssetHandler(errorHandler);

            handler.loadFont(name, path);

            await waitFor(() => {
                expect(errorHandler).toHaveBeenCalledTimes(1);
                expect(errorHandler).toHaveBeenCalledWith(expectedError);
            });
        });

        it("should increase _assetsStillLoading while font is loading, and decrease once loaded", async () => {
            const name1 = "test-font-name";
            const path1 = "/test/font/path";
            const name2 = "test-font-name2";
            const path2 = "/test/font/path2";

            // We want to store the promise resolver for each promise we 
            // return from the FontFace load method (so we can trigger 
            // them later).
            const loadFontPromiseResolvers:((v:any)=>void)[] = [];
            const loadFontHandler = jest.fn().mockImplementation(
                () => new Promise((res, _) => loadFontPromiseResolvers.push(res))
            );

            initialiseMockFontObjects(jest.fn(), loadFontHandler, jest.fn());

            const handler = new AssetHandler(jest.fn());

            handler.loadFont(name1, path1);
            expect(loadFontHandler).toHaveBeenCalledTimes(1);
            expect(handler.assetsStillLoading).toBe(1);
            
            handler.loadFont(name2, path2);
            expect(loadFontHandler).toHaveBeenCalledTimes(2);
            expect(handler.assetsStillLoading).toBe(2);

            // resolve the font-load promises, and check the count goes down
            loadFontPromiseResolvers[0]({});
            await waitFor(() => {
                expect(handler.assetsStillLoading).toBe(1);
            });
            
            loadFontPromiseResolvers[1]({});
            await waitFor(() => {
                expect(handler.assetsStillLoading).toBe(0);
            });
        });
    });

    describe("releaseAsset", () => {
        it("should remove existing image from internal state to ensure it gets loaded again if requested second time", () => {
            const path = "/models/Test/anim/spritesheet.png";
            const handler = new AssetHandler(jest.fn());

            const loadedImg = handler.loadImage(path);

            handler.releaseAsset(path);

            const loadedImg2 = handler.loadImage(path);

            expect(loadedImg).not.toBe(loadedImg2);
        });

        it("should remove existing audio from internal state to ensure it gets loaded again if requested second time", () => {
            const path = "/models/Test/sounds/sound.mp3";
            const handler = new AssetHandler(jest.fn());

            const loadedAudio = handler.loadAudio(path);

            handler.releaseAsset(path);

            const loadedAudio2 = handler.loadAudio(path);

            expect(loadedAudio).not.toBe(loadedAudio2);
        });
    });
});