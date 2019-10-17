/**
 * @file
 */
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const os = require('os');
let hostname = os.hostname();
let examplePro = process.argv[process.argv.length-1];

hostname = (function () {
    const interfaces = require('os').networkInterfaces();
    let address = '127.0.0.1';
    for (let devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                address = alias.address;
                return address;
            }
        }
    }
    return address;
})();

module.exports = {
   entry: path.resolve(__dirname, `../examples/${examplePro}/index.js`),
   output: {
       path: path.resolve(__dirname, '../dist'),
       filename: 'test.js',
   },
   mode: 'none',
   resolve: {
       extensions: ['.js', '.vue']
   },
   externals: {
       'vue': 'Vue'
   },
   module: {
       rules: [
           {
               test: /\.vue$/,
               use: ['vue-loader']
           },{
               test: /\.html$/,
               use: 'html-loader'
           },{
               test: /\.js$/,
               use: 'babel-loader'
           },{
            test: /\.css$/,
            use: [
                {
                    loader: 'style-loader'
                },{
                    loader: 'css-loader'
                }
            ]
           }
       ]
   },
   plugins: [
       new VueLoaderPlugin(),
       new HtmlWebpackPlugin({
           filename: 'index.html',
           template: path.resolve(__dirname, `../examples/${examplePro}/index.html`)
       })
   ],
   devServer: {
       contentBase: path.join(__dirname, '../dist'), // 静态文件地址
       port: 8085, // 端口号
       host: hostname, // 主机
       overlay: true, // 如果出错，则在浏览器中显示出错误
       compress: true, // 服务器返回浏览器的时候是否启动gzip压缩
       openPage: 'index.html', // 打开路径
       hot: true, // 模块热替换 需要webpack.HotModuleReplacementPlugin插件
       inline: true, // 实时构建
       progress: true, // 显示打包进度
       disableHostCheck: true
   }
}