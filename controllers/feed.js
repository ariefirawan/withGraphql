const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find()
    .then(result => {
        res.status(200).json({
            message: 'Fetch Successfully', posts: result
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        const error = new Error('Validation Failed')
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No Image provided')
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace("\\" ,"/");
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title, 
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: 'sotoy'
        },
        createdAt: new Date()
    });
    post
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Successfull',
            post: result
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
    
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
    .then(posta => {
        if(!posta) {
            const error = new Error('Could Not find post');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Post Fetched', post: posta });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}