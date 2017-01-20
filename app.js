const express = require('express');
const fs = require('fs');
const app = express();
const request = require('superagent');

const API_BASEURL = 'https://api.cosmicjs.com/v1/tonetemple/';
const API_READ_KEY = 'A5Svxw4tq11rLGxnCGx7MLOUA7QIiznqjANMeqewHCsH7jX1vd'; //read_key=
const GLOBALS = `${API_BASEURL}object-type/globals?read_key=${API_READ_KEY}&hide_metafields=true`;
// https://api.cosmicjs.com/v1/tonetemple/object-type/globals?pretty=true&hide_metafields=true&read_key=A5Svxw4tq11rLGxnCGx7MLOUA7QIiznqjANMeqewHCsH7jX1vd
const BRANDS = `${API_BASEURL}object-type/brands?read_key=${API_READ_KEY}&hide_metafields=true`;
// https://api.cosmicjs.com/v1/tonetemple/object-type/brands?pretty=true&hide_metafields=true&read_key=A5Svxw4tq11rLGxnCGx7MLOUA7QIiznqjANMeqewHCsH7jX1vd

app.use('/public', express.static(__dirname + '/public'));

app.locals = {
    title: 'Tone Temple - Exclusive Strandberg Australia Retailers',
    metaDescription: 'Tone Temple is the exclusive Strandberg Australia Retailer as well as retailer for brands such as Friedman Amplifiers, Yankee Power Supplies and Evil Angel Pickups'
};

app.all('*', function(req, res, next) {
    fs.readFile('posts.json', function(err, data) {
        res.locals.posts = JSON.parse(data);
        next();
    })
});

function fetchGlobals() {
    return new Promise((resolve, reject) => {
        request
            .get(GLOBALS)
            .end(function(err, res) {
                console.log('fetch globals');
                app.locals.globals = JSON.parse(res.text);
                // console.log(app.locals.globals.objects);
                resolve(true);
        });
    });
}

function fetchBrands() {
    return new Promise((resolve, reject) => {
        request
            .get(BRANDS)
            .end(function(err, res) {
                app.locals.brands = JSON.parse(res.text);
                console.log('fetch brands');
                // console.log(app.locals.brands.objects);
                resolve(true);
            });
    });
}

app.get('/', function(req, res) {
    const myRes = res;
    const promises = [fetchGlobals(), fetchBrands()];
    Promise.all(promises).then(function() {
        console.log('GLOBALS', app.locals.globals);
        // console.log('BRANDS', app.locals.brands);

        // get meta info for page render
        app.locals.globals.objects.forEach(global => {
            if (global.slug === 'meta-description') {
                app.locals.metaDescription = stripTags(global.content);
            }
            // get homepage videos
            if (global.slug === 'homepage-videos') {
                app.locals.homepageVideos = global.metadata.videos;
            }
            // get brands info for homepage
            if (global.slug === 'our-brands') {
                app.locals.homepageOurBrands = global.content;
            }
        });



        myRes.render('index.ejs', {
            metaDescription: app.locals.metaDescription
        });
    });
});

app.get('/brand/:slug', function(req, res, next) {
    res.locals.brands.objects.forEach(brand => {
        if (req.params.slug === brand.slug) {
            res.render('brand.ejs', { brand: brand });
        }
    })
});

app.get('/contact-us', function(req, res) {
    console.log('contact us page');
    res.render('contactus.ejs');
});

// app.get('/post/:slug', function(req, res, next) {
//     res.locals.posts.forEach(function(post) {
//         if (req.params.slug === post.slug) {
//             res.render('post.ejs', { post: post });
//         }
//     });
// });

function stripTags(str) {
    return str.replace(/(<([^>]+)>)/ig,"");
}

app.listen(3000);
console.log('app is listening at localhost:3000');
