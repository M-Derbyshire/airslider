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
	 * The X position (on the canvas, not the screen) of the mouse pointer
	 */
	private _canvasPointerX:number;
	
	/**
	 * The Y position (on the canvas, not the screen) of the mouse pointer
	 */
	private _canvasPointerY:number;
	
	/**
	 * The callback to run when a click event occurs.
	 */
	private _clickEventCallback:(e:MouseEvent)=>void;
	
	/**
	 * The callback to run when a mouse-move occurs.
	 */
	private _moveEventCallback:(e:MouseEvent)=>void;
	
	constructor()
	{
		this._subjects = [];
		this._canvasPointerX = 0;
		this._canvasPointerY = 0;
		
		this._clickEventCallback = (e:MouseEvent) => {
			this._moveEventCallback(e); // Make sure the pointer x/y are set
			this._onPointerEventCallback("onClick");
		};
		
		this._moveEventCallback = (e:MouseEvent) => {
			const { pointerX, pointerY } = this._getPointerPositions(e);
			
			this._canvasPointerX = pointerX;
			this._canvasPointerY = pointerY;
		};
		
		const canvas = Kernel.getInstance().gameCanvas;
		canvas.addEventListener("click", this._clickEventCallback);
		canvas.addEventListener("touchStart", this._clickEventCallback);
		canvas.addEventListener("mousemove", this._moveEventCallback);
	}
	
	/**
     * Adds an object (if valid) to the list of objects that should react to mouse pointer events.
	 * An object must be considered a valid pointer-event subject, or it will be ignored
     * (to be valid, it must have an "isPointerOverlapping" method, and either an "onClick" or an "onHover" method).
	 * This will not re-add a subject that it already holds a reference to.
     * @param subject an object that should react to a pointer event
     */
	addPointerEventSubject(subject:any):void
	{
		if(this._isValidEventSubject(subject))
			this._subjects.push(subject);
	}
    
    /**
     * Checks the pointer-event subjects to see if any are being hovered over, and triggers 
     * their "onHover" methods.
     */
    checkForHoverEvents():void
	{
		this._onPointerEventCallback("onHover");
	}
	
	/**
	 * Removes the event listeners from the canvas
	 */
	removeEventHandlers():void {
		const canvas = Kernel.getInstance().gameCanvas;
		canvas.removeEventListener("click", this._clickEventCallback);
		canvas.removeEventListener("touchStart", this._clickEventCallback);
		canvas.removeEventListener("mousemove", this._moveEventCallback);
	}
	
	/**
	 * Determines if a given object is a valid pointer-event subject
	 * @param subject an object that may be a valid pointer-event subject
	 * @returns true if the object is a valid subject, otherwise false
	 */
	private _isValidEventSubject(subject:any):boolean
	{
		return (
			subject && 
			typeof subject === 'object' && 
			typeof subject.isPointerOverlapping === "function" && 
			(
				typeof subject.onClick === "function" || 
				typeof subject.onHover === "function"
			) && 
			!this._subjects.includes(subject)
		);
	}
	
	/**
	 * A callback function, to be triggered by mouse/touch event listeners.
	 * This triggers the given method on any affected subjects.
	 * @param actionMethodName the name of the method on the subject, to call 
	 * if an event occurs (e.g. onClick)
	 */
	private _onPointerEventCallback(actionMethodName:string):void
	{
		this._subjects.forEach(subject => {
			if(subject.isPointerOverlapping(this._canvasPointerX, this._canvasPointerY))
				if(typeof subject[actionMethodName] === "function")
					subject[actionMethodName]();
		});
	}
	
	/**
	 * Gets the X and Y positions of the pointer (on the canvas), from the given mouse-event.
	 * @param e the mouse-event
	 * @returns an object containing the X and Y positions of the pointer (on the canvas)
	 */
	private _getPointerPositions(e:MouseEvent):{ pointerX:number, pointerY:number }
	{
		const canvas = e.target! as HTMLCanvasElement;
		const canvasRect = canvas.getBoundingClientRect();
		
		//We need to take into account the devicePixelRatio
		const canvasScaleX = canvas.width / canvasRect.width;
		const canvasScaleY = canvas.height / canvasRect.height;
		
		const pointerX = (e.clientX - canvasRect.left) * canvasScaleX;
		const pointerY = (e.clientY - canvasRect.top) * canvasScaleY;
		
		return { pointerX, pointerY };
	}
};