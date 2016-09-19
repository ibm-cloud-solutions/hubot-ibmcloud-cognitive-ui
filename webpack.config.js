/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

const webpack = require('webpack');

module.exports = {
	entry: './public/app_index',
	output: {
		path: __dirname + '/public/training',
		filename: 'bundle.js'
	},
	debug: true,
	devtool: '#eval-source-map',
	plugins: [
		new webpack.ProvidePlugin({
			riot: 'riot'
		})
	],
	module: {
		preLoaders: [
			{ test: /\.tag$/, exclude: /node_modules/, loader: 'riotjs-loader', query: { type: 'babel' } }
		],
		loaders: [
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				loaders: [
					'file?hash=sha512&digest=hex&name=[hash].[ext]',
					'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
				]
			},
			{ test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.js$|\.tag$/, exclude: /node_modules/, loader: 'babel-loader' },
			{ test: /\.json$/, loader: 'json-loader'}
		]
	},
	devServer: {
		contentBase: './public'
	}
};
