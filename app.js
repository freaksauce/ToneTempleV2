const express = require('express');
const fs = require('fs');
const compression = require('compression');
const request = require('superagent');
const sm = require('sitemap')
const app = express();

app.use(compression());
app.set('view cache', true);

// const API_BASEURL = 'https://api.cosmicjs.com/v1/tonetemple/';
// const API_READ_KEY = 'A5Svxw4tq11rLGxnCGx7MLOUA7QIiznqjANMeqewHCsH7jX1vd'; //read_key=
// const GLOBALS = `${API_BASEURL}object-type/globals?read_key=${API_READ_KEY}&hide_metafields=true`;
// const BRANDS = `${API_BASEURL}object-type/brands?read_key=${API_READ_KEY}&hide_metafields=true`;
// const API_READ_KEY = 'A5Svxw4tq11rLGxnCGx7MLOUA7QIiznqjANMeqewHCsH7jX1vd'; //read_key=
const API_CACHE = {
  get apiEnd() { return `.json` },
  get globals() { return `${app.locals.baseUrl}globals${this.apiEnd}` },
  get brands() { return `${app.locals.baseUrl}brands${this.apiEnd}` }
}


app.use('/public', express.static(__dirname + '/public'));
app.use('/api', express.static(__dirname + '/api'))

app.locals = {
    title: 'Tone Temple - Exclusive Strandberg Australia Retailers',
    metaDescription: 'Tone Temple is the exclusive Strandberg Australia Retailer as well as retailer for brands such as Friedman Amplifiers, Yankee Power Supplies and Evil Angel Pickups'
};

app.get('*', function(req, res, next) {
  const currHost = req.get('host')
  if (currHost === 'localhost:3000') {
    app.locals.baseUrl = 'http://localhost:3000/api/';
  } else {
    app.locals.baseUrl = 'http://www.tonetemple.com.au/api/';
  }
  next();
  // fetchContent('globals')
  //   .then(data => {
  //     next()
  //   })
})

function fetchGlobals() {
    return new Promise((resolve, reject) => {
        request
            .get(API_CACHE['globals'])
            .end(function(err, res) {
                app.locals.globals = JSON.parse(res.text);
                // console.log('fetch globals', app.locals.globals);
                resolve(true);
        });
    });
}

function fetchBrands() {
    return new Promise((resolve, reject) => {
        request
            .get(API_CACHE['brands'])
            .end(function(err, res) {
                app.locals.brands = JSON.parse(res.text);
                // console.log('fetch brands', app.locals.brands);
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

/*
 * sitemap
 */
sitemap = sm.createSitemap ({
      hostname: 'http://www.tonetemple.com.au',
      cacheTime: 600000,        // 600 sec - cache purge period
      urls: [
        { url: '/',  changefreq: 'monthly', priority: 1.0 },
        { url: '/brand/strandberg-guitars',  changefreq: 'monthly',  priority: 0.9 },
        { url: '/brand/friedman-amplification',  changefreq: 'monthly',  priority: 0.8 },
        { url: '/brand/evil-angel-pickups',  changefreq: 'monthly',  priority: 0.7 },
        { url: '/brand/yankee',  changefreq: 'monthly',  priority: 0.7 },
        { url: '/brand/tronical',  changefreq: 'monthly',  priority: 0.7 },
        { url: '/brand/ilitch-electronics',  changefreq: 'monthly',  priority: 0.7 },
        { url: '/contact-us',  changefreq: 'monthly',  priority: 0.7 },
      ]
    });
app.get('/sitemap.xml', function(req, res) { // send XML map
    sitemap.toXML( function (err, xml) {
      if (err) {
        return res.status(500).end();
      }
      res.header('Content-Type', 'application/xml');
      res.send( xml );
  });
})

app.listen(process.env.PORT || 3000);
const mode = (process.env.NODE_ENV !== undefined) ? process.env.NODE_ENV : 'development';
console.log('app is listening at localhost:3000 ' + mode + ' mode');
