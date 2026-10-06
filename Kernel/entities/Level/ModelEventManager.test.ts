import Model from "../Model/Model";
import ModelAnimationsManager from "../Model/ModelAnimationsManager/ModelAnimationsManager";
import { IModelEventRegistrationDetails } from "./IModelEventManager";
import ModelEventManager from "./ModelEventManager";

describe("ModelEventManager", () => {
    class ModelA extends Model {};
    class ModelB extends Model {};
    class ModelC extends Model {};

    describe("registerEvent", () => {
        it("should register the event check and reaction methods", () => {
            const manager = new ModelEventManager();

            const models = [
                new ModelA(new ModelAnimationsManager()),
                new ModelB(new ModelAnimationsManager())
            ];
            models.forEach((model, idx) => {
                model.active = true;
                model.x = idx; // giving them a unique value means that jest can determine if they're not the expected model
            });

            const event:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            manager.registerEvent(event, models);

            // Now check the event was correctly configured
            manager.checkForEvents(models);

            expect(event.check).toHaveBeenCalledTimes(1);
            expect(event.check).toHaveBeenCalledWith(models[0], models[1], event.reactionCallback);
        });

        it("should split the models by class type, so that events are checked correctly between associated models", () => {
            const manager = new ModelEventManager();

            const aModels = [
                new ModelA(new ModelAnimationsManager()),
                new ModelA(new ModelAnimationsManager())
            ];

            const bModels = [
                new ModelB(new ModelAnimationsManager()),
                new ModelB(new ModelAnimationsManager()),
                new ModelB(new ModelAnimationsManager())
            ];

            const models = [
                aModels[0],
                bModels[0],
                aModels[1],
                bModels[1],
                bModels[2]
            ];
            models.forEach((model, idx) => {
                model.active = true;
                model.x = idx; // giving them a unique value means that jest can determine if they're not the expected model
            });

            const event:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            manager.registerEvent(event, models);

            // Now check the event was correctly configured
            manager.checkForEvents(models);

            expect(event.check).toHaveBeenCalledTimes(6);
            aModels.forEach(aModel => {
                bModels.forEach(bModel => {
                    expect(event.check).toHaveBeenCalledWith(aModel, bModel, event.reactionCallback);
                });
            });
        });
        
        it("should ignore any models that are not of an expected class type", () => {
            const manager = new ModelEventManager();

            const aModels = [
                new ModelA(new ModelAnimationsManager()),
                new ModelA(new ModelAnimationsManager())
            ];

            const bModels = [
                new ModelB(new ModelAnimationsManager()),
                new ModelB(new ModelAnimationsManager()),
                new ModelB(new ModelAnimationsManager())
            ];

            const models = [
                aModels[0],
                new ModelC(new ModelAnimationsManager()),
                bModels[0],
                aModels[1],
                bModels[1],
                new ModelC(new ModelAnimationsManager()),
                bModels[2]
            ];
            models.forEach((model, idx) => {
                model.active = true;
                model.x = idx; // giving them a unique value means that jest can determine if they're not the expected model
            });

            const event:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            manager.registerEvent(event, models);

            // Now check the event was correctly configured
            manager.checkForEvents(models);

            // We should still have only the expected checks
            expect(event.check).toHaveBeenCalledTimes(6);
            aModels.forEach(aModel => {
                bModels.forEach(bModel => {
                    expect(event.check).toHaveBeenCalledWith(aModel, bModel, event.reactionCallback);
                });
            });
        });
    });

    describe("registerEventsArray", () => {
        it("should call the registerEvent method for all of the given events", () => {
            const manager = new ModelEventManager();
            manager.registerEvent = jest.fn();

            const models = [
                new ModelA(new ModelAnimationsManager()),
                new ModelB(new ModelAnimationsManager())
            ];
            models.forEach((model, idx) => {
                model.active = true;
                model.x = idx; // giving them a unique value means that jest can determine if they're not the expected model
            });

            const event1:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            const event2:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            const event3:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            const events = [event1, event2, event3];

            manager.registerEventsArray(events, models);

            expect(manager.registerEvent).toHaveBeenCalledTimes(events.length);
            events.forEach(event => expect(manager.registerEvent).toHaveBeenCalledWith(event, models));
        });
    });

    describe("clearEvents", () => {
        it("should remove all event checks", () => {
            const manager = new ModelEventManager();

            const models = [
                new ModelA(new ModelAnimationsManager()),
                new ModelB(new ModelAnimationsManager())
            ];
            models.forEach((model, idx) => {
                model.active = true;
                model.x = idx; // giving them a unique value means that jest can determine if they're not the expected model
            });

            const event1:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            const event2:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            const event3:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            const events = [event1, event2, event3];

            manager.registerEventsArray(events, models);

            // Now we clear these events, and run the checkForEvents method, to
            // ensure nothing gets called
            manager.clearEvents();
            manager.checkForEvents(models);

            events.forEach(event => expect(event.check).not.toHaveBeenCalled());
        });
    });

    describe("checkForEvents", () => {
        it("should call the event checks, to check for events between every associated model", () => {
            const manager = new ModelEventManager();

            const aModels = [
                new ModelA(new ModelAnimationsManager()),
                new ModelA(new ModelAnimationsManager())
            ];

            const bModels = [
                new ModelB(new ModelAnimationsManager()),
                new ModelB(new ModelAnimationsManager()),
                new ModelB(new ModelAnimationsManager())
            ];

            const cModels = [
                new ModelC(new ModelAnimationsManager()),
                new ModelC(new ModelAnimationsManager()),
                new ModelC(new ModelAnimationsManager()),
            ];

            const models = [
                aModels[0],
                cModels[0],
                bModels[0],
                aModels[1],
                bModels[1],
                cModels[1],
                bModels[2],
                cModels[2]
            ];
            models.forEach((model, idx) => {
                model.active = true;
                model.x = idx; // giving them a unique value means that jest can determine if they're not the expected model
            });

            const event1:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            const event2:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelB,
                class2: ModelC,
                reactionCallback: jest.fn()
            };

            manager.registerEventsArray([event1, event2], models);

            manager.checkForEvents(models);
            
            // Every ModelA should have had a check against every ModelB, and
            // every ModelB should have had a check against every ModelC
            expect(event1.check).toHaveBeenCalledTimes(6);
            aModels.forEach(aModel => {
                bModels.forEach(bModel => {
                    expect(event1.check).toHaveBeenCalledWith(aModel, bModel, event1.reactionCallback);
                });
            });

            expect(event2.check).toHaveBeenCalledTimes(9);
            bModels.forEach(bModel => {
                cModels.forEach(cModel => {
                    expect(event2.check).toHaveBeenCalledWith(bModel, cModel, event2.reactionCallback);
                });
            });
        });

        it("should not check for an event if one or both models in the event are inactive", () => {
            const manager = new ModelEventManager();

            // Models that may be inactive
            const model1 = new ModelA(new ModelAnimationsManager());
            model1.active = false;
            const model2 = new ModelB(new ModelAnimationsManager());
            model2.active = false;

            // Models that are always active
            const model3 = new ModelA(new ModelAnimationsManager());
            model3.active = true;
            const model4 = new ModelB(new ModelAnimationsManager());
            model4.active = true;

            const models = [
                model1,
                model2,
                model3,
                model4
            ];
            models.forEach((model, idx) => {
                model.x = idx; // giving them a unique value means that jest can determine if they're not the expected model
            });
            
            const event:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelB,
                reactionCallback: jest.fn()
            };

            manager.registerEvent(event, models);

            manager.checkForEvents(models);

            expect(event.check).not.toHaveBeenCalledWith(model1, model2, event.reactionCallback);
            expect(event.check).not.toHaveBeenCalledWith(model1, model4, event.reactionCallback);
            expect(event.check).not.toHaveBeenCalledWith(model3, model2, event.reactionCallback);
        });

        it("should call the checkForExtraEvents method on all the given active models", () => {
            const manager = new ModelEventManager();

            const modelA = new ModelA(new ModelAnimationsManager());
            modelA.checkForExtraEvents = jest.fn();
            const modelB = new ModelB(new ModelAnimationsManager());
            modelB.checkForExtraEvents = jest.fn();
            const modelC = new ModelC(new ModelAnimationsManager());
            modelC.checkForExtraEvents = jest.fn();

            const models = [
                modelA,
                modelB, // This one wont be part of any registered events, but should still have its method called
                modelC
            ];
            models.forEach((model) => model.active = true);

            const event:IModelEventRegistrationDetails = {
                check: jest.fn(),
                class1: ModelA,
                class2: ModelC,
                reactionCallback: jest.fn()
            };

            manager.registerEvent(event, models);

            manager.checkForEvents(models);

            models.forEach(model => expect(model.checkForExtraEvents).toHaveBeenCalledTimes(1));
        });

        it("should not call the checkForExtraEvents method on models that are inactive", () => {
            const manager = new ModelEventManager();

            const model1 = new ModelA(new ModelAnimationsManager());
            model1.checkForExtraEvents = jest.fn();
            model1.active = true;
            const model2 = new ModelB(new ModelAnimationsManager());
            model2.checkForExtraEvents = jest.fn();
            model2.active = true;

            // These next 2 are not active
            const model3 = new ModelB(new ModelAnimationsManager());
            model3.checkForExtraEvents = jest.fn();
            const model4 = new ModelB(new ModelAnimationsManager());
            model4.checkForExtraEvents = jest.fn();

            const models = [model1, model2, model3, model4];

            manager.checkForEvents(models);

            expect(model1.checkForExtraEvents).toHaveBeenCalledTimes(1);
            expect(model2.checkForExtraEvents).toHaveBeenCalledTimes(1);

            expect(model3.checkForExtraEvents).not.toHaveBeenCalled();
            expect(model4.checkForExtraEvents).not.toHaveBeenCalled();
        });
    });
});