import Kernel from "../../../Kernel/Kernel";
import IPointerEventManager from "./IPointerEventManager";

/**
 * Manages any events relating to mouse clicks or screen touches
 */
export default class PointerEventManager implements IPointerEventManager {
	
	/**
	 * The registered entities that are able to handle click events
	 */
	private _subjects:any[];
	
	
	/**
	 * Constructor
	 */
	constructor()
	{
		this._subjects = [];
		
		const canvas = Kernel.getInstance().gameCanvas;
		canvas.addEventListener("click", this._onPointCallback.bind(this));
		canvas.addEventListener("touchStart", this._onPointCallback.bind(this));
	}
	
	/**
     * Adds an object to the list of objects that should react to being clicked
     * (the subject object must have both an "onClick" and "isPointerOverlapping" method).
	 * This will not re-add a subject that it already holds a reference to.
     * @param subject an object that should react to being clicked
     */
	addPointerEventSubject(subject:any):void
	{
		if(subject.onClick && subject.isPointerOverlapping && !this._subjects.includes(subject))
			this._subjects.push(subject);
	}
	
	/**
	 * A callback function, to be triggered by event listeners.
	 * This triggers the onClick method of any clicked objects.
	 * @param e the canvas element that is displaying the game
	 */
	private _onPointCallback(e:MouseEvent):void
	{
		e.preventDefault();
		const canvas = e.target! as HTMLCanvasElement;
		const canvasRect = canvas.getBoundingClientRect();
		
		//We need to take into account the devicePixelRatio
		const canvasScaleX = canvas.width / canvasRect.width;
		const canvasScaleY = canvas.height / canvasRect.height;
		
		const clickX = (e.clientX - canvasRect.left) * canvasScaleX;
		const clickY = (e.clientY - canvasRect.top) * canvasScaleY;
		
		//subject is a collection, so can't use foreach
		for(let i = 0; i < this._subjects.length; i++)
		{
			const subject = this._subjects[i];
			
			if(subject.isPointerOverlapping(clickX, clickY))
				subject.onClick();
		}
	}
}