import { jest } from "@jest/globals";
import "jest-canvas-mock";
import Kernel from "./Kernel";
import Level from "./entities/Level/Level";
import FrameManager from "./engines/GraphicEngine/FrameManager";
import ModelEventManager from "./entities/Level/ModelEventManager";
import PointerEventManager from "./entities/Level/PointerEventManager";
import KeyboardEventManager from "./entities/Level/KeyboardEventManager";

globalThis.jest = jest;

// Setup the Kernel instance
const canvas = document.createElement("canvas");
Kernel.init(canvas, {
    getInitialLevel: (_:Kernel) => new Level(new FrameManager(), new ModelEventManager(), new PointerEventManager(canvas), new KeyboardEventManager()),
});