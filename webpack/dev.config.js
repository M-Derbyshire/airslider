const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');

module.exports = merge(baseConfig, {
    entry: {
		entry: `./init.dev.ts`
	},
    output: {
		filename: './game.bundle.js',
	}
});