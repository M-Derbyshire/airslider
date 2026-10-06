import { GameLoopStatus } from "../../GameLoopManager/IGameLoopManager";
import Kernel from "../../Kernel";
import KeyboardEventManager from "./KeyboardEventManager";

describe("KeyboardEventManager", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should add the keyboard event listeners to the window object, on construction", () => {
        const capturedEventHandlers:{type:string, handler:EventListenerOrEventListenerObject}[] = [];
        jest.spyOn(window, "addEventListener").mockImplementation(
            (type, handler) => {
                capturedEventHandlers.push({ type, handler });
            }
        );
    
        const manager = new KeyboardEventManager(); // This should populate the capturedEventHandlers array

        expect(capturedEventHandlers.length).toBe(2);
        expect(capturedEventHandlers[0].type).toBe("keydown");
        expect(capturedEventHandlers[1].type).toBe("keyup");

        // Now test that the handlers are correct, by adding some handler callbacks, and ensuring they get called
        const keyDownHandler1 = jest.fn();
        const keyDownHandler2 = jest.fn();
        const keyUpHandler1 = jest.fn();
        const keyUpHandler2 = jest.fn();

        manager.addKeyDownEventCallback(keyDownHandler1, true);
        manager.addKeyDownEventCallback(keyDownHandler2, true);
        manager.addKeyUpEventCallback(keyUpHandler1, true);
        manager.addKeyUpEventCallback(keyUpHandler2, true);

        expect(keyDownHandler1).not.toHaveBeenCalled();
        expect(keyDownHandler2).not.toHaveBeenCalled();
        expect(keyUpHandler1).not.toHaveBeenCalled();
        expect(keyUpHandler2).not.toHaveBeenCalled();

        (capturedEventHandlers[0].handler as any)(new KeyboardEvent("keydown"));
        expect(keyDownHandler1).toHaveBeenCalledTimes(1);
        expect(keyDownHandler2).toHaveBeenCalledTimes(1);
        expect(keyUpHandler1).not.toHaveBeenCalled();
        expect(keyUpHandler2).not.toHaveBeenCalled();
        
        (capturedEventHandlers[1].handler as any)(new KeyboardEvent("keyup"));
        expect(keyUpHandler1).toHaveBeenCalledTimes(1);
        expect(keyUpHandler2).toHaveBeenCalledTimes(1);
        expect(keyDownHandler1).toHaveBeenCalledTimes(1);
        expect(keyDownHandler2).toHaveBeenCalledTimes(1);
    });

    describe("addKeyDownEventCallback", () => {
        it("should add callbacks to the list of callbacks that should be called when a keydown event occurs", () => {
            const keyDownHandler1 = jest.fn();
            const keyDownHandler2 = jest.fn();

            const manager = new KeyboardEventManager();
            manager.addKeyDownEventCallback(keyDownHandler1, true);
            manager.addKeyDownEventCallback(keyDownHandler2, true);

            expect(keyDownHandler1).not.toHaveBeenCalled();
            expect(keyDownHandler2).not.toHaveBeenCalled();

            window.dispatchEvent(new KeyboardEvent("keydown"));

            expect(keyDownHandler1).toHaveBeenCalledTimes(1);
            expect(keyDownHandler2).toHaveBeenCalledTimes(1);
        });

        it.each([
            [false],
            [undefined] // should default to false
        ])(
            "should add a callback in a way that ensures it doesn't get called when the game is paused, if isActiveWhenPaused is false",
            (isActiveWhenPaused?:boolean) => {
                const keyDownHandler = jest.fn();

                const manager = new KeyboardEventManager();
                manager.addKeyDownEventCallback(keyDownHandler, isActiveWhenPaused);

                window.dispatchEvent(new KeyboardEvent("keydown"));
                expect(keyDownHandler).toHaveBeenCalledTimes(1);

                // The toggleGamePause Kernel method will set the game to be pre-paused, not paused,
                // so we're going to mock this property
                const statusSpy = jest.spyOn(Kernel.getInstance(), "status", "get");
                statusSpy.mockReturnValue(GameLoopStatus.Paused);

                window.dispatchEvent(new KeyboardEvent("keydown"));
                expect(keyDownHandler).toHaveBeenCalledTimes(1); // Should not be called again
            }
        );

        it("should make an added callback callable when the game is paused, if isActiveWhenPaused is true", () => {
            const keyDownHandler = jest.fn();

            const manager = new KeyboardEventManager();
            manager.addKeyDownEventCallback(keyDownHandler, true);

            window.dispatchEvent(new KeyboardEvent("keydown"));
            expect(keyDownHandler).toHaveBeenCalledTimes(1);

            // The toggleGamePause Kernel method will set the game to be pre-paused, not paused,
            // so we're going to mock this property
            const statusSpy = jest.spyOn(Kernel.getInstance(), "status", "get");
            statusSpy.mockReturnValue(GameLoopStatus.Paused);

            window.dispatchEvent(new KeyboardEvent("keydown"));
            expect(keyDownHandler).toHaveBeenCalledTimes(2);
        });
    });

    describe("addKeyUpEventCallback", () => {
        it("should add callbacks to the list of callbacks that should be called when a keyup event occurs", () => {
            const keyUpHandler1 = jest.fn();
            const keyUpHandler2 = jest.fn();

            const manager = new KeyboardEventManager();
            manager.addKeyUpEventCallback(keyUpHandler1, true);
            manager.addKeyUpEventCallback(keyUpHandler2, true);

            expect(keyUpHandler1).not.toHaveBeenCalled();
            expect(keyUpHandler2).not.toHaveBeenCalled();

            window.dispatchEvent(new KeyboardEvent("keyup"));

            expect(keyUpHandler1).toHaveBeenCalledTimes(1);
            expect(keyUpHandler2).toHaveBeenCalledTimes(1);
        });

        it.each([
            [false],
            [undefined] // should default to false
        ])(
            "should add a callback in a way that ensures it doesn't get called when the game is paused, if isActiveWhenPaused is false",
            (isActiveWhenPaused?:boolean) => {
                const keyUpHandler = jest.fn();

                const manager = new KeyboardEventManager();
                manager.addKeyUpEventCallback(keyUpHandler, isActiveWhenPaused);

                window.dispatchEvent(new KeyboardEvent("keyup"));
                expect(keyUpHandler).toHaveBeenCalledTimes(1);

                // The toggleGamePause Kernel method will set the game to be pre-paused, not paused,
                // so we're going to mock this property
                const statusSpy = jest.spyOn(Kernel.getInstance(), "status", "get");
                statusSpy.mockReturnValue(GameLoopStatus.Paused);

                window.dispatchEvent(new KeyboardEvent("keyup"));
                expect(keyUpHandler).toHaveBeenCalledTimes(1); // Should not be called again
            }
        );

        it("should make an added callback callable when the game is paused, if isActiveWhenPaused is true", () => {
            const keyUpHandler = jest.fn();

            const manager = new KeyboardEventManager();
            manager.addKeyUpEventCallback(keyUpHandler, true);

            window.dispatchEvent(new KeyboardEvent("keyup"));
            expect(keyUpHandler).toHaveBeenCalledTimes(1);

            // The toggleGamePause Kernel method will set the game to be pre-paused, not paused,
            // so we're going to mock this property
            const statusSpy = jest.spyOn(Kernel.getInstance(), "status", "get");
            statusSpy.mockReturnValue(GameLoopStatus.Paused);

            window.dispatchEvent(new KeyboardEvent("keyup"));
            expect(keyUpHandler).toHaveBeenCalledTimes(2);
        });
    });

    describe("removeKeyboardEventCallbacks", () => {
        it("should clear the keyup and keydown event callback lists", () => {
            const manager = new KeyboardEventManager();
            
            const keyDownHandler1 = jest.fn();
            const keyDownHandler2 = jest.fn();
            const keyUpHandler1 = jest.fn();
            const keyUpHandler2 = jest.fn();

            manager.addKeyDownEventCallback(keyDownHandler1, true);
            manager.addKeyDownEventCallback(keyDownHandler2, true);
            manager.addKeyUpEventCallback(keyUpHandler1, true);
            manager.addKeyUpEventCallback(keyUpHandler2, true);

            manager.removeKeyboardEventCallbacks();

            window.dispatchEvent(new KeyboardEvent("keyup"));
            window.dispatchEvent(new KeyboardEvent("keydown"));

            expect(keyDownHandler1).not.toHaveBeenCalled();
            expect(keyDownHandler2).not.toHaveBeenCalled();
            expect(keyUpHandler1).not.toHaveBeenCalled();
            expect(keyUpHandler2).not.toHaveBeenCalled();
        });
    });

    describe("removeEventHandlers", () => {
        it("should remove the correct handlers for keyup and keydown events", () => {
            type capturedEventCall = {type:string, handler:EventListenerOrEventListenerObject};

            // First, we want to capture the handlers that were passed to addEventListener
            const capturedAddEventCalls:capturedEventCall[] = [];
            jest.spyOn(window, "addEventListener").mockImplementation(
                (type, handler) => {
                    capturedAddEventCalls.push({ type, handler });
                }
            );
        
            const manager = new KeyboardEventManager(); // This should populate the capturedEventHandlers array
            expect(capturedAddEventCalls.length).toBe(2);

            // Now we capture the handlers that were passed to removeEventListener
            const capturedRemoveEventCalls:capturedEventCall[] = [];
            jest.spyOn(window, "removeEventListener").mockImplementation(
                (type, handler) => {
                    capturedRemoveEventCalls.push({ type, handler });
                }
            );

            manager.removeEventHandlers();

            expect(capturedRemoveEventCalls.length).toBe(2);
            expect(capturedRemoveEventCalls[0].type).toBe("keydown");
            expect(capturedRemoveEventCalls[1].type).toBe("keyup");

            // Check that the same handlers that were passed to addEventListener were
            // passed to removeEventListener
            expect(capturedRemoveEventCalls[0].handler).toBe(capturedAddEventCalls[0].handler);
            expect(capturedRemoveEventCalls[1].handler).toBe(capturedAddEventCalls[1].handler);
        });
    });
});