const webpack = require('webpack');

module.exports = function override(config) {
    // ตั้งค่า fallback สำหรับ polyfills
    config.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        url: require.resolve('url/'), // แก้ไขให้ไม่มีตัวอักษรพิเศษ
    };

    // เพิ่ม plugins สำหรับ process และ Buffer
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);

    // เพิ่ม ignoreWarnings สำหรับ source-map-loader
    config.ignoreWarnings = [
        {
            module: /source-map-loader/, // เพิกเฉยการแจ้งเตือนจาก source-map-loader
        },
    ];

    return config;
};
