const path = require('path');

const rootPath = path.resolve(__dirname, '..');
const showcasePath = path.resolve(rootPath, 'showcase');

module.exports = {
    mode: 'development',
    context: showcasePath,
    entry: {
        'one': './src/index.ts'
    },
    output: {
        path: path.join(rootPath, 'showcase', 'dist'),
        filename: '[name].min.js'
    },
    resolve: {
        alias: {
            core: path.resolve(rootPath, 'core'),
            '2d': path.resolve(rootPath, '2d'),
        },
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    configFile: path.join(showcasePath, 'tsconfig.json')
                }
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(showcasePath, 'src')
        },
        port: 8080
    }
};
