const Dotenv = require('dotenv-webpack');

module.exports = env => ({
	entry: {
		entry: `./initialiseGame.${env.development ? "development" : "production"}.ts`
	},
	module: {
		rules: [
		  {
			test: /\.ts?$/,
			use: 'ts-loader',
			exclude: /node_modules/,
		  },
		],
	  },
	  resolve: {
		extensions: ['.ts', '.js'],
	  },
	output: {
		filename: './game.bundle.js',
	},
	plugins: [
		new Dotenv({ systemvars: true, path: `.env.${env.development ? "development" : "production"}` }),
	],
	devServer: {
		port: 3000,
		static: {
			directory: "."
		},
		historyApiFallback: {
			index: './dist/index.html'
		}
	}
});