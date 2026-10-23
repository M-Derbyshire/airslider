import { jest } from "@jest/globals";
import "jest-canvas-mock";
import Kernel from "./Kernel";
import Level from "./entities/Level/Level";
import FrameManager from "./engines/GraphicEngine/FrameManager";
import ModelEventManager from "./entities/Level/ModelEventManager";
import PointerEventManager from "./entities/Level/PointerEventManager";
import KeyboardEventManager from "./entities/Level/KeyboardEventManager";
import IKernel from "./IKernel";

globalThis.jest = jest;

// Setup the Kernel instance
const initialiseKernel = () => {
    const canvas = document.createElement("canvas");

    Kernel.init(canvas, {
        getInitialLevel: (_:IKernel) => new Level(new FrameManager(), new ModelEventManager(), new PointerEventManager(canvas), new KeyboardEventManager()),
    });
};

initialiseKernel();