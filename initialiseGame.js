import Kernel from '/Kernel/kernel';

// start up the kernel
window.addEventListener("load", function() {
	var kernel = new Kernel();
	kernel.load();
	kernel.run();
}, true);