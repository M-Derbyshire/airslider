/**
 * Logs an error to the console, then ends the process
 * @param {string} message The error message
 * @param {number} exitCode The exit code to end the process with
 */
export const exitWithError = (message, exitCode) => {
    console.error(new Error(message));
    process.exit(exitCode);
};