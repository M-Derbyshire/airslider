import Kernel from '/kernel/kernel';

export default class ControlsInitialiser
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
		this._initialisingFunctions = [];
    }
	
	initialiseControls()
	{
		this._initialisingFunctions.forEach(func => func());
	}
}