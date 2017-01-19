const express = require('express');
const fs = require('fs');
const app = express();
const request = require('superagent');

const API_BASEURL = 'https://api.cosmicjs.com/v1/tonetemple/';
const API_READ_KEY = 'A5Svxw4tq11rLGxnCGx7MLOUA7QIiznqjANMeqewHCsH7jX1vd'; //read_key=
const GLOBALS = `${API_BASEURL}object-type/globals?read_key=${API_READ_KEY}&hide_metafields=true`;
const BRANDS = `${API_BASEURL}object-type/brands?read_key=${API_READ_KEY}&hide_metafields=true`;

app.use('/public', express.static(__dirname + '/public'));

app.locals = {
    title: 'Tone Temple - Exclusive Strandberg Australia Retailers'
};

app.all('*', function(req, res, next) {
    request
        .get(GLOBALS)
        .end(function(err, res) {
            console.log('fetch globals');
            app.locals.globals = JSON.parse(res.text);
            // console.log(app.locals.globals.objects);
            app.locals.globals.objects.forEach(global => {
                console.log(global);
            })
        });
    request
        .get(BRANDS)
        .end(function(err, res) {
            console.log('fetch brands');
            app.locals.brands = JSON.parse(res.text);
            console.log(app.locals.brands);
            app.locals.brands.objects.forEach(brand => {
                console.log(brand);
            });
        });
    fs.readFile('posts.json', function(err, data) {
        res.locals.posts = JSON.parse(data);
        next();
    })
});

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
