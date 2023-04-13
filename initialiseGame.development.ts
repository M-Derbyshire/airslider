import Kernel from './Kernel/Kernel';

// start up the kernel
window.addEventListener("load", function() {
	Kernel.getInstance().initiate();
}, true);