const express = require('express');
const fs = require('fs');
var compression = require('compression');
const request = require('superagent');
const app = express();

app.use(compression());
app.set('view cache', true);

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
    const promises = [fetchGlobals(), fetchBrands()];
    Promise.all(promises).then(function() {
        // console.log('GLOBALS', app.locals.globals);
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
            // get main description for homepage
            if (global.slug === 'main-description') {
                app.locals.homepageWhatWeDo = global.content;
            }
        });

        app.locals.carouselItems = [];

        app.locals.brands.objects.map(brand => {
            let showOnHomepage = false;
            let medium = brand.metadata.brand_header.imgix_url;
            let large = brand.metadata.brand_header_large.imgix_url;
            showOnHomepage = brand.metadata.feature_on_homepage;

            if (medium !== 'https://cosmicjs.imgix.net/'
                && large !== 'https://cosmicjs.imgix.net/'
                && showOnHomepage === "Yes") {

              const newObj = {medium, large, showOnHomepage};
              let duplicateFound = false;
              app.locals.carouselItems.map(item => {
                if (item.medium === medium) {
                  duplicateFound = true;
                }
              });
              if (!duplicateFound) {
                app.locals.carouselItems.push(newObj);
              }
            }
        });

        res.render('index.ejs', {
            metaDescription: app.locals.metaDescription,
            navSelected: ''
        });
    });
});

app.get('/brand/:slug', function(req, res) {
    const promises = [fetchGlobals(), fetchBrands()];
    Promise.all(promises).then(function() {
        // console.log(app.locals.globals.objects);

        let selectedBrand = null;
        let headerImgObj = null;

        app.locals.brands.objects.forEach(brand => {
            if (req.params.slug === brand.slug) {
                selectedBrand = brand;

                let imgMed = null;
                let imgLrg = null;
                const meta = selectedBrand.metadata;
                imgMed = meta.brand_page_header_medium.imgix_url;
                imgLrg = meta.brand_page_header_large.imgix_url;
                if (imgLrg !== null && imgLrg !== 'https://cosmicjs.imgix.net/') {
                  headerImgObj = {large: imgLrg, medium: imgMed};
                }
            }
        });

        res.render('brand.ejs', {
            brand: selectedBrand,
            headerImgObj: headerImgObj,
            navSelected: req.params.slug,
            title: selectedBrand.metadata.meta_title + ' - Tone Temple',
            metaDescription: selectedBrand.metadata.meta_description
        });
    });


});

app.get('/contact-us', function(req, res) {
    const promises = [fetchGlobals(), fetchBrands()];
    Promise.all(promises).then(function() {
        // console.log(app.locals.globals.objects);
        // get meta info for page render
        app.locals.globals.objects.forEach(global => {
            if (global.slug === 'meta-description') {
                app.locals.metaDescription = stripTags(global.content);
            }
            // get homepage videos
            if (global.slug === 'homepage-videos') {
                app.locals.homepageVideos = global.metadata.videos;
            }
        });

        res.render('contactus.ejs', {navSelected: 'contact-us'});
    });

});

function stripTags(str) {
    return str.replace(/(<([^>]+)>)/ig,"");
}

app.listen(process.env.PORT || 3000);
const mode = (process.env.NODE_ENV !== undefined) ? process.env.NODE_ENV : 'development';
console.log('app is listening at localhost:3000 ' + mode + ' mode');
