var express = require('express');
var fs = require('fs');
var app = express();
var request = require('superagent');

var API_BASEURL = 'https://api.cosmicjs.com/v1/tonetemple/';
var API_READ_KEY = 'A5Svxw4tq11rLGxnCGx7MLOUA7QIiznqjANMeqewHCsH7jX1vd'; //read_key=
var GLOBALS = API_BASEURL + 'object-type/globals?read_key=' + API_READ_KEY + '&hide_metafields=true';
var BRANDS = API_BASEURL + 'object-type/brands?read_key=' + API_READ_KEY + '&hide_metafields=true';


app.use('/public', express.static(__dirname + '/public'));

app.locals = {
    title: 'express example'
};

app.all('*', function(req, res, next) {
    request
        .get(GLOBALS)
        .end(function(err, res) {
            console.log('end');
            console.log(res);
        })
    fs.readFile('posts.json', function(err, data) {
        res.locals.posts = JSON.parse(data);
        next();
    })
})

app.get('/', function(req, res) {
    console.log('index page');
    res.render('index.ejs');
});

app.get('/post/:slug', function(req, res, next) {
    res.locals.posts.forEach(function(post) {
        if (req.params.slug === post.slug) {
            res.render('post.ejs', { post: post });
        }
    });
});

app.get('/brand/:slug', function(req, res, next) {
    res.locals.posts.forEach(function(post) {
        if (req.params.slug === post.slug) {
            res.render('brand.ejs', { brand: brand });
        }
    });
});

app.get('/contact-us', function(req, res) {
    console.log('contact us page');
    res.render('contactus.ejs');
});

app.get('/api/posts', function(req, res) {
    res.json(res.locals.posts);
});


app.listen(3000);
console.log('app is listening at localhost:3000');
