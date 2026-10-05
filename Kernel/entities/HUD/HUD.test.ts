import AssetHandler from "../../AssetHandler/AssetHandler";
import Camera from "../../engines/GraphicEngine/Camera";
import FrameManager from "../../engines/GraphicEngine/FrameManager";
import GraphicEngine from "../../engines/GraphicEngine/GraphicEngine";
import IGraphicEngine from "../../engines/GraphicEngine/IGraphicEngine";
import SoundEngine from "../../engines/SoundEngine/SoundEngine";
import HUDComponent from "../HUDComponent/HUDComponent";
import IHUDComponent from "../HUDComponent/IHUDComponent";
import IPointerEventManager from "../Level/IPointerEventManager";
import PointerEventManager from "../Level/PointerEventManager";
import { IEntitySound } from "../types";
import HUD from "./HUD";

describe("HUD", () => {
    const createPointerEventManager = ():IPointerEventManager => {
        const canvas = document.createElement("canvas");
        return new PointerEventManager(canvas);
    };

    it("should set the pointerEventManager property in the constructor, for child entities to use", () => {
        let capturedManager:IPointerEventManager; // This will be the manager set in the protected property
        class TestHUD extends HUD {
            constructor(pointerEventManager:IPointerEventManager) {
                super(pointerEventManager);
                capturedManager = this.pointerEventManager;
            }
        };

        const expectedManager = createPointerEventManager();
        new TestHUD(expectedManager);

        expect(capturedManager!).toBe(expectedManager);
    });

    it("should set the protected properties in the constructor, to the expected values", () => {
        let capturedComponents:IHUDComponent[];
        let capturedAssetsToUnload:string[];
        let capturedSounds:IEntitySound[];

        class TestHUD extends HUD {
            constructor(pointerEventManager:IPointerEventManager) {
                super(pointerEventManager);
                
                capturedComponents = this.components;
                capturedAssetsToUnload = this.assetsToUnload;
                capturedSounds = this.sounds;
            }
        };

        new TestHUD(createPointerEventManager());

        expect(capturedComponents!.length).toBe(0);
        expect(capturedAssetsToUnload!.length).toBe(0);
        expect(capturedSounds!.length).toBe(0);
    });

    describe("loadComponents", () => {
        it("should call the load method on every stored component", () => {
            const components:IHUDComponent[] = [];
            for(let i = 0; i < 3; i++) {
                const component = new HUDComponent();
                component.load = jest.fn();

                components.push(component);
            }

            class TestHUD extends HUD {
                constructor(pointerEventManager:IPointerEventManager) {
                    super(pointerEventManager);
                    this.components = components;
                }
            };
            
            const hud = new TestHUD(createPointerEventManager());
            const assetHandler = new AssetHandler(jest.fn());

            hud.loadComponents(assetHandler);

            components.forEach(component => {
                expect(component.load).toHaveBeenCalledTimes(1);
                expect(component.load).toHaveBeenCalledWith(assetHandler);
            });
        });
    });

    describe("registerSounds", () => {
        it("should add every stored sound to the SoundEngine", () => {
            const soundEngine = new SoundEngine(jest.fn());
            soundEngine.addSound = jest.fn();

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

            class TestHUD extends HUD {
                constructor(pointerEventManager:IPointerEventManager) {
                    super(pointerEventManager);
                    this.sounds = sounds;
                }
            };

            const hud = new TestHUD(createPointerEventManager());

            hud.registerSounds(soundEngine);

            expect(soundEngine.addSound).toHaveBeenCalledTimes(sounds.length);
            sounds.forEach(sound => expect(soundEngine.addSound).toHaveBeenCalledWith(sound.key, sound.asset));
        });

        it("should call the registerSounds method on every stored component", () => {
            const soundEngine = new SoundEngine(jest.fn());
            soundEngine.addSound = jest.fn();

            const components:IHUDComponent[] = [];
            for(let i = 0; i < 3; i++) {
                const component = new HUDComponent();
                component.registerSounds = jest.fn();

                components.push(component);
            }

            class TestHUD extends HUD {
                constructor(pointerEventManager:IPointerEventManager) {
                    super(pointerEventManager);
                    this.components = components;
                }
            };

            const hud = new TestHUD(createPointerEventManager());
            
            hud.registerSounds(soundEngine);

            components.forEach(component => {
                expect(component.registerSounds).toHaveBeenCalledTimes(1);
                expect(component.registerSounds).toHaveBeenCalledWith(soundEngine);
            });
        });
    });

    describe("unload", () => {
        it("should use the AssetHandler to release every asset that is registered as unloadable in the HUD", () => {
            const assetHandler = new AssetHandler(jest.fn());
            assetHandler.releaseAsset = jest.fn();

            const assetPaths = [
                "/asset/path/1.png",
                "/asset/path/2.png",
                "/asset/path/3.png",
            ];

            class TestHUD extends HUD {
                constructor(pointerEventManager:IPointerEventManager) {
                    super(pointerEventManager);
                    this.assetsToUnload = assetPaths;
                }
            };

            const hud = new TestHUD(createPointerEventManager());

            hud.unload(assetHandler);

            expect(assetHandler.releaseAsset).toHaveBeenCalledTimes(assetPaths.length);
            assetPaths.forEach(path => expect(assetHandler.releaseAsset).toHaveBeenCalledWith(path));
        });

        it("should call the unload method on every component stored", () => {
            const assetHandler = new AssetHandler(jest.fn());

            const components:IHUDComponent[] = [];
            for(let i = 0; i < 3; i++) {
                const component = new HUDComponent();
                component.unload = jest.fn();

                components.push(component);
            }

            class TestHUD extends HUD {
                constructor(pointerEventManager:IPointerEventManager) {
                    super(pointerEventManager);
                    this.components = components;
                }
            };

            const hud = new TestHUD(createPointerEventManager());

            hud.unload(assetHandler);

            components.forEach(component => {
                expect(component.unload).toHaveBeenCalledTimes(1);
                expect(component.unload).toHaveBeenCalledWith(assetHandler);
            });
        });
    });

    describe("prepare", () => {
        it("should call prepare on every stored component", () => {
            const components:IHUDComponent[] = [];
            for(let i = 0; i < 3; i++) {
                const component = new HUDComponent();
                component.prepare = jest.fn();

                components.push(component);
            }

            class TestHUD extends HUD {
                constructor(pointerEventManager:IPointerEventManager) {
                    super(pointerEventManager);
                    this.components = components;
                }
            };

            const hud = new TestHUD(createPointerEventManager());

            hud.prepare();

            components.forEach(component => expect(component.prepare).toHaveBeenCalledTimes(1));
        });
    });

    describe("draw", () => {
        const createGraphicEngine = ():IGraphicEngine => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            const camera = new Camera(canvas, 0, 0, 0, 0);

            return new GraphicEngine(camera, new FrameManager(), context);
        }

        it("should call the draw method on every active component", () => {
            const components:IHUDComponent[] = [];
            for(let i = 0; i < 3; i++) {
                const component = new HUDComponent();
                component.draw = jest.fn();
                component.prepare();

                components.push(component);
            }

            // We want to set one of the components to not be active, to confirm
            // it doesn't get drawn
            const inactiveComponentIdx = 1;
            components[inactiveComponentIdx].active = false;

            class TestHUD extends HUD {
                constructor(pointerEventManager:IPointerEventManager) {
                    super(pointerEventManager);
                    this.components = components;
                }
            };

            const hud = new TestHUD(createPointerEventManager());

            const graphicEngine = createGraphicEngine();
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            hud.draw(graphicEngine, context);

            components.forEach((component, idx) => {
                if(idx !== inactiveComponentIdx) {
                    expect(component.draw).toHaveBeenCalledTimes(1);
                    expect(component.draw).toHaveBeenCalledWith(graphicEngine, context);
                }
            });

            expect(components[inactiveComponentIdx].draw).not.toHaveBeenCalled();
        });

        it("should call the drawText method on any component that has text content", () => {
            const components:IHUDComponent[] = [];
            for(let i = 0; i < 3; i++) {
                const component = new HUDComponent();
                component.draw = jest.fn();
                component.drawText = jest.fn()
                component.prepare();

                component.text.content = "my test text";

                components.push(component);
            }

            // We want to set one of the components dont have text, to confirm
            // it doesn't get drawn
            const noTextComponentIdx = 1;
            components[noTextComponentIdx].text.content = "";

            class TestHUD extends HUD {
                constructor(pointerEventManager:IPointerEventManager) {
                    super(pointerEventManager);
                    this.components = components;
                }
            };

            const hud = new TestHUD(createPointerEventManager());

            const graphicEngine = createGraphicEngine();
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            hud.draw(graphicEngine, context);

            components.forEach((component, idx) => {
                if(idx !== noTextComponentIdx) {
                    expect(component.drawText).toHaveBeenCalledTimes(1);
                    expect(component.drawText).toHaveBeenCalledWith(graphicEngine);
                }
            });

            expect(components[noTextComponentIdx].drawText).not.toHaveBeenCalled();
        });

        it("should not call the drawText method on an inactive component", () => {
            const components:IHUDComponent[] = [];
            for(let i = 0; i < 3; i++) {
                const component = new HUDComponent();
                component.draw = jest.fn();
                component.drawText = jest.fn()
                component.prepare();

                component.text.content = "my test text";

                components.push(component);
            }

            // We want to set one of the components to not be active, to confirm
            // it doesn't get drawn
            const inactiveComponentIdx = 1;
            components[inactiveComponentIdx].active = false;

            class TestHUD extends HUD {
                constructor(pointerEventManager:IPointerEventManager) {
                    super(pointerEventManager);
                    this.components = components;
                }
            };

            const hud = new TestHUD(createPointerEventManager());

            const graphicEngine = createGraphicEngine();
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;

            hud.draw(graphicEngine, context);

            components.forEach((component, idx) => {
                if(idx !== inactiveComponentIdx) {
                    expect(component.drawText).toHaveBeenCalledTimes(1);
                    expect(component.drawText).toHaveBeenCalledWith(graphicEngine);
                }
            });

            expect(components[inactiveComponentIdx].drawText).not.toHaveBeenCalled();
        });
    });
});