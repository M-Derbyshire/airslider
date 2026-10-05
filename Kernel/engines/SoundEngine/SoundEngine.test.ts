import { waitFor } from "@testing-library/dom";
import BrowserHelper from "../../utils/BrowserHelper";
import { SoundStatus } from "./ISoundEngine";
import SoundEngine from "./SoundEngine";

describe("SoundEngine", () => {
    const createSound = (key:string):HTMLAudioElement => {
        const sound = new Audio(key);
        sound.pause = jest.fn();
        sound.play = jest.fn().mockResolvedValue("");

        return sound;
    };

    const testSoundWasReset = (sound:HTMLAudioElement) => {
        expect(sound.pause).toHaveBeenCalledTimes(1);
        expect(sound.muted).toBeFalsy();
        expect(sound.currentTime).toBe(0);
        expect(sound.loop).toBeFalsy();
    };

    describe("addSound", () => {
        it("should add the sound to the sound engine's internal store", () => {
            const key = "./sound.mp3";
            const sound = createSound(key);
            
            const volume = 42;
            Object.defineProperty(sound, "volume", {
                value: volume
            });

            const engine = new SoundEngine(jest.fn());

            engine.addSound(key, sound);

            expect(engine.getSoundVolume(key)).toBe(sound.volume);
        });

        it("should reset the sound when it is added", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            sound.pause = jest.fn();
            sound.muted = true;
            sound.currentTime = 10;
            sound.loop = true;

            const engine = new SoundEngine(jest.fn());

            engine.addSound(key, sound);

            testSoundWasReset(sound);

            expect(engine.getSoundStatus(key)).toBe(SoundStatus.Stopped);
        });

        it("should add ended event listener to sound to reset it", () => {
            const key = "test.mp3";
            const sound = createSound(key);
            sound.pause = jest.fn();
            
            const engine = new SoundEngine(jest.fn());

            engine.addSound(key, sound);
            expect(sound.pause).toHaveBeenCalledTimes(1);

            sound.muted = true;
            sound.currentTime = 10;
            sound.loop = true;

            sound.pause = jest.fn();

            // trigger the event listener, then ensure it's been reset
            sound.dispatchEvent(new Event("ended"));
            
            testSoundWasReset(sound);
            expect(engine.getSoundStatus(key)).toBe(SoundStatus.Stopped);
        });
    });

    describe("getSoundStatus", () => {
        it("should return the correct status for a sound", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());

            engine.addSound(key, sound);

            // Initial status should be stopped
            expect(engine.getSoundStatus(key)).toBe(SoundStatus.Stopped);

            // Now switch to playing
            engine.playSound(key);
            expect(engine.getSoundStatus(key)).toBe(SoundStatus.Playing);

            // Now pause
            engine.pauseSound(key);
            expect(engine.getSoundStatus(key)).toBe(SoundStatus.Paused);

            // Now force-loading
            engine.forceSoundToLoad(key);
            expect(engine.getSoundStatus(key)).toBe(SoundStatus.ForceLoading);
        });

        it("should return null if sound doesn't exist", () => {
            const engine = new SoundEngine(jest.fn());

            const result = engine.getSoundStatus("test");

            expect(result).toBeNull();
        });
    });

    describe("getSoundVolume", () => {
        it("should return the volume for a sound", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const volume = 42;
            Object.defineProperty(sound, "volume", {
                value: volume
            });

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            const result = engine.getSoundVolume(key);

            expect(result).toBe(volume);
        });

        it("should return null if sound doesn't exist", () => {
            const engine = new SoundEngine(jest.fn());

            const result = engine.getSoundVolume("test");

            expect(result).toBeNull();
        });
    });

    describe("setSoundVolume", () => {
        it("should set the volume on the given sound", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const initialVolume = 12;
            Object.defineProperty(sound, "volume", {
                value: initialVolume,
                writable: true,
            });

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            const newVolume = 42;
            engine.setSoundVolume(key, newVolume);

            expect(sound.volume).toBe(newVolume);
        });

        it("should not throw if sound doesn't exist", () => {
            const engine = new SoundEngine(jest.fn());

            expect(() => engine.setSoundVolume("test", 2)).not.toThrow();
        });
    });

    describe("playSound", () => {
        const mockBrowserHelper = (isBrowserSafari:boolean) => {
            jest.spyOn(BrowserHelper, "isSafari").mockReturnValue(isBrowserSafari);
        };

        beforeEach(() => {
            mockBrowserHelper(false);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should not throw if sound doesn't exist", () => {
            const engine = new SoundEngine(jest.fn());

            expect(() => engine.playSound("test")).not.toThrow();
        });

        it("should play the given sound, and set its status to playing", () => {
            const key = "test.mp3";
            const sound = createSound(key);
            sound.play = jest.fn().mockResolvedValue("");

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            engine.playSound(key);

            expect(sound.play).toHaveBeenCalledTimes(1);
            expect(engine.getSoundStatus(key)).toBe(SoundStatus.Playing);
        });

        it("should reset the given sound before playing, if it was not stopped", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            engine.playSound(key); // Ensure the sound is not stopped

            // We're going to capture the order that the methods were called in
            const capturedCalls:number[] = [];
            sound.pause = jest.fn().mockImplementation(() => capturedCalls.push(0));
            sound.play = jest.fn().mockImplementation(() => {
                capturedCalls.push(1);
                return Promise.resolve();
            });

            sound.muted = true;
            sound.currentTime = 10;
            sound.loop = true;

            engine.playSound(key);
            
            testSoundWasReset(sound);
            expect(sound.play).toHaveBeenCalledTimes(1);

            // The numbers is this array will be in order if the
            // methods were called in order
            expect(capturedCalls.length).toBe(2);
            capturedCalls.forEach((val, idx) => expect(val).toBe(idx));
        });

        it("should not reset the sound before playing if the sound was stopped", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            sound.pause = jest.fn();
            sound.play = jest.fn().mockResolvedValue("");

            sound.muted = true;
            sound.currentTime = 10;

            engine.playSound(key);
            expect(sound.play).toHaveBeenCalledTimes(1);

            expect(sound.pause).not.toHaveBeenCalled();
            expect(sound.muted).toBe(true);
            expect(sound.currentTime).toBe(10);
        });

        it.each([
            [true],
            [false]
        ])("should set the loop value to the given value if the sound is playing", (newLoopValue:boolean) => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            // Set the sound to be playing, but then reset the loop property
            // so we know exactly what it is
            engine.playSound(key);
            sound.loop = !newLoopValue;

            engine.playSound(key, newLoopValue);
            expect(sound.loop).toBe(newLoopValue);
        });

        it.each([
            [true],
            [false]
        ])("should set the loop value to the given value if the sound is stopped", (newLoopValue:boolean) => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound); // sound will be stopped when added

            sound.loop = !newLoopValue;
            engine.playSound(key, newLoopValue);

            expect(sound.loop).toBe(newLoopValue);
        });

        it.each([
            [true],
            [false]
        ])("should set the loop value to the given value if the sound is force-loading", (newLoopValue:boolean) => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            // Set the sound to be force-loading, but then reset the loop property
            // so we know exactly what it is
            engine.forceSoundToLoad(key);
            sound.loop = !newLoopValue;

            engine.playSound(key, newLoopValue);
            expect(sound.loop).toBe(newLoopValue);
        });

        it.each([
            [true],
            [false]
        ])("should not set the loop value to the given value if the sound is paused", (newLoopValue:boolean) => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            // Set the sound to be paused, but then reset the loop property
            // so we know exactly what it is
            engine.pauseSound(key);
            sound.loop = !newLoopValue;

            engine.playSound(key, newLoopValue);
            expect(sound.loop).toBe(!newLoopValue);
        });

        it("should be a no-op if the sound is already playing, and the browser is Safari", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            const expectedLoop = true;
            engine.playSound(key, expectedLoop);

            mockBrowserHelper(true); // set the browser to be Safari
            sound.play = jest.fn().mockResolvedValue("");
            sound.pause = jest.fn();

            // Now trigger the sound again
            engine.playSound(key, !expectedLoop);

            expect(sound.play).not.toHaveBeenCalled();
            expect(sound.pause).not.toHaveBeenCalled();
            expect(sound.loop).toBe(expectedLoop);
        });

        it("should play the sound if it's already playing, and the browser is not Safari", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            const expectedLoop = true;
            engine.playSound(key, !expectedLoop);

            sound.play = jest.fn().mockResolvedValue("");

            // Now trigger the sound again
            engine.playSound(key, expectedLoop);

            expect(sound.play).toHaveBeenCalledTimes(1);
            expect(sound.loop).toBe(expectedLoop);
        });

        it.each([
            [SoundStatus.ForceLoading],
            [SoundStatus.Paused],
            [SoundStatus.Stopped]
        ])("should play the sound if it's not playing, and the browser is Safari", (status:SoundStatus) => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);
            
            // sound will be set to stopped when added
            if(status === SoundStatus.Paused)
                engine.pauseSound(key);
            else if(status === SoundStatus.ForceLoading)
                engine.forceSoundToLoad(key);

            sound.play = jest.fn().mockResolvedValue("");
            mockBrowserHelper(true); // Mock as being Safari

            engine.playSound(key);

            expect(sound.play).toHaveBeenCalledTimes(1);
        });

        it("should call the given error handler if there is a playback error", async () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const testError = new Error("test error 123");
            sound.play = jest.fn().mockRejectedValue(testError);

            const errorHandler = jest.fn();
            const engine = new SoundEngine(errorHandler);
            engine.addSound(key, sound);

            engine.playSound(key);

            expect(sound.play).toHaveBeenCalledTimes(1);

            await waitFor(() => {
                expect(errorHandler).toHaveBeenCalledTimes(1);
                expect(errorHandler).toHaveBeenCalledWith(testError);
            });
        });

        it("should not call the given error handler if the playback error is an AbortError", async () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const testError = new Error("test error 123");
            testError.name = "AbortError";
            sound.play = jest.fn().mockRejectedValue(testError);

            const errorHandler = jest.fn();
            const engine = new SoundEngine(errorHandler);
            engine.addSound(key, sound);

            engine.playSound(key);

            expect(sound.play).toHaveBeenCalledTimes(1);

            await Promise.resolve();
            expect(errorHandler).not.toHaveBeenCalled();
        });
    });

    describe("pauseSound", () => {
        it("will pause the sound and set its status to paused", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);
            engine.playSound(key);

            sound.pause = jest.fn();
            engine.pauseSound(key);

            expect(sound.pause).toHaveBeenCalledTimes(1);
            expect(engine.getSoundStatus(key)).toBe(SoundStatus.Paused);
        });

        it("will not reset the sound", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);
            engine.playSound(key);

            sound.currentTime = 10;
            engine.pauseSound(key);

            expect(sound.currentTime).toBe(10);
        });

        it("should not throw if the sound doesn't exist", () => {
            const engine = new SoundEngine(jest.fn());

            expect(() => engine.pauseSound("test")).not.toThrow();
        });
    });

    describe("stopSound", () => {
        it("should reset the sound", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);
            engine.playSound(key);

            sound.pause = jest.fn();
            sound.muted = true;
            sound.currentTime = 10;
            sound.loop = true;

            engine.stopSound(key);

            testSoundWasReset(sound);
            expect(engine.getSoundStatus(key)).toBe(SoundStatus.Stopped);
        });

        it("should not throw if the sound doesn't exist", () => {
            const engine = new SoundEngine(jest.fn());

            expect(() => engine.stopSound("test")).not.toThrow();
        });
    });

    describe("reset", () => {
        it("should reset every sound", () => {
            const getKey = (n:number) => `key${n}`;

            const sound1 = createSound(getKey(0));
            const sound2 = createSound(getKey(1));
            const sound3 = createSound(getKey(2));
            const sounds = [sound1, sound2, sound3];

            const engine = new SoundEngine(jest.fn());

            sounds.forEach((sound, idx) => {
                engine.addSound(getKey(idx), sound);

                sound.pause = jest.fn();
                sound.muted = true;
                sound.currentTime = 10;
                sound.loop = true;
            });

            engine.reset();
            
            sounds.forEach((sound, idx) => {
                testSoundWasReset(sound);
                expect(engine.getSoundStatus(getKey(idx))).toBe(SoundStatus.Stopped);
            });
        });
    });

    describe("forceSoundToLoad", () => {
        it("should play the sound muted, with the expected settings", () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const engine = new SoundEngine(jest.fn());
            engine.addSound(key, sound);

            sound.currentTime = 10;
            sound.muted = false;
            sound.loop = true;

            engine.forceSoundToLoad(key);

            expect(sound.currentTime).toBe(0);
            expect(sound.muted).toBe(true);
            expect(sound.loop).toBe(false);
            expect(sound.play).toHaveBeenCalledTimes(1);

            expect(engine.getSoundStatus(key)).toBe(SoundStatus.ForceLoading);
        });

        it("should not throw if the sound doesn't exist", () => {
            const engine = new SoundEngine(jest.fn());

            expect(() => engine.forceSoundToLoad("test")).not.toThrow();
        });

        it("should not call the error handler if error occurred while playing the sound", async () => {
            const key = "test.mp3";
            const sound = createSound(key);

            const errorHandler = jest.fn();
            const engine = new SoundEngine(errorHandler);
            engine.addSound(key, sound);

            sound.play = jest.fn().mockRejectedValue(new Error("test error 123"));

            engine.forceSoundToLoad(key);

            await Promise.resolve();
            expect(errorHandler).not.toHaveBeenCalled();
        });
    });

    describe("getSoundKeys", () => {
        it("should return the keys of all the added sounds", () => {
            const sound = createSound("key");
            const keys = ["key1", "key2", "key3"];

            const engine = new SoundEngine(jest.fn());

            keys.forEach(key => engine.addSound(key, sound));

            const results = engine.getSoundKeys();

            expect(results.length).toBe(keys.length);
            keys.forEach((key, idx) => expect(results[idx]).toBe(key));
        });
    });

    describe("getPlayingSoundKeys", () => {
        it("should return the keys, but only for sounds that are playing", () => {
            const sound = createSound("key");
            const keys = ["key1", "key2", "key3", "key4"];

            const engine = new SoundEngine(jest.fn());

            keys.forEach((key, idx) => {
                engine.addSound(key, sound);

                // We'll play every other sound
                if(idx % 2 === 0)
                    engine.playSound(key);
            });

            const results = engine.getPlayingSoundKeys();

            expect(results.length).toBe(keys.length / 2);
            keys.forEach((key, idx) => {
                if(idx % 2 === 0) {
                    expect(results).toContain(key);
                }
            });
        });

        it("should return the keys of all the added sounds, if they are all playing", () => {
            const sound = createSound("key");
            const keys = ["key1", "key2", "key3"];

            const engine = new SoundEngine(jest.fn());

            keys.forEach(key => {
                engine.addSound(key, sound);
                engine.playSound(key);
            });

            const results = engine.getPlayingSoundKeys();

            expect(results.length).toBe(keys.length);
            keys.forEach((key, idx) => expect(results[idx]).toBe(key));
        });

        it("should return no keys if no sounds are playing", () => {
            const sound = createSound("key");
            const keys = ["key1", "key2", "key3"];

            const engine = new SoundEngine(jest.fn());

            keys.forEach(key => engine.addSound(key, sound));

            const results = engine.getPlayingSoundKeys();

            expect(results.length).toBe(0);
        });
    });
});