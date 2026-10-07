import { GameLoopStatus } from "../../GameLoopManager/IGameLoopManager";
import Kernel from "../../Kernel";
import PointerEventManager from "./PointerEventManager";

describe("PointerEventManager", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    const createCanvas = ():HTMLCanvasElement => {
        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;

        canvas.getBoundingClientRect = jest.fn().mockReturnValue({
            width: 100,
            height: 100,
            left: 0,
            top: 0
        });

        return canvas;
    };

    const createMouseEvent = (type: string, clientX:number, clientY:number, canvas:HTMLCanvasElement):MouseEvent => {
        const event = new MouseEvent(type);
        Object.defineProperties(event, {
            clientX: {
                value: clientX,
                configurable: true
            },
            clientY: {
                value: clientY,
                configurable: true
            },
            target: {
                value: canvas,
                configurable: true
            }
        });

        return event;
    };

    it("should add event listeners to canvas object on construction", () => {
        const canvas = createCanvas();

        // We're going to capture the event listeners that were added to the canvas
        const capturedEventHandlers:{type:string, handler:EventListenerOrEventListenerObject}[] = [];
        canvas.addEventListener = jest.fn().mockImplementation((type, handler) => capturedEventHandlers.push({ type, handler }));

        const manager = new PointerEventManager(canvas);

        expect(capturedEventHandlers.length).toBe(2);
        expect(capturedEventHandlers[0].type).toBe("click");
        expect(capturedEventHandlers[1].type).toBe("mousemove");

        const onClick = jest.fn();
        const onHover = jest.fn();
        const isPointerOverlapping = jest.fn().mockReturnValue(true);
        manager.addPointerEventSubject(
            isPointerOverlapping,
            () => true,
            onClick,
            onHover
        );

        expect(onClick).not.toHaveBeenCalled();
        expect(onHover).not.toHaveBeenCalled();

        const clickEvent = createMouseEvent("click", 50, 50, canvas);
        (capturedEventHandlers[0].handler as any)(clickEvent);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onHover).not.toHaveBeenCalled();
        expect(isPointerOverlapping).toHaveBeenCalledTimes(1);
        expect(isPointerOverlapping).toHaveBeenCalledWith(50, 50);

        const moveEvent = createMouseEvent("mousemove", 25, 25, canvas);
        (capturedEventHandlers[1].handler as any)(moveEvent);
        manager.checkForHoverEvents();
        expect(onClick).toHaveBeenCalledTimes(1); // Should not have been called again
        expect(onHover).toHaveBeenCalledTimes(1); // Should have triggered
        expect(isPointerOverlapping).toHaveBeenCalledTimes(2); // Should have another call
        expect(isPointerOverlapping).toHaveBeenCalledWith(25, 25);
    });

    describe("addPointerEventSubject", () => {
        it("should not add a subject if no onClick and onHover methods are provided", () => {
            const canvas = createCanvas();

            // We're going to capture the event listeners that were added to the canvas
            const capturedEventHandlers:{type:string, handler:EventListenerOrEventListenerObject}[] = [];
            canvas.addEventListener = jest.fn().mockImplementation((type, handler) => capturedEventHandlers.push({ type, handler }));

            const manager = new PointerEventManager(canvas);

            const isPointerOverlapping = jest.fn();

            manager.addPointerEventSubject(
                isPointerOverlapping,
                ()=>true
            );

            // Run a click event
            const clickEvent = createMouseEvent("click", 50, 50, canvas);
            (capturedEventHandlers[0].handler as any)(clickEvent);

            // Run a hover event
            manager.checkForHoverEvents();
            
            // Neither event should have called the isPointerOverlapping callback,
            // as the subject should never have been registered
            expect(isPointerOverlapping).not.toHaveBeenCalled();
        });

        it.each([
            [true],
            [false]
        ])("should add subject with given isPointerOverlapping callback", (isOverlapping:boolean) => {
            const canvas = createCanvas();
            const manager = new PointerEventManager(canvas);

            const isPointerOverlapping = jest.fn().mockReturnValue(isOverlapping);
            const onHover = jest.fn();

            manager.addPointerEventSubject(
                isPointerOverlapping,
                ()=>true,
                undefined,
                onHover
            );

            manager.checkForHoverEvents();

            expect(isPointerOverlapping).toHaveBeenCalledTimes(1);

            if(isOverlapping)
                expect(onHover).toHaveBeenCalledTimes(1);
            else
                expect(onHover).not.toHaveBeenCalled();
        });

        it.each([
            [true],
            [false]
        ])("should add subject with given isActive callback", (active:boolean) => {
            const canvas = createCanvas();
            const manager = new PointerEventManager(canvas);

            const isActive = jest.fn().mockReturnValue(active);
            const onHover = jest.fn();

            manager.addPointerEventSubject(
                jest.fn().mockReturnValue(true),
                isActive,
                undefined,
                onHover
            );

            manager.checkForHoverEvents();

            expect(isActive).toHaveBeenCalledTimes(1);

            if(active)
                expect(onHover).toHaveBeenCalledTimes(1);
            else
                expect(onHover).not.toHaveBeenCalled();
        });

        it.each([
            [jest.fn(), undefined],
            [undefined, jest.fn()],
            [jest.fn(), jest.fn()]
        ])("should add a subject with the given onClick and onHover methods", (onClick, onHover) => {
            const canvas = createCanvas();

            // We're going to capture the event listeners that were added to the canvas
            const capturedEventHandlers:{type:string, handler:EventListenerOrEventListenerObject}[] = [];
            canvas.addEventListener = jest.fn().mockImplementation((type, handler) => capturedEventHandlers.push({ type, handler }));

            const manager = new PointerEventManager(canvas);

            const isPointerOverlapping = jest.fn().mockReturnValue(true);

            manager.addPointerEventSubject(
                isPointerOverlapping,
                ()=>true,
                onClick,
                onHover
            );

            // Run a click event
            const clickEvent = createMouseEvent("click", 50, 50, canvas);
            (capturedEventHandlers[0].handler as any)(clickEvent);

            // Run a hover event
            manager.checkForHoverEvents();

            // The subject should have been added correctly
            expect(isPointerOverlapping).toHaveBeenCalledTimes(2);
            if(onClick)
                expect(onClick).toHaveBeenCalledTimes(1);
            if(onHover)
                expect(onHover).toHaveBeenCalledTimes(1);
        });

        it.each([
            [false],
            [undefined] // should default to false
        ])("should set isActiveWhenPaused method to false if false provided, to ensure actions won't trigger when game is paused", (isActiveWhenPaused?:boolean) => {
            const canvas = createCanvas();

            // We're going to capture the event listeners that were added to the canvas
            const capturedEventHandlers:{type:string, handler:EventListenerOrEventListenerObject}[] = [];
            canvas.addEventListener = jest.fn().mockImplementation((type, handler) => capturedEventHandlers.push({ type, handler }));

            const manager = new PointerEventManager(canvas);

            const onClick = jest.fn();
            const onHover = jest.fn();
            manager.addPointerEventSubject(
                () => true,
                () => true, // isActive should still return true
                onClick,
                onHover,
                isActiveWhenPaused
            );

            // The toggleGamePause Kernel method will set the game to be pre-paused, not paused,
            // so we're going to mock this property
            const statusSpy = jest.spyOn(Kernel.getInstance(), "status", "get");
            statusSpy.mockReturnValue(GameLoopStatus.Paused);

            // trigger click/hover event checks
            (capturedEventHandlers[0].handler as any)(createMouseEvent("click", 0, 0, canvas));
            manager.checkForHoverEvents();

            expect(onClick).not.toHaveBeenCalled();
            expect(onHover).not.toHaveBeenCalled();
        });

        it("should set isActiveWhenPaused to true when true provided, to ensure actions still trigger when game is paused", () => {
            const canvas = createCanvas();

            // We're going to capture the event listeners that were added to the canvas
            const capturedEventHandlers:{type:string, handler:EventListenerOrEventListenerObject}[] = [];
            canvas.addEventListener = jest.fn().mockImplementation((type, handler) => capturedEventHandlers.push({ type, handler }));

            const manager = new PointerEventManager(canvas);

            const onClick = jest.fn();
            const onHover = jest.fn();
            manager.addPointerEventSubject(
                () => true,
                () => true, // isActive should still return true
                onClick,
                onHover,
                true // isActiveWhenPaused value
            );

            // The toggleGamePause Kernel method will set the game to be pre-paused, not paused,
            // so we're going to mock this property
            const statusSpy = jest.spyOn(Kernel.getInstance(), "status", "get");
            statusSpy.mockReturnValue(GameLoopStatus.Paused);

            // trigger click/hover event checks
            (capturedEventHandlers[0].handler as any)(createMouseEvent("click", 0, 0, canvas));
            manager.checkForHoverEvents();

            expect(onClick).toHaveBeenCalledTimes(1);
            expect(onHover).toHaveBeenCalledTimes(1);
        });

        it("should add multiple subjects", () => {
            const canvas = createCanvas();
            const manager = new PointerEventManager(canvas);

            const isPointerOverlapping1 = jest.fn().mockReturnValue(true);
            const isPointerOverlapping2 = jest.fn().mockReturnValue(true);

            manager.addPointerEventSubject(
                isPointerOverlapping1,
                ()=>true,
                ()=>{},
                ()=>{}
            );

            manager.addPointerEventSubject(
                isPointerOverlapping2,
                ()=>true,
                ()=>{},
                ()=>{}
            );

            manager.checkForHoverEvents();

            expect(isPointerOverlapping1).toHaveBeenCalledTimes(1);
            expect(isPointerOverlapping2).toHaveBeenCalledTimes(1);
        });
    });

    describe("removePointerEventSubjects", () => {
        it("should clear the event subjects", () => {
            const canvas = createCanvas();
            const manager = new PointerEventManager(canvas);

            const isPointerOverlapping1 = jest.fn().mockReturnValue(true);
            const isPointerOverlapping2 = jest.fn().mockReturnValue(true);

            manager.addPointerEventSubject(
                isPointerOverlapping1,
                ()=>true,
                ()=>{},
                ()=>{}
            );

            manager.addPointerEventSubject(
                isPointerOverlapping2,
                ()=>true,
                ()=>{},
                ()=>{}
            );

            manager.removePointerEventSubjects();

            manager.checkForHoverEvents();
            expect(isPointerOverlapping1).not.toHaveBeenCalled();
            expect(isPointerOverlapping2).not.toHaveBeenCalled();
        });
    });

    describe("checkForHoverEvents", () => {
        it("should call the overlapping check, and onHover callbacks, on all subjects", () => {
            const canvas = createCanvas();
            const manager = new PointerEventManager(canvas);

            const isPointerOverlapping1 = jest.fn().mockReturnValue(true);
            const onHover1 = jest.fn();
            const onClick1 = jest.fn();

            const isPointerOverlapping2 = jest.fn().mockReturnValue(true);
            const onHover2 = jest.fn();
            const onClick2 = jest.fn();

            manager.addPointerEventSubject(
                isPointerOverlapping1,
                ()=>true,
                onClick1,
                onHover1
            );

            manager.addPointerEventSubject(
                isPointerOverlapping2,
                ()=>true,
                onClick2,
                onHover2
            );

            manager.checkForHoverEvents();

            expect(isPointerOverlapping1).toHaveBeenCalledTimes(1);
            expect(onHover1).toHaveBeenCalledTimes(1);
            expect(onClick1).not.toHaveBeenCalled();

            expect(isPointerOverlapping2).toHaveBeenCalledTimes(1);
            expect(onHover2).toHaveBeenCalledTimes(1);
            expect(onClick2).not.toHaveBeenCalled();
        });
    });

    describe("removeEventHandlers", () => {
        it("should remove the event handlers from the canvas that were created in the constructor", () => {
            type handlerInfo = {type:string, handler:EventListenerOrEventListenerObject};

            const canvas = createCanvas();

            // We're going to capture the event listeners that were added to the canvas
            const capturedAddedEventHandlers:handlerInfo[] = [];
            canvas.addEventListener = jest.fn().mockImplementation((type, handler) => capturedAddedEventHandlers.push({ type, handler }));

            const manager = new PointerEventManager(canvas); // this will add the event handlers

            expect(capturedAddedEventHandlers.length).toBe(2);
            expect(capturedAddedEventHandlers[0].type).toBe("click");
            expect(capturedAddedEventHandlers[1].type).toBe("mousemove");

            // Now we're going to capture the removed handlers
            const capturedRemovedEventHandlers:handlerInfo[] = [];
            canvas.removeEventListener = jest.fn().mockImplementation((type, handler) => capturedRemovedEventHandlers.push({ type, handler }));

            manager.removeEventHandlers();

            expect(capturedRemovedEventHandlers.length).toBe(2);
            expect(capturedRemovedEventHandlers[0].type).toBe("click");
            expect(capturedRemovedEventHandlers[1].type).toBe("mousemove");

            expect(capturedRemovedEventHandlers[0].handler).toBe(capturedAddedEventHandlers[0].handler);
            expect(capturedRemovedEventHandlers[1].handler).toBe(capturedAddedEventHandlers[1].handler);
        });
    });

    describe("pointer position logic", () => {
        const checkPointerPositionLogic = (
            canvas:HTMLCanvasElement,
            pointerOnScreenX:number,
            pointerOnScreenY:number,
            expectedPointerX:number,
            expectedPointerY:number
        ) => {
            // We're going to capture the event listeners that were added to the canvas
            const capturedEventHandlers:{type:string, handler:EventListenerOrEventListenerObject}[] = [];
            canvas.addEventListener = jest.fn().mockImplementation((type, handler) => capturedEventHandlers.push({ type, handler }));

            const manager = new PointerEventManager(canvas);

            expect(capturedEventHandlers.length).toBe(2);
            expect(capturedEventHandlers[0].type).toBe("click");
            expect(capturedEventHandlers[1].type).toBe("mousemove");

            const onClick = jest.fn();
            const onHover = jest.fn();
            const isPointerOverlapping = jest.fn().mockReturnValue(true);
            manager.addPointerEventSubject(
                isPointerOverlapping,
                () => true,
                onClick,
                onHover
            );

            // Run a move event, then check that the X/Y passed to isPointerOverlapping are correct
            const moveEvent = createMouseEvent("mousemove", pointerOnScreenX, pointerOnScreenY, canvas);
            (capturedEventHandlers[1].handler as any)(moveEvent);
            manager.checkForHoverEvents();

            expect(isPointerOverlapping).toHaveBeenCalledWith(expectedPointerX, expectedPointerY);

            // Now trigger a click event, to check the same logic is used for that
            const clickEvent = createMouseEvent("click", pointerOnScreenX, pointerOnScreenY, canvas);
            (capturedEventHandlers[0].handler as any)(clickEvent);

            expect(isPointerOverlapping).toHaveBeenCalledTimes(2);
            expect(isPointerOverlapping).toHaveBeenLastCalledWith(expectedPointerX, expectedPointerY);
        };

        it("should consider the canvas's position when determing the on-canvas position of the pointer", () => {
            const canvasX = 5;
            const canvasY = 3;
            const pointerOnScreenX = 7;
            const pointerOnScreenY = 4;
            const expectedPointerX = pointerOnScreenX - canvasX;
            const expectedPointerY = pointerOnScreenY - canvasY;

            const canvas = document.createElement("canvas");
            canvas.width = 100;
            canvas.height = 100;
            canvas.getBoundingClientRect = jest.fn().mockReturnValue({
                width: 100,
                height: 100,
                left: canvasX,
                top: canvasY
            });

            checkPointerPositionLogic(canvas, pointerOnScreenX, pointerOnScreenY, expectedPointerX, expectedPointerY);
        });

        it.each([
            [1],
            [2],
            [3]
        ])(
            "should consider the difference between the canvas size, and its styled size, when determining the on-canvas pointer position",
            (devicePixelRatio:number) => {
                const canvasX = 5;
                const canvasY = 3;
                const canvasStyleWidth = 100;
                const canvasStyleHeight = 75;
                const canvasWidth = canvasStyleWidth * devicePixelRatio;
                const canvasHeight = canvasStyleHeight * devicePixelRatio;

                const pointerOnScreenX = 7;
                const pointerOnScreenY = 4;
                const expectedPointerX = (pointerOnScreenX - canvasX) * devicePixelRatio;
                const expectedPointerY = (pointerOnScreenY - canvasY) * devicePixelRatio;

                const canvas = document.createElement("canvas");
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                canvas.getBoundingClientRect = jest.fn().mockReturnValue({
                    width: canvasStyleWidth,
                    height: canvasStyleHeight,
                    left: canvasX,
                    top: canvasY
                });

                checkPointerPositionLogic(canvas, pointerOnScreenX, pointerOnScreenY, expectedPointerX, expectedPointerY);
            }
        );
    });
});