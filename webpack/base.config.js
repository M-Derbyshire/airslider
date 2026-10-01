export default {
	module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/,
                    /\.test\.ts$/,
                    /\.test\.js$/,
                ]
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
			index: './scripts/assets/index.html'
		}
	}
};