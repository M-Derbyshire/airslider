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
		const clickX = e.clientX - canvasRect.left;
		const clickY = e.clientY - canvasRect.top;
		
		//subject is a collection, so can't use foreach
		for(let i = 0; i < this.subjects.length; i++)
		{
			const subject = this.subjects[i];
			
			if(subject.onClick && subject.isPointerOverlapping && subject.isPointerOverlapping(clickX, clickY))
				subject.onClick();
		}
	}
}