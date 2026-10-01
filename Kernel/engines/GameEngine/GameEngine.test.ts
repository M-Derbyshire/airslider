import ILevel from "../../entities/Level/ILevel";
import Level from "../../entities/Level/Level";
import IModel from "../../entities/Model/IModel";
import GameEngine from "./GameEngine";

describe("GameEngine", () => {
    describe("run", () => {
        const getMockLevel = (onAct: ()=>void, onCheckForModelEvents: (models: IModel[])=>void):ILevel => {
            class MockLevel {
                act(): void {
                    onAct();
                }

                checkForModelEvents(models: IModel[]): void {
                    onCheckForModelEvents(models);
                }
            }

            return (new MockLevel()) as ILevel;
        };

        const getMockModel = (isActive: boolean, onAct: ()=>void):IModel => {
            class MockModel {
                active:boolean = isActive;

                act(): void {
                    onAct();
                }
            }

            return (new MockModel()) as IModel;
        };

        it("should run the act method on the level", () => {
            const levelActHandler = jest.fn();
            const level = getMockLevel(levelActHandler, jest.fn());

            const engine = new GameEngine(level, []);

            expect(levelActHandler).not.toHaveBeenCalled();

            engine.run();

            expect(levelActHandler).toHaveBeenCalledTimes(1);
        });

        it("should run the act method on models", () => {
            const level = getMockLevel(jest.fn(), jest.fn());

            const modelActHandlers = [jest.fn(), jest.fn(), jest.fn()];
            const models = modelActHandlers.map(handler => getMockModel(true, handler));

            const engine = new GameEngine(level, models);

            modelActHandlers.forEach(h => expect(h).not.toHaveBeenCalled());

            engine.run();

            modelActHandlers.forEach(h => expect(h).toHaveBeenCalledTimes(1));
        });

        it("should only run the act method on models that are active", () => {
            const level = getMockLevel(jest.fn(), jest.fn());

            const modelSettings = [
                {
                    actHandler: jest.fn(),
                    isActive: true,
                },
                {
                    actHandler: jest.fn(),
                    isActive: false,
                },
                {
                    actHandler: jest.fn(),
                    isActive: true,
                },
                {
                    actHandler: jest.fn(),
                    isActive: false,
                },
            ];

            const models = modelSettings.map(ms => getMockModel(ms.isActive, ms.actHandler));

            const engine = new GameEngine(level, models);

            modelSettings.forEach(ms => expect(ms.actHandler).not.toHaveBeenCalled());

            engine.run();

            modelSettings.forEach(ms => {
                if(ms.isActive)
                    expect(ms.actHandler).toHaveBeenCalledTimes(1);
                else
                    expect(ms.actHandler).not.toHaveBeenCalled();
            });
        });

        it("should run the checkForModelEvents method on the level", () => {
            const levelEventCheckHandler = jest.fn();
            const level = getMockLevel(jest.fn(), levelEventCheckHandler);

            const models = [
                getMockModel(true, jest.fn()),
                getMockModel(false, jest.fn())
            ];

            const engine = new GameEngine(level, models);

            expect(levelEventCheckHandler).not.toHaveBeenCalled();

            engine.run();

            expect(levelEventCheckHandler).toHaveBeenCalledTimes(1);
            expect(levelEventCheckHandler).toHaveBeenCalledWith(models);
        });

        it("should run the level and model methods in the right order", () => {
            // We're going to mock all the method calls so they push an
            // incrementing number into an array. We'll then check that
            // the numbers in the array are sequential, and in the right
            // order
            const capturedNumbers:number[] = [];

            const level = getMockLevel(
                jest.fn().mockImplementation(() => capturedNumbers.push(0)), // should run first
                jest.fn().mockImplementation(() => capturedNumbers.push(4)) // should run last
            );

            // The model methods should be called in the same order as they appear in the array.
            const modelActHandlers = [
                jest.fn().mockImplementation(() => capturedNumbers.push(1)),
                jest.fn().mockImplementation(() => capturedNumbers.push(2)),
                jest.fn().mockImplementation(() => capturedNumbers.push(3))
            ];
            const models = modelActHandlers.map(handler => getMockModel(true, handler));

            const engine = new GameEngine(level, models);

            engine.run();

            expect(capturedNumbers.length).toBe(5);
            capturedNumbers.forEach((value, idx) => expect(value).toBe(idx));
        });
    });
});