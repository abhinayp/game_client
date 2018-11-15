const path = require('path');

module.exports = {
    context: __dirname + '/public/javascript',
    entry: './index.js',
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, 'public/javascript'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    stats: {
        colors: true,
        reasons: true,
        chunks: false
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader'
            },
            {
                test: /\.js?$/,
                loader: 'babel-loader'
            }
        ]
    }
};
