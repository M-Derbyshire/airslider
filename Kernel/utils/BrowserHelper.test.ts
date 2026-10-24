import BrowserHelper from "./BrowserHelper";

describe("BrowserHelper", () => {
    // The helper caches its result in a private static field,
    // so this can be used to reset that field.
    const resetHelper = () => {
        (BrowserHelper as any)._isSafari = undefined;
    };

    const setUserAgentString = (val:string) => {
        Object.defineProperty(navigator, "userAgent", {
            value: val,
            configurable: true
        });
    };

    beforeEach(() => {
        resetHelper();
    });

    describe("isSafari", () => {
        it.each([
            ["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"],
            ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"],
            ["Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0"],
            ["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 OPR/136.0.0.0"]
        ])("should return false if userAgent string isn't for Safari", (userAgent:string) => {
            setUserAgentString(userAgent);
            expect(BrowserHelper.isSafari()).toBe(false);
        });

        it.each([
            ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15"],
            ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1"],
            ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/156.0.8078.46 Mobile/15E148 Safari/604.1"],
        ])("should return true if userAgent string is for Safari, or a mobile browser that is required to use WebKit", (userAgent:string) => {
            setUserAgentString(userAgent);
            expect(BrowserHelper.isSafari()).toBe(true);
        });

        it("should cache the result, once determined", () => {
            const safariUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15";
            setUserAgentString(safariUserAgent);

            expect(BrowserHelper.isSafari()).toBe(true); // This should cache the result

            const nonSafariUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36";
            setUserAgentString(nonSafariUserAgent);

            expect(BrowserHelper.isSafari()).toBe(true); // Should be the original result
        });
    });
});