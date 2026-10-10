import Kernel from './Kernel/Kernel';
import settings from './settings/settings.itch';
import fonts from './fonts/fonts';

// This is the initialisation script to use when the game is published on
// the Itch.io website

const canvas = document.getElementsByTagName("canvas")[0] as HTMLCanvasElement;

// start up the kernel
Kernel.init(canvas, settings, fonts);