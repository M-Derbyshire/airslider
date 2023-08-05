export interface IErrorHandler {
    /**
     * Handles errors
     * @param err the error to handle (doesn't have to be an instance of Error)
     */
    handleError(err:any):void
};