/**
 * Provides methods that can be used to determine details about the web browser
 */
export default class BrowserHelper
{
    private static _isSafari?:boolean = undefined; // Is the current browser Safari?

    /**
     * Checks to see if the current web browser is Safari (or a browser that is required to use WebKit, as
     * may be the case for some browsers on IOS)
     * @returns true if the current web browser is Safari, false if not
     */
    static isSafari():boolean
    {
        // A lot of browser userAgent strings can seem misleading (Chromium-based browsers such
        // as Opera will contain the word "Chrome", for example). This regex should target the correct
        // browsers
        if(this._isSafari === undefined)
            this._isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        console.log(navigator.userAgent)
        console.log(this._isSafari)
        return this._isSafari;
    }
};