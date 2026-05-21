import fs from "fs";
import config from "./config.js";
import { checkDeployData } from "./util/dataChecking.js";
import { exitWithError } from "./util/errorHandling.js";

/**
 * This script is used to delete the directory that was previously deployed 
 * to (if it exists), regardless of its contents
 */

// Check that we have all the required data
const dataErr = checkDeployData(config);
if(dataErr) {
    exitWithError(dataErr.message, 1);
}

// Delete the directory
try {
    fs.rmSync(config.build.dir, { recursive: true, force: true });
} catch(err) {
    exitWithError(`Error while deleting the previous ${config.build.dir} directory: ${err.message}`, 2);
}