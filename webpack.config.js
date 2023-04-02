var webpack = require('webpack');

module.exports = {
	mode: 'development',
	entry: {
		entry: __dirname + '/initialiseGame.development.js'
	},
	output: {
		filename: './game.bundle.js',
	}
}