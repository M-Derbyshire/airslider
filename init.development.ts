import Kernel from './Kernel/Kernel';

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

// start up the kernel
Kernel.init(canvas);