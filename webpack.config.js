var webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = env => ({
	entry: {
		entry: __dirname + `/initialiseGame.${env.development ? "development" : "production"}.js`
	},
	output: {
		filename: './game.bundle.js',
	},
	plugins: [
		new Dotenv({ systemvars: true, path: `.env.${env.development ? "development" : "production"}` }),
	]
});