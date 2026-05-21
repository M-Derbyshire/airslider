import { GameLoopStatus } from "../../GameLoopManager/IGameLoopManager";
import Kernel from "../../Kernel";
import IPointerEventManager from "./IPointerEventManager";

/**
 * Manages any events relating to mouse clicks
 */
export default class PointerEventManager implements IPointerEventManager {
	/**
	 * The canvas that the game is being drawn on
	 */
	private _canvas:HTMLCanvasElement;
	
	/**
	 * The callbacks registered for entities that are able to handle click events (and extra configuration settings)
	 */
	private _subjects:ISubject[];
	
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
	
	/**
	 * Constructor
	 * @param canvas the canvas that the game is being drawn on
	 */
	constructor(canvas:HTMLCanvasElement)
	{
		this._canvas = canvas;
		this._subjects = [];
		this._canvasPointerX = 0;
		this._canvasPointerY = 0;
		
		this._moveEventCallback = (e:MouseEvent) => {
			const { pointerX, pointerY } = this._getPointerPositions(e);
			
			this._canvasPointerX = pointerX;
			this._canvasPointerY = pointerY;
		};
		
		this._clickEventCallback = (e:MouseEvent) => {
			this._moveEventCallback(e); // Make sure the pointer X/Y are set
			this._onPointerEventCallback(PointerAction.onClick);
		};
		
		canvas.addEventListener("click", this._clickEventCallback);
		canvas.addEventListener("mousemove", this._moveEventCallback);
	}
	
	/**
     * Registers callback functions that handle pointer events for a subject.
     * @param isPointerOverlapping callback function that determines if the pointer is overlapping the subject. The
     * pointer X/Y parameters are the positions on the canvas, not on the screen
     * @param isActive callback function that determines if the subject is active
     * @param onClick callback function that should be called when the subject is clicked
     * @param onHover callback function that should be called when the pointer is hovering over the subject
     * @param isActiveWhenPaused should pointer events for this subject still be active when the game is paused?
     */
    addPointerEventSubject(
        isPointerOverlapping:(canvasPointerX:number, canvasPointerY:number)=>boolean,
		isActive:()=>boolean,
        onClick?:()=>void,
        onHover?:()=>void,
        isActiveWhenPaused?:boolean
    ):void
	{
		if(!onClick && !onHover)
			return;
		
		this._subjects.push({
			isPointerOverlapping,
			isActive,
			onClick,
			onHover,
			configuration: {
				isActiveWhenPaused: !!isActiveWhenPaused
			}
		});
	}
	
	/**
     * Unregisters all of the event subjects
     */
    removePointerEventSubjects():void
	{
		this._subjects = [];
	}
    
    /**
     * Checks the pointer-event subjects to see if any are being hovered over, and triggers 
     * their "onHover" callbacks.
     */
    checkForHoverEvents():void
	{
		this._onPointerEventCallback(PointerAction.onHover);
	}
	
	/**
	 * Removes the event listeners from the canvas
	 */
	removeEventHandlers():void {
		this._canvas.removeEventListener("click", this._clickEventCallback);
		this._canvas.removeEventListener("mousemove", this._moveEventCallback);
	}
	
	/**
	 * A callback function, to be triggered by mouse/touch event listeners.
	 * This triggers the action for any affected subjects.
	 * @param action the action callback to call if an event occurs
	 */
	private _onPointerEventCallback(action:PointerAction):void
	{
		const kernel = Kernel.getInstance();
		
		this._subjects.forEach(subject => {
			const subjectIsPaused =
				kernel.status === GameLoopStatus.Paused
				&& !subject.configuration.isActiveWhenPaused;
			
			const subjectCanReactToEvents = 
				!subjectIsPaused
				&& subject.isActive();
			
			if(!subjectCanReactToEvents)
				return;
			
			if(subject.isPointerOverlapping(this._canvasPointerX, this._canvasPointerY))
			{
				switch (action) {
					case PointerAction.onClick:
						subject.onClick?.();
					case PointerAction.onHover:
						subject.onHover?.();
				}
			}
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

/**
 * Represents an entity that can be the subject of pointer 
 * events, and the configuration data that is related to it
 */
interface ISubject {
	/**
	 * Callback function that determines if the pointer is overlapping the subject
	 * @param canvasPointerX the X position (on the canvas, not the screen) of the mouse pointer
	 * @param canvasPointerY the Y position (on the canvas, not the screen) of the mouse pointer
	 * @returns true if the pointer is overlapping the subject, false if not
	 */
	isPointerOverlapping:(canvasPointerX:number, canvasPointerY:number)=>boolean;
	
	/**
	 * Callback function that determines if the subject is active
	 * @returns true if the subject is active, false if not
	 */
	isActive:()=>boolean;
	
	/**
	 * Callback function that should be called when the subject is clicked
	 */
	onClick?:()=>void;
	
	/**
	 * Callback function that should be called when the pointer is hovering over the subject
	 */
	onHover?:()=>void;
	
	/**
	 * The configuration settings for this subject
	 */
	configuration: {
		/**
		 * Is this subject active when the game is paused?
		 */
		isActiveWhenPaused:boolean;
	}
}

/**
 * The actions that can be triggered in response to a pointer event
 */
enum PointerAction {
	onClick,
	onHover
};