import Kernel from '/kernel/kernel';
import TheConstruct from '/assets/levels/TheConstruct/TheConstruct';

// start up the kernel
window.addEventListener("load", function() {
	var kernel = new Kernel();
	kernel.load();
	kernel.loadLevel(new TheConstruct()); //take this line out when creating menu system
	kernel.run();
}, true);