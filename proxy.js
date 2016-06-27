var proxy = require('express-http-proxy');
var app = require('express')();

var allowCrossDomain = function (req, res, next) {
    if ('OPTIONS' == req.method) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.sendStatus(200);
        res.end();
    }
    else {
        next();
    }
};

app.use(allowCrossDomain);

app.use(proxy('http://rates-staging.stagev1internal.dreamlines.de', {
    forwardPath: function (req, res) {
        console.log(req.url);
        return require('url').parse(req.url).path;
    }
}));

app.listen(9999);
console.log('proxy is online')