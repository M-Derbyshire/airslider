import Kernel from './Kernel/Kernel';
import settings from './settings/settings.development';

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

// start up the kernel
Kernel.init(canvas, settings);