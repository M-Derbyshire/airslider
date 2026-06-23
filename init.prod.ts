import Kernel from './Kernel/Kernel';
import settings from './settings/settings.production';

const canvas = document.getElementsByTagName("canvas")[0] as HTMLCanvasElement;

// start up the kernel
Kernel.init(canvas, settings);