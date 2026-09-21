import fs from "fs";
import config from "./config.js";
import { checkDeployData } from "./util/dataChecking.js";
import { exitWithError } from "./util/errorHandling.js";
import getFileList from "./util/getFileList.js";
import { pathToUniqueFilename } from "../Kernel/AssetHandler/deployedFilename.js";

/**
 * This script is used to deploy the assets for the project.
 * 
 * It will create the deploy directory, and then copy the project's assets to an 
 * "assets" directory within that directory (giving each file a unique filename, 
 * so there is no need for sub-directories)
 */

// Check that we have all the required data
const dataErr = checkDeployData(config);
if(dataErr)
    exitWithError(dataErr.message, 1);

// First, we create the deploy directory, as well as a directory for the deployed assets
try {
    fs.mkdirSync(config.build.dir);
    fs.mkdirSync(`${config.build.dir}/${config.build.assets}`);
} catch(err) {
    exitWithError(`Error while creating the new deployment directories: ${err.message}`, 2);
}

// Next, we generate an array of all the asset files from the assets directories
const filesToCopy = []; // This will contain objects that each have 2 properties: "sourcePath" and "filename"

config.assets.dirs.forEach((assetDir) => {
    try {
        const fullPaths = getFileList(assetDir, config.assets.excludedExtensions);
        const files = fullPaths.map(fp => (
            {
                sourcePath: fp,
                filename: pathToUniqueFilename(fp.replace(`${assetDir}/`, ""))
            }
        ));

        filesToCopy.push(...files);
    } catch(err) {
        exitWithError(`Error while generating the list of asset files to be copied: ${err.message}`, 3);
    }
});

// Next, we copy the asset files to the output directory
try {
    const assetsOutputDir = `${config.build.dir}/${config.build.assets}`; // The directory to output the assets to
    
    filesToCopy.forEach(fileDetails => {
        const destination = `${assetsOutputDir}/${fileDetails.filename}`;
        
        fs.copyFileSync(fileDetails.sourcePath, destination);
    });
} catch(err) {
    exitWithError(`Error while copying asset files: ${err.message}`, 4);
}