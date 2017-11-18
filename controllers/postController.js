var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var Post = require('../models/post');
var config = require('../config');

exports.getPosts = function (req, res, limit) {
    Post.find((err, posts) => {
        if (err) throw err;
        res.json(posts);
    }).limit(limit);
};

exports.getPostsById = function (pid, callback) {
    Post.find( {id: pid}, callback );
};

exports.getPostByUserId = function (req, res) {
    Post.find({ userId: req.params.uid }, (err, postByUser) => {
        if (err) throw err;
        res.json(postByUser);
    });
}