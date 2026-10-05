import AssetHandler from "../../AssetHandler/AssetHandler";
import Camera from "../../engines/GraphicEngine/Camera";
import FrameManager from "../../engines/GraphicEngine/FrameManager";
import GraphicEngine from "../../engines/GraphicEngine/GraphicEngine";
import IGraphicEngine from "../../engines/GraphicEngine/IGraphicEngine";
import SoundEngine from "../../engines/SoundEngine/SoundEngine";
import { IEntitySound } from "../types";
import HUDComponent from "./HUDComponent";

describe("HUDComponent", () => {
    const createGraphicEngine = ():IGraphicEngine => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;

        return new GraphicEngine(
            new Camera(canvas, 0, 0, 0, 0),
            new FrameManager(),
            context
        );
    };

    it("should set the expected default values in the constructor", () => {
        const component = new HUDComponent();

        expect(component.x).toBe(0);
        expect(component.y).toBe(0);
        expect(component.width).toBe(0);
        expect(component.height).toBe(0);
        expect(component.active).toBe(true);
    });

    it("should set the expected default values in the constructor for protected properties", () => {
        let capturedAssetsToUnload:string[];
        let capturedSounds:IEntitySound[];

        class TestComponent extends HUDComponent {
            constructor() {
                super();

                capturedAssetsToUnload = this.assetsToUnload;
                capturedSounds = this.sounds;
            }
        }

        new TestComponent();

        expect(capturedAssetsToUnload!.length).toBe(0);
        expect(capturedSounds!.length).toBe(0);
    });

    describe("prepare", () => {
        it("should populate the text property object with the expected defaults", () => {
            const component = new HUDComponent();

            component.prepare();

            expect(component.text.content).toBe("");
            expect(component.text.x).toBe(0);
            expect(component.text.y).toBe(0);
            expect(component.text.size).toBe(30);
            expect(component.text.font).toBe("Arial");
            expect(component.text.color).toBe("red");
            expect(component.text.style).toBe("bolder");
            expect(component.text.alignment).toBe("left");
            expect(component.text.lineGap).toBe(0);
        });
    });

    describe("registerSounds", () => {
        it("should add every stored sound to the SoundEngine", () => {
            const sounds:IEntitySound[] = [
                {
                    key: "key1.mp3",
                    asset: new Audio("key1.mp3")
                },
                {
                    key: "key2.mp3",
                    asset: new Audio("key2.mp3")
                },
                {
                    key: "key3.mp3",
                    asset: new Audio("key3.mp3")
                },
            ];

            class TestComponent extends HUDComponent {
                constructor() {
                    super();
                    this.sounds = sounds;
                }
            }

            const component = new TestComponent();
            const soundEngine = new SoundEngine(jest.fn());
            soundEngine.addSound = jest.fn();

            component.registerSounds(soundEngine);

            expect(soundEngine.addSound).toHaveBeenCalledTimes(sounds.length);
            sounds.forEach(sound => expect(soundEngine.addSound).toHaveBeenCalledWith(sound.key, sound.asset));
        });
    });

    describe("unload", () => {
        it("should release every stored assetToUnload asset with the AssetHandler", () => {
            const assets = ["/test1.png", "/test2.png", "/test3.png"];

            class TestComponent extends HUDComponent {
                constructor() {
                    super();
                    this.assetsToUnload = assets;
                }
            }

            const component = new TestComponent();
            const assetHandler = new AssetHandler(jest.fn());
            assetHandler.releaseAsset = jest.fn();

            component.unload(assetHandler);

            expect(assetHandler.releaseAsset).toHaveBeenCalledTimes(assets.length);
            assets.forEach(asset => expect(assetHandler.releaseAsset).toHaveBeenCalledWith(asset));
        });
    });

    describe("drawText", () => {
        it("should call the GraphicEngine drawText method with the set text, and positional values", () => {
            const component = new HUDComponent();
            component.prepare();
            const graphicEngine = createGraphicEngine();
            graphicEngine.drawText = jest.fn();

            const expectedText = {
                content: "my test content",
                x: 5,
                y: 10,
                size: 40,
                font: "Calibri",
                color: "blue",
                style: "bold", // See the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
                alignment: "right" as CanvasTextAlign,
                lineGap:5
            };

            const expectedPositions = { x: 5, y: 10, z: 0 };

            component.text = expectedText;
            component.x = expectedPositions.x;
            component.y = expectedPositions.y

            component.drawText(graphicEngine);

            expect(graphicEngine.drawText).toHaveBeenCalledTimes(1);
            expect(graphicEngine.drawText).toHaveBeenCalledWith(expectedText, expectedPositions, "static");
        });
    });

    describe("isPointerOverlapping", () => {
        it.each([
            [0, 5],
            [5, 0],
            [0, 0]
        ])("should return false if width or height is 0", (width: number, height: number) => {
            const graphicEngine = createGraphicEngine();
            graphicEngine.getStaticDrawPositionsAndDimensions = jest.fn();

            const component = new HUDComponent();
            component.width = width;
            component.height = height;

            const result = component.isPointerOverlapping(2, 2, graphicEngine);

            expect(result).toBe(false);
            expect(graphicEngine.getStaticDrawPositionsAndDimensions).not.toHaveBeenCalled();
        });

        it.each([
            ["at the top", 3.75, 0.5],
            ["on the left", 0, 4.5],
            ["at the bottom", 3, 7],
            ["on the right", 7.5, 3]
        ])("should return false if pointer is not overlapping the set area: %s", (_:string, pointX:number, pointY:number) => {
            const graphicEngine = createGraphicEngine();

            const staticValues = { x: 1, y: 1, width: 5, height: 5 };
            graphicEngine.getStaticDrawPositionsAndDimensions = jest.fn().mockReturnValue(staticValues);

            const component = new HUDComponent();
            component.x = 10;
            component.y = 12;
            component.width = 30;
            component.height = 20;

            const result = component.isPointerOverlapping(pointX, pointY, graphicEngine);

            expect(graphicEngine.getStaticDrawPositionsAndDimensions).toHaveBeenCalledTimes(1);
            expect(graphicEngine.getStaticDrawPositionsAndDimensions).toHaveBeenCalledWith({
                x: component.x,
                y: component.y,
                width: component.width,
                height: component.height
            });

            expect(result).toBe(false);
        });

        it.each([
            ["on the top line", 3.5, 1],
            ["on the left line", 1, 3],
            ["on the bottom line", 2.5, 6],
            ["on the right line", 6, 2],
            ["in the middle", 3.5, 3.5],
            ["random position", 2, 4.7]
        ])("should return true if the pointer is overlapping the set area: %s", (_:string, pointX: number, pointY:number) => {
            const graphicEngine = createGraphicEngine();

            const staticValues = { x: 1, y: 1, width: 5, height: 5 };
            graphicEngine.getStaticDrawPositionsAndDimensions = jest.fn().mockReturnValue(staticValues);

            const component = new HUDComponent();
            component.x = 10;
            component.y = 12;
            component.width = 30;
            component.height = 20;

            const result = component.isPointerOverlapping(pointX, pointY, graphicEngine);

            expect(graphicEngine.getStaticDrawPositionsAndDimensions).toHaveBeenCalledTimes(1);
            expect(graphicEngine.getStaticDrawPositionsAndDimensions).toHaveBeenCalledWith({
                x: component.x,
                y: component.y,
                width: component.width,
                height: component.height
            });

            expect(result).toBe(true);
        });
    });
});