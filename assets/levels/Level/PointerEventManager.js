/**
 * Manages any events relating to mouse clicks or screen touches
 */
export default class PointerEventManager {
	
	/**
	 * Constructor
	 * @param canvas The canvas element that the game is displayed on
	 */
	constructor(canvas:HTMLCanvasElement)
	{
		this.subjects = [];
		this._canvas = canvas;
		
		canvas.addEventListener("click", this.onPointCallback.bind(this));
		canvas.addEventListener("touchStart", this.onPointCallback.bind(this));
	}
	
	/**
     * Adds an object to the list of objects that should react to being clicked
     * (the subject object must have both an "onClick" and "isPointerOverlapping" method)
     * @param subject an object that should react to being clicked
     */
	addPointerEventSubject(subject:any)
	{
		if(subject.onClick && subject.isPointerOverlapping)
			this.subjects.push(subject);
	}
	
	/**
	 * A callback function, to be triggered by event listeners.
	 * This triggers the onClick method of any clicked objects.
	 * @param e the canvas element that is displaying the game
	 */
	onPointCallback(e:HTMLCanvasElement)
	{
		e.preventDefault();
		const canvasRect = e.target.getBoundingClientRect();
		
		//We need to take into account the devicePixelRatio
		const canvasScaleX = e.target.width / canvasRect.width;
		const canvasScaleY = e.target.height / canvasRect.height;
		
		const clickX = (e.clientX - canvasRect.left) * canvasScaleX;
		const clickY = (e.clientY - canvasRect.top) * canvasScaleY;
		
		//subject is a collection, so can't use foreach
		for(let i = 0; i < this.subjects.length; i++)
		{
			const subject = this.subjects[i];
			
			if(subject.isPointerOverlapping(clickX, clickY))
				subject.onClick();
		}
	}
}