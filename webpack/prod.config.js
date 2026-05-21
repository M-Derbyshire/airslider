import { merge } from "webpack-merge";
import baseConfig from "./base.config.js";
import path from "path";

const currentWorkingDir = path.resolve();

export default merge(baseConfig, {
    entry: {
		entry: `./init.prod.ts`
	},
    output: {
		filename: 'game.bundle.js',
		path: path.resolve(currentWorkingDir, 'build')
	}
});