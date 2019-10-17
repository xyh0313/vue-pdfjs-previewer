const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
   entry: path.resolve(__dirname, '../src/index.js'),
   output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'bundle.js',
        libraryTarget: 'umd',
        library: 'v-previewer'
   },
   mode: 'none',
   resolve: {
       extensions: ['.js', '.vue']
   },
   module: {
       rules: [
           {
               test: /\.vue$/,
               use: ['vue-loader'],
               exclude: '/node_module/'
           },{
               test: /\.js$/,
               use: 'babel-loader',
               exclude: '/node_module/'
           },{
               test: /\.css$/,
               use: [
                   {
                       loader: 'style-loader'
                   },{
                       loader: 'css-loader'
                   }
               ],
               exclude: '/node_module/'
           },{
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                exclude: '/node_module/'
           }
       ]
   },
   plugins: [
        new VueLoaderPlugin()
   ]
}