/**
 * Manages error-handling for the game
 */
export interface IErrorHandler {
    /**
     * Handles the given error
     * @param err the error to handle (this doesn't have to be an instance of Error)
     */
    handleError(err:any):void
};