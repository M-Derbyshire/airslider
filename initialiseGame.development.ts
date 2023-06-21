import Kernel from './Kernel/Kernel';

let initiated = false;

// start up the kernel
window.addEventListener("click", function() {
	if(!initiated) {
		Kernel.getInstance().initiate();
		initiated = true;
	}
}, true);