/**
 * Confirms that the data required for a deploy is correct
 * @param config The config data for the deployment
 * @returns An error if the data is not correct, or nothing if it's valid
 */
export const checkDeployData = (config) => {
    const configInvalidSolution = "see scripts/config.js";
    const dataToCheck = [
        {
            data: config?.assets?.dirs,
            name: "config.assets.dirs",
            type: "array",
            solution: configInvalidSolution
        },
        {
            data: config?.assets?.excludedExtensions,
            name: "config.assets.excludedExtensions",
            type: "array",
            solution: configInvalidSolution
        },
        {
            data: config?.build?.dir,
            name: "config.build.dir",
            type: "string",
            solution: configInvalidSolution
        },
        {
            data: config?.build?.assets,
            name: "config.build.assets",
            type: "string",
            solution: configInvalidSolution
        }
    ];

    for(let i = 0; i < dataToCheck.length; i++) {
        const d = dataToCheck[i];

        const isExpectedValidArray = (d.type === "array" && Array.isArray(d.data));
        const isExpectedTypeString = (typeof d.data === d.type);
        
        if(!isExpectedValidArray && !isExpectedTypeString)
            return getDataError(d.name, d.type, d.solution);
    }
};

/**
 * Creates an error that can be used when data is invalid
 * @param {string} dataName An identifier for the data (such as a variable name)
 * @param {string} type The correct type for the data
 * @param {string} solution A description of how to fix the problem
 * @returns A new Error
 */
export const getDataError = (dataName, type, solution) => {
    return new Error(`${dataName} has not been set to a ${type} value. To correct this, ${solution}`);
};