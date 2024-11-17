// This file is plain Javascript, instead of Typescript, so it can be used by any deployment-related scripts

/**
 * Each object in this array has a "directory" (the name/path of a directory within the assets directory), and 
 * an "abbreviation" of that directory
 */
const assetsDirsAbbreviations = [
    { directory: "fonts", abbreviation: "f" },
    { directory: "hudcomponents", abbreviation: "hc" },
    { directory: "huds", abbreviation: "h" },
    { directory: "levels", abbreviation: "l" },
    { directory: "models", abbreviation: "m" }
];

/**
 * Converts a file path (relative to the root of the project) into a unique filename (unique enough for our 
 * purposes)
 * @param {string} path The path of the file (relative to the root of the project)
 * @returns {string} A unique filename for the file
 */
export const pathToUniqueFilename = (path) => {
    path = path.toLowerCase();
    
    if(path.startsWith("/"))
        path = path.substring(1); // Remove leading slash from path
    
    assetsDirsAbbreviations.forEach(a => {
        if(path.startsWith(a.directory))
            path = path.replace(a.directory, a.abbreviation);
    });
    
    path = path.replaceAll("/", ".");
    
    return path;
};