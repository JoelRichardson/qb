const path = require('path');

module.exports = {
    entry: './resources/js/qb.js',
    output: {
        filename: 'qb.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'inline-source-map'
};
