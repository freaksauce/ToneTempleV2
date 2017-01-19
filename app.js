var express = require('express');
var fs = require('fs');
var app = express();

app.use('/public', express.static(__dirname + '/public'));

app.locals = {
    title: 'express example'
};

app.all('*', function(req, res, next) {
    fs.readFile('posts.json', function(err, data) {
        res.locals.posts = JSON.parse(data);
        next();
    })
})

app.get('/', function(req, res) {
    res.render('index.ejs');
});

app.get('/post/:slug', function(req, res, next) {
    res.locals.posts.forEach(function(post) {
        if (req.params.slug === post.slug) {
            res.render('post.ejs', { post: post });
        }
    });
});

app.get('/api/posts', function(req, res) {
    res.json(res.locals.posts);
});

/**
    CosmicJS start
**/
var config = {};
config.bucket = {
  slug: 'tonetemple',
  read_key: 'A5Svxw4tq11rLGxnCGx7MLOUA7QIiznqjANMeqewHCsH7jX1vd',
  write_key: '' // add write_key if added to your Cosmic JS bucket settings
};
var Cosmic = require('cosmicjs');

/* Get bucket
================================ */
Cosmic.getBucket(config, function(error, response){
  // console.log(response);
});

/* Get objects
================================ */
Cosmic.getObjects(config, function(error, response){
  // console.log(response);
});

/* Get objects by type
================================ */
var params = {
  type_slug: 'posts',
  limit: 5,
  skip: 0
};
Cosmic.getObjectType(config, params, function(error, response){
  // console.log(response);
});

/* Get object
================================ */
var params = {
  slug: 'object-slug'
}
Cosmic.getObject(config, params, function(error, response){
  // console.log(response);
});
/**
    CosmicJS end
**/

app.listen(3000);
console.log('app is listening at localhost:3000');
