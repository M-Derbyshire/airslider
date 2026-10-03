import UnitHelper from "../../utils/UnitHelper";
import Camera from "./Camera";
import ICamera from "./ICamera";

describe("Camera", () => {
    // The setCameraPosition method centers the camera on the given values,
    // so this lets you set the X/Y positions to explicit values
    const setCameraPositionByTopLeftCorner = (camera:ICamera, x:number, y:number, unitsOnEachAxis:number) => {
        const unitsCenter = unitsOnEachAxis / 2;
        camera.setCameraPosition(
            unitsCenter + x,
            unitsCenter + y
        );
    };

    it("should set the correct default values on construction", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 100;

        const context = canvas.getContext("2d")!;
        context.fillStyle = "#00ff00";
        context.fill = jest.fn();
        context.rect = jest.fn();

        const unitsWithinCameraX = 502;
        const unitsWithinCameraY = 303;

        const camera = new Camera(canvas, 16, 9, unitsWithinCameraX, unitsWithinCameraY);

        expect(camera.unitsWithinCameraX).toBe(unitsWithinCameraX);
        expect(camera.unitsWithinCameraY).toBe(unitsWithinCameraY);

        expect(camera.drawSpacePositionX).toBe(0);
        expect(camera.drawSpacePositionY).toBe(0);

        // Check background and letterboxing have default color
        // (if the drawBack or drawFront methods start to do more
        // in the future, then this test will need rethinking)
        const defaultColor = "#000000";

        camera.drawBack();
        expect(context.rect).toHaveBeenCalledTimes(1);
        expect(context.rect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
        expect(context.fill).toHaveBeenCalledTimes(1);
        expect(context.fillStyle).toBe(defaultColor);

        // reset color
        context.fillStyle = "#00ff00";

        camera.drawFront();
        expect(context.rect).toHaveBeenCalledTimes(3); // 2 more (one for each letterbox)
        expect(context.fill).toHaveBeenCalledTimes(2);
        expect(context.fillStyle).toBe(defaultColor);
    });

    it("should trigger the setCameraSize method on construction", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 100;

        const unitsWithinCameraX = 502;
        const unitsWithinCameraY = 303;

        const camera = new Camera(canvas, 16, 9, unitsWithinCameraX, unitsWithinCameraY);

        expect(camera.canvasPositionX).toBe(11.111111111111114);
        expect(camera.canvasPositionY).toBe(0);
        expect(camera.canvasPositionWidth).toBe(177.77777777777777);
        expect(camera.canvasPositionHeight).toBe(100);
    });

    describe("setCameraSize", () => {
        it.each([
            ["landscape ratio on landscape canvas", 16, 9, 200, 100],
            ["landscape ratio on portrait canvas", 17, 8, 100, 200],
            ["portrait ratio on landscape canvas", 9, 16, 200, 100],
            ["portrait ratio on portrait canvas", 8, 17, 100, 200],
        ])(
            "should set camera size to be portrait or landscape, based on aspect ratio: %s",
            (
                _:string,
                ratioX:number,
                ratioY:number,
                canvasWidth:number,
                canvasHeight:number,
            ) => {
                const canvas = document.createElement("canvas");
                // initial values, so constructor doesn't trigger calculating of the expected values
                canvas.width = 0;
                canvas.height = 0;

                const camera = new Camera(canvas, ratioX, ratioY, 1000, 1000);

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                camera.setCameraSize();

                const results = {
                    x: camera.canvasPositionX,
                    y: camera.canvasPositionY,
                    width: camera.canvasPositionWidth,
                    height: camera.canvasPositionHeight
                };

                expect(results).toMatchSnapshot();
            }
        );

        it("should set expected positions/dimensions based on aspect ratio and canvas size", () => {
            const testData:{ ratioX: number, ratioY:number, canvasWidth:number, canvasHeight:number }[] = [
                // Landscape ratios
                { ratioX: 97, ratioY: 40, canvasWidth: 364, canvasHeight: 135 },
                { ratioX: 51, ratioY: 18, canvasWidth: 631, canvasHeight: 1187 },
                { ratioX: 59, ratioY: 3, canvasWidth: 316, canvasHeight: 913 },
                { ratioX: 76, ratioY: 29, canvasWidth: 313, canvasHeight: 1273 },
                { ratioX: 75, ratioY: 37, canvasWidth: 703, canvasHeight: 835 },
                { ratioX: 26, ratioY: 11, canvasWidth: 1071, canvasHeight: 300 },
                { ratioX: 83, ratioY: 5, canvasWidth: 239, canvasHeight: 948 },
                { ratioX: 64, ratioY: 14, canvasWidth: 1091, canvasHeight: 1150 },
                { ratioX: 98, ratioY: 52, canvasWidth: 1442, canvasHeight: 1014 },
                { ratioX: 81, ratioY: 45, canvasWidth: 139, canvasHeight: 13 },
                { ratioX: 53, ratioY: 5, canvasWidth: 631, canvasHeight: 938 },
                { ratioX: 82, ratioY: 46, canvasWidth: 753, canvasHeight: 1145 },
                { ratioX: 36, ratioY: 15, canvasWidth: 300, canvasHeight: 1485 },
                { ratioX: 64, ratioY: 26, canvasWidth: 1170, canvasHeight: 1228 },
                { ratioX: 82, ratioY: 4, canvasWidth: 99, canvasHeight: 1170 },
                { ratioX: 97, ratioY: 26, canvasWidth: 1086, canvasHeight: 1484 },
                { ratioX: 66, ratioY: 6, canvasWidth: 365, canvasHeight: 983 },
                { ratioX: 67, ratioY: 13, canvasWidth: 935, canvasHeight: 565 },
                { ratioX: 97, ratioY: 26, canvasWidth: 457, canvasHeight: 536 },
                { ratioX: 92, ratioY: 72, canvasWidth: 121, canvasHeight: 398 },

                // Portrait ratios
                { ratioX: 29, ratioY: 94, canvasWidth: 533, canvasHeight: 602 },
                { ratioX: 68, ratioY: 94, canvasWidth: 1020, canvasHeight: 527 },
                { ratioX: 33, ratioY: 95, canvasWidth: 1410, canvasHeight: 1177 },
                { ratioX: 25, ratioY: 58, canvasWidth: 1227, canvasHeight: 1061 },
                { ratioX: 53, ratioY: 67, canvasWidth: 981, canvasHeight: 280 },
                { ratioX: 26, ratioY: 58, canvasWidth: 746, canvasHeight: 139 },
                { ratioX: 15, ratioY: 97, canvasWidth: 417, canvasHeight: 193 },
                { ratioX: 16, ratioY: 72, canvasWidth: 1349, canvasHeight: 1030 },
                { ratioX: 1, ratioY: 67, canvasWidth: 448, canvasHeight: 284 },
                { ratioX: 13, ratioY: 80, canvasWidth: 732, canvasHeight: 836 },
                { ratioX: 35, ratioY: 49, canvasWidth: 299, canvasHeight: 708 },
                { ratioX: 51, ratioY: 60, canvasWidth: 563, canvasHeight: 1332 },
                { ratioX: 24, ratioY: 5, canvasWidth: 454, canvasHeight: 126 },
                { ratioX: 27, ratioY: 93, canvasWidth: 198, canvasHeight: 1158 },
                { ratioX: 2, ratioY: 76, canvasWidth: 958, canvasHeight: 1151 },
                { ratioX: 20, ratioY: 73, canvasWidth: 461, canvasHeight: 381 },
                { ratioX: 23, ratioY: 71, canvasWidth: 1317, canvasHeight: 812 },
                { ratioX: 88, ratioY: 95, canvasWidth: 120, canvasHeight: 465 },
                { ratioX: 27, ratioY: 41, canvasWidth: 444, canvasHeight: 1026 },
                { ratioX: 9, ratioY: 97, canvasWidth: 242, canvasHeight: 148 },
            ];

            // Populate the results with the test data above, and then compare with snapshot
            const results:{ x:number, y:number, width:number, height:number }[] = [];
            testData.forEach((td) => {
                const canvas = document.createElement("canvas");
                // initial values, so constructor doesn't trigger calculating of the expected values
                canvas.width = 0;
                canvas.height = 0;

                const camera = new Camera(canvas, td.ratioX, td.ratioY, 1000, 1000);

                canvas.width = td.canvasWidth;
                canvas.height = td.canvasHeight;

                camera.setCameraSize();

                const result = {
                    x: camera.canvasPositionX,
                    y: camera.canvasPositionY,
                    width: camera.canvasPositionWidth,
                    height: camera.canvasPositionHeight
                };

                results.push(result);
            });

            expect(results).toMatchSnapshot();
        });
    });

    describe("setColors", () => {
        it.each([
            ["#009900", "#559955"],
            ["#000099", "#550000"],
            ["#ffff00", "#00ff00"],
        ])("should set the expected empty-space and letterbox colors", (emptySpaceColor:string, letterboxColor:string) => {
            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            const context = canvas.getContext("2d")!;
            context.fill = jest.fn();

            camera.setColors(emptySpaceColor, letterboxColor);

            // Check correct colors are being used.
            // (if drawBack or drawFront start triggering more things in the
            // future, then this test may need rethinking)
            camera.drawBack();
            expect(context.fill).toHaveBeenCalledTimes(1);
            expect(context.fillStyle).toBe(emptySpaceColor);

            // reset color
            context.fillStyle = "#000000";

            camera.drawFront();
            expect(context.fill).toHaveBeenCalledTimes(2);
            expect(context.fillStyle).toBe(letterboxColor);
        });
    });

    describe("isOnCamera", () => {
        it.each([
            ["overlapping top left corner", -1, -2, 20, 25, true],
            ["overlapping bottom left corner", -5, 850, 20, 100, true],
            ["overlapping top right corner", 1550, -10, 100, 20, true],
            ["overlapping bottom right corner", 1550, 850, 100, 105, true],
            ["fully in camera", 200, 201, 10, 10, true],
            ["off at left", -200, 100, 100, 100, false],
            ["off at top", 100, -200, 100, 100, false],
            ["off at right", 1700, 100, 100, 100, false],
            ["off at bottom", 100, 1000, 100, 100, false]
        ])(
            "should return correct result if the entity is/isn't on camera: %s",
            (
                _:string,
                entityXPixels:number,
                entityYPixels:number,
                entityWidthPixels:number,
                entityHeightPixels:number,
                expected:boolean
            ) => {
                const canvas = document.createElement("canvas");
                canvas.width = 1600;
                canvas.height = 900;

                const unitsOnAxis = 1000;
                const camera = new Camera(canvas, 16, 9, unitsOnAxis, unitsOnAxis);

                // First we want to move the camera to a specific position, to
                // ensure that is being considered in the calculations.
                const cameraX = 5;
                const cameraY = 10;
                setCameraPositionByTopLeftCorner(camera, cameraX, cameraY, unitsOnAxis);

                // Now we can check the entity is in the camera's view
                const result = camera.isOnCamera(entityXPixels, entityYPixels, entityWidthPixels, entityHeightPixels);
                expect(result).toBe(expected);
            }
        );
    });

    describe("drawBack", () => {
        it.each([
            [165, 95],
            [90, 160],
            [500, 500]
        ])("should draw empty space color over whole canvas", (canvasWidth:number, canvasHeight:number) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            const context = canvas.getContext("2d")!

            // We're going to capture the order that these methods were called in
            const methodCalls:string[] = [];
            context.rect = jest.fn().mockImplementation(() => methodCalls.push("rect"));
            context.fill = jest.fn().mockImplementation(() => methodCalls.push("fill"));

            const camera = new Camera(canvas, 16, 9, 1000, 1000);

            expect(context.rect).toHaveBeenCalledTimes(0);
            expect(context.fill).toHaveBeenCalledTimes(0);

            const emptySpaceColor = "#ff5599";
            camera.setColors(emptySpaceColor, "#000000");

            camera.drawBack();

            expect(context.fillStyle).toBe(emptySpaceColor);
            expect(context.rect).toHaveBeenCalledTimes(1);
            expect(context.rect).toHaveBeenCalledWith(0, 0, canvasWidth, canvasHeight);
            expect(context.fill).toHaveBeenCalledTimes(1);

            // Check methods called in correct order
            expect(methodCalls.length).toBe(2);
            expect(methodCalls[0]).toBe("rect");
            expect(methodCalls[1]).toBe("fill");
        });
    });

    describe("drawFront", () => {
        it.each([
            ["landscape ratio on landscape canvas", 16, 9, 200, 100],
            ["landscape ratio on portrait canvas", 17, 8, 100, 200],
            ["portrait ratio on landscape canvas", 9, 16, 200, 100],
            ["portrait ratio on portrait canvas", 8, 17, 100, 200],
        ])(
            "should draw letterboxes with correct color and expected positions/dimensions: %s",
            (
                _:string,
                ratioX:number,
                ratioY:number,
                canvasWidth:number,
                canvasHeight:number,
            ) => {
                const canvas = document.createElement("canvas");
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                const context = canvas.getContext("2d")!;

                // We're going to capture the order that these methods were called in
                // (to ensure rect is called before fill).
                // We're also going to capture the data they were called with
                const capturedCallData:{method:string,params:any[]}[] = [];
                context.beginPath = jest.fn().mockImplementation(() => capturedCallData.push({ method: "beginPath", params: [] }));
                context.rect = jest.fn().mockImplementation(
                    (x, y, w, h) => capturedCallData.push({ method: "rect", params: [x, y, w, h] })
                );
                context.fill = jest.fn().mockImplementation(() => capturedCallData.push({ method: "fill", params: [] }));

                const camera = new Camera(canvas, ratioX, ratioY, 1000, 1000);

                const letterboxColor = "#ff5599";
                camera.setColors("#000000", letterboxColor);

                camera.drawFront();

                expect(context.fillStyle).toBe(letterboxColor);

                expect(context.beginPath).toHaveBeenCalledTimes(1);
                expect(context.rect).toHaveBeenCalledTimes(2);
                expect(context.fill).toHaveBeenCalledTimes(1);

                expect(capturedCallData.length).toBe(4);
                expect(capturedCallData[0].method).toBe("beginPath");
                expect(capturedCallData[1].method).toBe("rect");
                expect(capturedCallData[2].method).toBe("rect");
                expect(capturedCallData[3].method).toBe("fill");

                // Now we're going to snapshot the rect call parameters
                const results:{x:number, y:number, width:number, height:number}[] = [];
                capturedCallData.forEach((callData) => {

                    if(callData.method === "rect") {
                        const result = {
                            x: callData.params[0],
                            y: callData.params[1],
                            width: callData.params[2],
                            height: callData.params[3]
                        };

                        results.push(result);
                    }
                });

                expect(results).toMatchSnapshot();
            }
        );
    });

    describe("setCameraPosition", () => {
        it.each([
            [2000, 1000, 1000, 500, 0, 0],
            [2000, 1000, 400, 20, -600, -480],
            [1000, 500, 600, 300, 100, 50]
        ])(
            "should position the camera so the center of the camera is at the given X/Y values",
            (unitsInCameraX:number, unitsInCameraY:number, centerX:number, centerY:number, expectedX:number, expectedY:number) => {
                const canvas = document.createElement("canvas");

                const camera = new Camera(canvas, 16, 9, unitsInCameraX, unitsInCameraY);

                camera.setCameraPosition(centerX, centerY);

                expect(camera.drawSpacePositionX).toBe(expectedX);
                expect(camera.drawSpacePositionY).toBe(expectedY);
            }
        );
    });

    describe("moveLeft", () => {
        it("should move camera left by given amount", () => {
            // We don't need to test the exact number that's calculated.
            // We just want to ensure the number we give is passed to the
            // UnitHelper's consistentSpeed method, and that the result
            // uses the value returned from that

            const canvas = document.createElement("canvas");
            const unitsOnAxis = 1000;
            const camera = new Camera(canvas, 16, 9, unitsOnAxis, unitsOnAxis);

            const cameraPositionShift = 5;
            setCameraPositionByTopLeftCorner(camera, cameraPositionShift, cameraPositionShift, unitsOnAxis);

            const consistentSpeedResult = 142; // arbitrary number
            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(consistentSpeedResult);

            const speed = 42;
            camera.moveLeft(speed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(speed);

            const resultPosition = camera.drawSpacePositionX;
            expect(resultPosition).toBe(cameraPositionShift - consistentSpeedResult);
        });
    });

    describe("moveRight", () => {
        it("should move camera right by given amount", () => {
            // We don't need to test the exact number that's calculated.
            // We just want to ensure the number we give is passed to the
            // UnitHelper's consistentSpeed method, and that the result
            // uses the value returned from that

            const canvas = document.createElement("canvas");
            const unitsOnAxis = 1000;
            const camera = new Camera(canvas, 16, 9, unitsOnAxis, unitsOnAxis);

            const cameraPositionShift = 5;
            setCameraPositionByTopLeftCorner(camera, cameraPositionShift, cameraPositionShift, unitsOnAxis);

            const consistentSpeedResult = 142; // arbitrary number
            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(consistentSpeedResult);

            const speed = 42;
            camera.moveRight(speed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(speed);

            const resultPosition = camera.drawSpacePositionX;
            expect(resultPosition).toBe(cameraPositionShift + consistentSpeedResult);
        });
    });

    describe("moveUp", () => {
        it("should move camera up by given amount", () => {
            // We don't need to test the exact number that's calculated.
            // We just want to ensure the number we give is passed to the
            // UnitHelper's consistentSpeed method, and that the result
            // uses the value returned from that

            const canvas = document.createElement("canvas");
            const unitsOnAxis = 1000;
            const camera = new Camera(canvas, 16, 9, unitsOnAxis, unitsOnAxis);

            const cameraPositionShift = 5;
            setCameraPositionByTopLeftCorner(camera, cameraPositionShift, cameraPositionShift, unitsOnAxis);

            const consistentSpeedResult = 142; // arbitrary number
            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(consistentSpeedResult);

            const speed = 42;
            camera.moveUp(speed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(speed);

            const resultPosition = camera.drawSpacePositionY;
            expect(resultPosition).toBe(cameraPositionShift - consistentSpeedResult);
        });
    });

    describe("moveDown", () => {
        it("should move camera down by given amount", () => {
            // We don't need to test the exact number that's calculated.
            // We just want to ensure the number we give is passed to the
            // UnitHelper's consistentSpeed method, and that the result
            // uses the value returned from that

            const canvas = document.createElement("canvas");
            const unitsOnAxis = 1000;
            const camera = new Camera(canvas, 16, 9, unitsOnAxis, unitsOnAxis);

            const cameraPositionShift = 5;
            setCameraPositionByTopLeftCorner(camera, cameraPositionShift, cameraPositionShift, unitsOnAxis);

            const consistentSpeedResult = 142; // arbitrary number
            const unitHelperSpy = jest.spyOn(UnitHelper, "consistentSpeed");
            unitHelperSpy.mockReturnValue(consistentSpeedResult);

            const speed = 42;
            camera.moveDown(speed);

            expect(unitHelperSpy).toHaveBeenCalledTimes(1);
            expect(unitHelperSpy).toHaveBeenCalledWith(speed);

            const resultPosition = camera.drawSpacePositionY;
            expect(resultPosition).toBe(cameraPositionShift + consistentSpeedResult);
        });
    });

    describe("unitCameraPositionCalc", () => {
        it.each([
            [5, 6, 10, 11],
            [-5, -4, 12, 13],
            [7, 8, -100, -101]
        ])(
            "should return the correct unit positions, based on the camera's position in the level's space",
            (x:number, y:number, cameraX:number, cameraY: number) => {
                const canvas = document.createElement("canvas");
                const unitsOnAxis = 1000;
                const camera = new Camera(canvas, 16, 9, unitsOnAxis, unitsOnAxis);
                
                setCameraPositionByTopLeftCorner(camera, cameraX, cameraY, unitsOnAxis);

                const resultX = camera.unitCameraPositionCalc.x(x);
                const resultY = camera.unitCameraPositionCalc.y(y);
                const expectedX = x - cameraX;
                const expectedY = y - cameraY;

                expect(resultX).toBe(expectedX);
                expect(resultY).toBe(expectedY);
            }
        );
    });
});