var express = require('express');
var router = express.Router();
var posts = require('./../models/posts');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {posts: []});

});

module.exports = router;
