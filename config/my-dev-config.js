module.exports = {
    debugIE:false,//是否在开发环境进行ie8调试
    devPort:8900,//开发环境服务器端口
    //反向代理配置
    proxyConfig: {
        "/api/*": {
            target: "http://120.77.46.176:8080/Obcloud/",
            secure: false,
            changeOrigin: true,
        },
        "/Obcloud/*": {
            target: "http://120.77.46.176:8080/",
            secure: false,
            changeOrigin: false,
        },
    },
    chunkStats:false,//是否生成打包分析文件，供上传分析网站 http://webpack.github.io/analyse/可视化分析项目模块
    bundleAnalyzerPlugin:false//是否在9998端口输出模块分析可视化界面
};