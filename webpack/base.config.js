module.exports = {
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
	devServer: {
		port: 3000,
		static: {
			directory: "."
		},
		historyApiFallback: {
			index: './dist/index.html'
		}
	}
};