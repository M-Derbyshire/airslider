import Kernel from '/kernel/kernel';

// start up the kernel
window.addEventListener("load", function() {
	var kernel = new Kernel();
	kernel.load();
	kernel.run();
}, true);