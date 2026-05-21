import fs from "fs";

/**
 * Scans the given root directory (and sub-directories) for files, and generates a list of file paths
 * @param {string} rootDir The directory to scan for files (relative to the current working directory)
 * @param {Array.<string>} excludedExtensions File extensions that should not be included in the list
 * @returns An array of file paths (relative to the current working directory)
 */
const getFileList = (rootDir, excludedExtensions) => {
    if(rootDir.endsWith("/"))
        rootDir = rootDir.slice(0, -1); // Remove trailing slash
    
    const results = [];
    
    // Iterate over all the files/directories in the given root directory
    fs.readdirSync(rootDir, { withFileTypes: true }).forEach((entry) => {
        if(entry.isDirectory()) {
            // Get a list of files in the sub-directory, and add them to the results
            const subFileList = getFileList(`${rootDir}/${entry.name}`, excludedExtensions);
            results.push(...subFileList);
        } else {
            // Add the files in the directory to the result
            if(fileHasAllowedExtension(entry.name, excludedExtensions))
                results.push(`${rootDir}/${entry.name}`);
        }
    });
    
    return results;
};

export default getFileList;

/**
 * Checks that the given filename has an allowed file extension
 * @param {string} name The filename (including the extension) of the file
 * @param {Array.<string>} excludedExtensions File extensions that are not valid
 * @returns True if the file has an allowed extension, otherwise false
 */
const fileHasAllowedExtension = (name, excludedExtensions) => {
    for(let i = 0; i < excludedExtensions.length; i++)
        if(name.endsWith(excludedExtensions[i]))
            return false;
    
    return true;
};