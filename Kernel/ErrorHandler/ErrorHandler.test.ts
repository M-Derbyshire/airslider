import ErrorHandler from "./ErrorHandler";

describe("ErrorHandler", () => {
    const createCanvasContext = (width:number = 10, height:number = 10):CanvasRenderingContext2D => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas.getContext("2d")!;
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("handleError", () => {
        const expectedErrorTitle = "An Error has Occurred";
        const expectedErrorMessage = "Please see the developer console for more details";

        it("should log the given Error object", () => {
            const error = new Error("my error message");

            const handler = new ErrorHandler(createCanvasContext());
            const consoleSpy = jest.spyOn(console, "error");

            handler.handleError(error);

            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(error);
        });

        it.each([
            [{ message: "test error 1" }, "test error 1"],
            ["test error 2", "test error 2"],
            [42, "42"]
        ])("should log the given value as an error message", (value:any, expected:any) => {
            const handler = new ErrorHandler(createCanvasContext());
            const consoleSpy = jest.spyOn(console, "error");

            handler.handleError(value);

            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(expected);
        });

        it("should draw the background color across the whole canvas", () => {
            const expectedColor = "#330000";
            const expectedWidth = 301;
            const expectedHeight = 314;

            const context = createCanvasContext(expectedWidth, expectedHeight);
            
            // We want to capture the calls to methods/setters, to ensure they
            // are called in the correct order (this array will hold the names
            // of the methods/setters as they are called).
            const capturedMethodCalls:string[] = [];
            const fillStyleSetterMock = jest.fn().mockImplementation(() => capturedMethodCalls.push("fillStyle"));
            const fillRectMock = jest.fn().mockImplementation(() => capturedMethodCalls.push("fillRect"));

            // We're also going to add the fillText calls, to ensure the background is drawn first
            const fillTextMock = jest.fn().mockImplementation(() => capturedMethodCalls.push("fillText"));

            Object.defineProperty(context, "fillStyle", {
                set: fillStyleSetterMock
            });
            context.fillRect = fillRectMock;
            context.fillText = fillTextMock;

            // Now we can trigger the error, and check the results are in order
            const handler = new ErrorHandler(context);
            handler.handleError("test");

            // Only 2 calls are made for the draw-background procedure (others calls may be made)
            expect(capturedMethodCalls.length).toBe(5);
            expect(capturedMethodCalls[0]).toBe("fillStyle");
            expect(capturedMethodCalls[1]).toBe("fillRect");

            expect(fillStyleSetterMock).toHaveBeenNthCalledWith(1, expectedColor);
            expect(fillRectMock).toHaveBeenNthCalledWith(1, 0, 0, expectedWidth, expectedHeight);
        });

        it.each([
            [1000, 750, 500, 187.5, 562.5],
            [731, 1001, 365.5, 250.25, 750.75],
            [100, 100, 50, 25, 75]
        ])(
            "should draw the correct error text, in the correct positions on the canvas", 
            (canvasWidth:number, canvasHeight:number, expectedX:number, expectedTitleY:number, expectedMessageY:number) => {
                const context = createCanvasContext(canvasWidth, canvasHeight);
                context.fillText = jest.fn();

                const handler = new ErrorHandler(context);
                handler.handleError("test");

                expect(context.fillText).toHaveBeenCalledTimes(2);
                expect(context.fillText).toHaveBeenCalledWith(expectedErrorTitle, expectedX, expectedTitleY);
                expect(context.fillText).toHaveBeenCalledWith(expectedErrorMessage, expectedX, expectedMessageY);
            }
        );

        it.each([
            [1000, 20],
            [750, 15],
            [12, 0.24]
        ])("should set the correct font-sizes and font-styling for the texts", (canvasWidth:number, expectedMessageSize:number) => {
            const expectedTitleSize = expectedMessageSize * 2;
            const expectedTitleFontStyling = `bolder ${expectedTitleSize}px Arial`;
            const expectedMessageFontStyling = `normal ${expectedMessageSize}px Arial`;
            const expectedTextAlign = "center";
            const expectedFontColor = "#fbb";

            const context = createCanvasContext(canvasWidth);
            const fontSetterMock = jest.fn();
            const textAlignSetterMock = jest.fn();
            const fillStyleSetterMock = jest.fn();

            Object.defineProperties(context, {
                font: {
                    set: fontSetterMock
                },
                textAlign: {
                    set: textAlignSetterMock
                },
                fillStyle: {
                    set: fillStyleSetterMock
                }
            });

            const handler = new ErrorHandler(context);
            handler.handleError("test");

            expect(fontSetterMock).toHaveBeenCalledTimes(2);
            expect(fontSetterMock).toHaveBeenNthCalledWith(1, expectedTitleFontStyling);
            expect(fontSetterMock).toHaveBeenNthCalledWith(2, expectedMessageFontStyling);

            expect(textAlignSetterMock).toHaveBeenCalledTimes(1);
            expect(textAlignSetterMock).toHaveBeenCalledWith(expectedTextAlign);

            expect(fillStyleSetterMock).toHaveBeenCalledTimes(2); // The first is for the background
            expect(fillStyleSetterMock).toHaveBeenLastCalledWith(expectedFontColor);
        });

        it("should set the correct properties on the context, prior to drawing the text values", () => {
            const canvasWidth = 1000;
            const canvasHeight = 750;
            const expectedTextX = 500;
            const expectedTitleY = 187.5;
            const expectedMessageY = 562.5;

            const expectedFontColor = "#fbb";
            const expectedTextAlign = "center";
            const expectedMessageSize = 20;
            const expectedTitleFontStyling = `bolder ${expectedMessageSize * 2}px Arial`;
            const expectedMessageFontStyling = `normal ${expectedMessageSize}px Arial`;

            const context = createCanvasContext(canvasWidth, canvasHeight);

            // We're going to capture the method/setter names as they're called (along
            // with the values they're called with). This will allow us to ensure that
            // they're called in the correct order
            const capturedMethodCalls:{ name: string, values: any[] }[] = [];
            const fillStyleSetterMock = jest.fn().mockImplementation(val => capturedMethodCalls.push({ name: "fillStyle", values: [val] }));
            const textAlignSetterMock = jest.fn().mockImplementation(val => capturedMethodCalls.push({ name: "textAlign", values: [val] }));
            const fontSetterMock = jest.fn().mockImplementation(val => capturedMethodCalls.push({ name: "font", values: [val] }));
            const fillTextMock = jest.fn().mockImplementation((text, x, y) => capturedMethodCalls.push({ name: "fillText", values: [text, x, y] }));

            context.fillText = fillTextMock;
            Object.defineProperties(context, {
                fillStyle: {
                    set: fillStyleSetterMock
                },
                textAlign: {
                    set: textAlignSetterMock
                },
                font: {
                    set: fontSetterMock
                }
            });

            const handler = new ErrorHandler(context);
            handler.handleError("test");

            expect(fillStyleSetterMock).toHaveBeenCalledTimes(2); // The first is for the background color
            expect(fillStyleSetterMock).toHaveBeenLastCalledWith(expectedFontColor);

            expect(textAlignSetterMock).toHaveBeenCalledTimes(1);
            expect(textAlignSetterMock).toHaveBeenCalledWith(expectedTextAlign);

            expect(fontSetterMock).toHaveBeenCalledTimes(2);
            expect(fontSetterMock).toHaveBeenNthCalledWith(1, expectedTitleFontStyling);
            expect(fontSetterMock).toHaveBeenNthCalledWith(2, expectedMessageFontStyling);

            expect(fillTextMock).toHaveBeenCalledTimes(2);
            expect(fillTextMock).toHaveBeenNthCalledWith(1, expectedErrorTitle, expectedTextX, expectedTitleY);
            expect(fillTextMock).toHaveBeenNthCalledWith(2, expectedErrorMessage, expectedTextX, expectedMessageY);

            // Now check that everything was called in the correct order
            expect(capturedMethodCalls.length).toBe(7);
            
            expect(capturedMethodCalls[0].name).toBe("fillStyle"); // background color, so ignore value
            expect(capturedMethodCalls[1].name).toBe("fillStyle");
            expect(capturedMethodCalls[1].values[0]).toBe(expectedFontColor);

            expect(capturedMethodCalls[2].name).toBe("textAlign");
            expect(capturedMethodCalls[2].values[0]).toBe(expectedTextAlign);

            // Drawing the title
            expect(capturedMethodCalls[3].name).toBe("font");
            expect(capturedMethodCalls[3].values[0]).toBe(expectedTitleFontStyling);
            expect(capturedMethodCalls[4].name).toBe("fillText");
            expect(capturedMethodCalls[4].values[0]).toBe(expectedErrorTitle);
            expect(capturedMethodCalls[4].values[1]).toBe(expectedTextX);
            expect(capturedMethodCalls[4].values[2]).toBe(expectedTitleY);

            // Drawing the error message
            expect(capturedMethodCalls[5].name).toBe("font");
            expect(capturedMethodCalls[5].values[0]).toBe(expectedMessageFontStyling);
            expect(capturedMethodCalls[6].name).toBe("fillText");
            expect(capturedMethodCalls[6].values[0]).toBe(expectedErrorMessage);
            expect(capturedMethodCalls[6].values[1]).toBe(expectedTextX);
            expect(capturedMethodCalls[6].values[2]).toBe(expectedMessageY);
        });
    });
});