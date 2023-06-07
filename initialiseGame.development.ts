import Kernel from './Kernel/Kernel';

// start up the kernel
window.addEventListener("click", function() {
	Kernel.getInstance().initiate();
}, true);