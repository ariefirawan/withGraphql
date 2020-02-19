const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const ITEM_PER_PAGE = 2;
    let totalItems;
    Post.find()
    .countDocuments()
    .then(count => {
        totalItems = count;
        return Post.find()
            .skip((currentPage - 1) * ITEM_PER_PAGE)
            .limit(ITEM_PER_PAGE)
    })
    .then(result => {
        res.status(200).json({
            message: 'Fetch Successfully', posts: result, totalItems: totalItems
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

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        const error = new Error('Validation Failed')
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
        console.log(imageUrl)
    }
    if (!imageUrl) {
        const error = new Error('Could Not find post');
        error.statusCode = 404;
        throw error;
    }
    Post.findById(postId)
    .then(post => {
        if(!post) {
            const error = new Error('Could Not find post');
            error.statusCode = 404;
            throw error;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save();

    })
    .then(result => {
        console.log(result)
        res.status(200).json({ message:'Updated!', post: result})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
    .then(post => {
        if(!post) {
            const error = new Error('Could Not find post');
            error.statusCode = 404;
            throw error;
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result => {
        console.log(result)
        res.status(200).json({message: 'Delete Successed'})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath );
    fs.unlink(filePath, err => console.log(err))
}