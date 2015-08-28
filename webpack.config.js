var webpack = require('webpack');
var BundleTracker  = require('webpack-bundle-tracker');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    context: __dirname + '/lazyhub/static/',
    entry: './js/app.js',
    output: {
        
        path: __dirname + "/lazyhub/static/dist",
        filename: '[name]-[hash].js'
    },
    plugins: [
        new BundleTracker({filename: './webpack-stats.json'}),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new ExtractTextPlugin("[name]-[hash].css")
    ],
    module: {
        loaders: [
            {test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
            {test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")},
            {test: /\.scss$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")},
            {test: /\.(woff|woff2)$/, loader: 'url-loader?limit=10000&minetype=application/font-woff'},
            {test: /\.(ttf|eot|svg)$/, loader: 'file-loader'}
        ]
    }
};
