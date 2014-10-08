var express = require('express'),
    bodyParser = require('body-parser'),
    livereload = require('connect-livereload'),
    favicon = require('serve-favicon'),
    compress = require('compression'),
    app = express();

app.use(favicon(__dirname + '/public/assets/favicon.ico'));
app.use(compress());
app.use(livereload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
	res.setHeader('X-UA-Compatible', 'IE=edge,chrome=1');
	next();
});
app.use(express.static(__dirname + '/public'));

app.post('/submit', function(req, res) {
    console.log(req.body);
    res.end('ok');
});

module.exports = app;