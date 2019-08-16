const proxy = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(proxy('/query', 
        {
            target: 'http://localhost:1337/',
            changeOrigin: true,
            secure: false,
        }
    ));
}