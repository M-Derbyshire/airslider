import { merge } from "webpack-merge";
import baseConfig from "./base.config.js";

export default merge(baseConfig, {
    entry: {
		entry: `./init.dev.ts`
	},
    output: {
		filename: 'game.bundle.js'
	}
});