import Camera from "../../../engines/GraphicEngine/Camera";
import LinearVanishingPointStrategy from "./LinearVanishingPointStrategy";

describe("LinearVanishingPointStrategy", () => {
    const drawValuesCalcDataForSnapshot = [
        {
            vPointX: 500,
            vPointY: 500,
            vPointDepth: 1000,
            cameraCanvasPosX: 838,
            cameraCanvasPosY: 1381,
            zPos: 1000,
            pixelValues: {
                x: 787,
                y: 1680,
                width: 1099,
                height: 1361,
            }
        },
        {
            vPointX: 500,
            vPointY: 500,
            vPointDepth: 1000,
            cameraCanvasPosX: 838,
            cameraCanvasPosY: 1381,
            zPos: 1001,
            pixelValues: {
                x: 787,
                y: 1680,
                width: 1099,
                height: 1361,
            }
        },
        {
            vPointX: 500,
            vPointY: 500,
            vPointDepth: 1000,
            cameraCanvasPosX: 838,
            cameraCanvasPosY: 1381,
            zPos: 0,
            pixelValues: {
                x: 787,
                y: 1680,
                width: 1099,
                height: 1361,
            }
        },
        {
            vPointX: 1633,
            vPointY: 1645,
            vPointDepth: 1824,
            cameraCanvasPosX: 1521,
            cameraCanvasPosY: 1493,
            zPos: 1688,
            pixelValues: {
                x: 1815,
                y: 802,
                width: 1376,
                height: 691,
            }
        },
        {
            vPointX: 9,
            vPointY: 279,
            vPointDepth: 936,
            cameraCanvasPosX: 836,
            cameraCanvasPosY: 1575,
            zPos: -508,
            pixelValues: {
                x: 293,
                y: 1936,
                width: 362,
                height: 269,
            }
        },
        {
            vPointX: 1330,
            vPointY: 1561,
            vPointDepth: 1755,
            cameraCanvasPosX: 1579,
            cameraCanvasPosY: 753,
            zPos: 1534,
            pixelValues: {
                x: 1168,
                y: 1112,
                width: 891,
                height: 1159,
            }
        },
        {
            vPointX: 1027,
            vPointY: 587,
            vPointDepth: 680,
            cameraCanvasPosX: 762,
            cameraCanvasPosY: 753,
            zPos: 80,
            pixelValues: {
                x: 454,
                y: 845,
                width: 1620,
                height: 507,
            }
        },
        {
            vPointX: 543,
            vPointY: 1005,
            vPointDepth: 1716,
            cameraCanvasPosX: 435,
            cameraCanvasPosY: 1329,
            zPos: 1038,
            pixelValues: {
                x: 1145,
                y: 1559,
                width: 1047,
                height: 172,
            }
        },
        {
            vPointX: 1419,
            vPointY: 1385,
            vPointDepth: 766,
            cameraCanvasPosX: 1576,
            cameraCanvasPosY: 697,
            zPos: 87,
            pixelValues: {
                x: 385,
                y: 768,
                width: 917,
                height: 1856,
            }
        },
        {
            vPointX: 1022,
            vPointY: 107,
            vPointDepth: 475,
            cameraCanvasPosX: 1377,
            cameraCanvasPosY: 1904,
            zPos: 199,
            pixelValues: {
                x: 587,
                y: 1869,
                width: 537,
                height: 1458,
            }
        },
        {
            vPointX: 480,
            vPointY: 1447,
            vPointDepth: 597,
            cameraCanvasPosX: 1874,
            cameraCanvasPosY: 1734,
            zPos: 444,
            pixelValues: {
                x: 909,
                y: 32,
                width: 684,
                height: 136,
            }
        },
        {
            vPointX: 658,
            vPointY: 353,
            vPointDepth: 6,
            cameraCanvasPosX: 1110,
            cameraCanvasPosY: 1164,
            zPos: 2,
            pixelValues: {
                x: 235,
                y: 1739,
                width: 267,
                height: 172,
            }
        },
        {
            vPointX: 1309,
            vPointY: 1963,
            vPointDepth: 353,
            cameraCanvasPosX: 280,
            cameraCanvasPosY: 1385,
            zPos: -269,
            pixelValues: {
                x: 1713,
                y: 380,
                width: 603,
                height: 1799,
            }
        },
        {
            vPointX: 393,
            vPointY: 253,
            vPointDepth: 837,
            cameraCanvasPosX: 1457,
            cameraCanvasPosY: 1199,
            zPos: 680,
            pixelValues: {
                x: 668,
                y: 1055,
                width: 840,
                height: 362,
            }
        },
        {
            vPointX: 354,
            vPointY: 1057,
            vPointDepth: 72,
            cameraCanvasPosX: 176,
            cameraCanvasPosY: 1329,
            zPos: -22,
            pixelValues: {
                x: 584,
                y: 586,
                width: 350,
                height: 1016,
            }
        },
        {
            vPointX: 184,
            vPointY: 1102,
            vPointDepth: 1808,
            cameraCanvasPosX: 232,
            cameraCanvasPosY: 1464,
            zPos: 1767,
            pixelValues: {
                x: 442,
                y: 1673,
                width: 700,
                height: 24,
            }
        },
        {
            vPointX: 1587,
            vPointY: 1551,
            vPointDepth: 1105,
            cameraCanvasPosX: 541,
            cameraCanvasPosY: 1859,
            zPos: 118,
            pixelValues: {
                x: 1975,
                y: 1215,
                width: 805,
                height: 1816,
            }
        },
        {
            vPointX: 411,
            vPointY: 1478,
            vPointDepth: 134,
            cameraCanvasPosX: 573,
            cameraCanvasPosY: 624,
            zPos: 89,
            pixelValues: {
                x: 638,
                y: 837,
                width: 1482,
                height: 219,
            }
        },
        {
            vPointX: 706,
            vPointY: 662,
            vPointDepth: 1518,
            cameraCanvasPosX: 1569,
            cameraCanvasPosY: 411,
            zPos: 889,
            pixelValues: {
                x: 395,
                y: 657,
                width: 1945,
                height: 1252,
            }
        },
        {
            vPointX: 1447,
            vPointY: 590,
            vPointDepth: 881,
            cameraCanvasPosX: 1572,
            cameraCanvasPosY: 620,
            zPos: 522,
            pixelValues: {
                x: 529,
                y: 1029,
                width: 441,
                height: 813,
            }
        },
        {
            vPointX: 1567,
            vPointY: 1270,
            vPointDepth: 1982,
            cameraCanvasPosX: 302,
            cameraCanvasPosY: 1296,
            zPos: 1370,
            pixelValues: {
                x: 1805,
                y: 1553,
                width: 630,
                height: 1182,
            }
        },
        {
            vPointX: 396,
            vPointY: 224,
            vPointDepth: 797,
            cameraCanvasPosX: 1561,
            cameraCanvasPosY: 11,
            zPos: 359,
            pixelValues: {
                x: 1867,
                y: 392,
                width: 217,
                height: 715,
            }
        },
        {
            vPointX: 1070,
            vPointY: 1470,
            vPointDepth: 442,
            cameraCanvasPosX: 552,
            cameraCanvasPosY: 869,
            zPos: 84,
            pixelValues: {
                x: 1298,
                y: 125,
                width: 1835,
                height: 1985,
            }
        },
    ];

    it("should set properties to correct default values", () => {
        const strategy = new LinearVanishingPointStrategy();

        expect(strategy.vanishingPointX).toBe(0);
        expect(strategy.vanishingPointY).toBe(0);
        expect(strategy.vanishingPointDepth).toBe(0);
    });

    describe("setVanishPoint", () => {
        it("should set the vanishing point values", () => {
            const strategy = new LinearVanishingPointStrategy();

            const expectedX1 = 1;
            const expectedY1 = 2;
            const expectedDepth1 = 3;

            strategy.setVanishPoint(expectedX1, expectedY1, expectedDepth1);

            expect(strategy.vanishingPointX).toBe(expectedX1);
            expect(strategy.vanishingPointY).toBe(expectedY1);
            expect(strategy.vanishingPointDepth).toBe(expectedDepth1);

            const expectedX2 = 4;
            const expectedY2 = 5;
            const expectedDepth2 = 6;

            strategy.setVanishPoint(expectedX2, expectedY2, expectedDepth2);

            expect(strategy.vanishingPointX).toBe(expectedX2);
            expect(strategy.vanishingPointY).toBe(expectedY2);
            expect(strategy.vanishingPointDepth).toBe(expectedDepth2);
        });

        it("should set vanishing point depth to correct default if not provided when setting point X/Y", () => {
            const strategy = new LinearVanishingPointStrategy();
            
            strategy.setVanishPoint(1, 2);

            expect(strategy.vanishingPointDepth).toBe(1000);
        });

        it("should set vanishing point depth to correct default if not provided when changing point X/Y", () => {
            const strategy = new LinearVanishingPointStrategy();
            
            strategy.setVanishPoint(1, 2, 2000);
            expect(strategy.vanishingPointDepth).toBe(2000);

            strategy.setVanishPoint(3, 4);
            expect(strategy.vanishingPointDepth).toBe(1000);
        });
    });

    describe("getDrawValues", () => {
        it.each([
            [42, true],
            [442, false],
            [100, undefined]
        ])(
            "should call the getDrawPositionValues and getDrawDimensionValues methods with the given values, and return the results",
            (zPosition: number, showNegative: boolean|undefined) => {
                const strategy = new LinearVanishingPointStrategy();
                
                const expectedPositionValues = { x: 42, y: 43 };
                const expectedDimensionValues = { width: 142, height: 143 };

                strategy.getDrawPositionValues = jest.fn().mockReturnValue(expectedPositionValues);
                strategy.getDrawDimensionValues = jest.fn().mockReturnValue(expectedDimensionValues);

                const canvas = document.createElement("canvas");
                const camera = new Camera(canvas, 1, 2, 3, 4);
                const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

                const result = strategy.getDrawValues(camera, pixelValues, zPosition, showNegative);

                expect(strategy.getDrawPositionValues).toHaveBeenCalledTimes(1);
                expect(strategy.getDrawPositionValues).toHaveBeenCalledWith(camera, pixelValues, zPosition, showNegative);
                expect(strategy.getDrawDimensionValues).toHaveBeenCalledTimes(1);
                expect(strategy.getDrawDimensionValues).toHaveBeenCalledWith(camera, pixelValues, zPosition, showNegative);

                expect(result).toEqual({ ...expectedPositionValues, ...expectedDimensionValues });
            }
        );
    });

    describe("getDrawPositionValues", () => {
        it.each([
            [1001],
            [1002],
            [2003]
        ])("should return zeroes if the given Z position if greater than the vanishing point depth", (zPosition: number) => {
            const strategy = new LinearVanishingPointStrategy();
            strategy.setVanishPoint(500, 500, 1000);

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

            const result = strategy.getDrawPositionValues(camera, pixelValues, zPosition);

            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });

        it.each([
            [-1],
            [-2],
            [-22]
        ])("should return zeroes if the given Z position is less than zero, and showNegative is false", (zPosition: number) => {
            const strategy = new LinearVanishingPointStrategy();
            strategy.setVanishPoint(500, 500, 1000);

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

            const result = strategy.getDrawPositionValues(camera, pixelValues, zPosition, false);

            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });

        it.each([
            [-1],
            [-2],
            [-22]
        ])("should return zeroes if the given Z position is less than zero, and showNegative is undefined", (zPosition: number) => {
            const strategy = new LinearVanishingPointStrategy();
            strategy.setVanishPoint(500, 500, 1000);

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

            const result = strategy.getDrawPositionValues(camera, pixelValues, zPosition, undefined);

            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });

        it("should not return zeroes if the given Z position is less than zero, but showNegative is true", () => {
            const strategy = new LinearVanishingPointStrategy();
            strategy.setVanishPoint(500, 500, 1000);

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

            const result = strategy.getDrawPositionValues(camera, pixelValues, -1, true);

            expect(result.x).toBeGreaterThan(0);
            expect(result.y).toBeGreaterThan(0);
        });

        it("should calculate the correct position values, based on the given data", () => {
            const results:any[] = [];

            drawValuesCalcDataForSnapshot.forEach(data => {
                const strategy = new LinearVanishingPointStrategy();
                strategy.setVanishPoint(data.vPointX, data.vPointY, data.vPointDepth);

                const canvas = document.createElement("canvas");
                const camera = new Camera(canvas, 1, 2, 3, 4);
                Object.defineProperties(camera, {
                    canvasPositionX: {
                        value: data.cameraCanvasPosX
                    },
                    canvasPositionY: {
                        value: data.cameraCanvasPosY
                    }
                });

                const result = strategy.getDrawPositionValues(camera, data.pixelValues, data.zPos, true);

                results.push(result);
            });

            expect(results).toMatchSnapshot();
        });
    });

    describe("getDrawDimensionValues", () => {
        it.each([
            [1001],
            [1002],
            [2003]
        ])("should return zeroes if the given Z position if greater than the vanishing point depth", (zPosition: number) => {
            const strategy = new LinearVanishingPointStrategy();
            strategy.setVanishPoint(500, 500, 1000);

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

            const result = strategy.getDrawDimensionValues(camera, pixelValues, zPosition);

            expect(result.width).toBe(0);
            expect(result.height).toBe(0);
        });

        it.each([
            [-1],
            [-2],
            [-22]
        ])("should return zeroes if the given Z position is less than zero, and showNegative is false", (zPosition: number) => {
            const strategy = new LinearVanishingPointStrategy();
            strategy.setVanishPoint(500, 500, 1000);

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

            const result = strategy.getDrawDimensionValues(camera, pixelValues, zPosition, false);

            expect(result.width).toBe(0);
            expect(result.height).toBe(0);
        });

        it.each([
            [-1],
            [-2],
            [-22]
        ])("should return zeroes if the given Z position is less than zero, and showNegative is undefined", (zPosition: number) => {
            const strategy = new LinearVanishingPointStrategy();
            strategy.setVanishPoint(500, 500, 1000);

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

            const result = strategy.getDrawDimensionValues(camera, pixelValues, zPosition, undefined);

            expect(result.width).toBe(0);
            expect(result.height).toBe(0);
        });

        it("should not return zeroes if the given Z position is less than zero, but showNegative is true", () => {
            const strategy = new LinearVanishingPointStrategy();
            strategy.setVanishPoint(500, 500, 1000);

            const canvas = document.createElement("canvas");
            const camera = new Camera(canvas, 1, 2, 3, 4);
            const pixelValues = { x: 5, y: 10, width: 15, height: 20 };

            const result = strategy.getDrawDimensionValues(camera, pixelValues, -1, true);

            expect(result.width).toBeGreaterThan(0);
            expect(result.height).toBeGreaterThan(0);
        });

        it("should calculate the correct dimension values, based on the given data", () => {
            const results:any[] = [];

            drawValuesCalcDataForSnapshot.forEach(data => {
                const strategy = new LinearVanishingPointStrategy();
                strategy.setVanishPoint(data.vPointX, data.vPointY, data.vPointDepth);

                const canvas = document.createElement("canvas");
                const camera = new Camera(canvas, 1, 2, 3, 4);

                const result = strategy.getDrawDimensionValues(camera, data.pixelValues, data.zPos, true);

                results.push(result);
            });

            expect(results).toMatchSnapshot();
        });
    });
});