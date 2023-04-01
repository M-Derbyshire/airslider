export default class PointerEventManager {
	
	constructor(canvas)
	{
		this.subjects = [];
		this.canvas = canvas;
		
		canvas.addEventListener("click", this.onPointCallback.bind(this));
		canvas.addEventListener("touchStart", this.onPointCallback.bind(this));
	}
	
	addPointerEventSubject(subject)
	{
		if(subject.onClick && subject.isPointerOverlapping)
			this.subjects.push(subject);
	}
	
	
	onPointCallback(e)
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
			
			if(subject.onClick && subject.isPointerOverlapping && subject.isPointerOverlapping(clickX, clickY))
				subject.onClick();
		}
	}
}