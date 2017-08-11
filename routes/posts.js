var express = require('express');
var router = express.Router();
var postClient = require('../clients/postClient');
var path = require('path');
var shortid = require('shortid');
var fs = require('fs');
var serializer = require('../serializer/serializer');
var validation = require('../clients/validations');


// CREATE NEW POST

router.post('/create', function (req, res, next) {
    let title = req.body.title;
    let description = req.body.description;
    let fotoFile = req.files.fotoFile;
    let author = req.userID;
    let fileName = shortid.generate() + fotoFile.name;

    let validationErrors;
    validationErrors = {fotoFile: [], title: [], description: []};
    validationErrors.fotoFile.push(...validation.validateImageExtension(fotoFile));
    validationErrors.title.push(...validation.validateTitle(title));
    validationErrors.description.push(...validation.validateDescription(description));
    validationErrors.fotoFile.push(...validation.validatePhoto(fotoFile));

    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors});
    }

    fotoFile.mv(path.join(postClient.fileUploadPath, fileName), function (err) {
        if (err) return res.sendStatus(500);
        postClient.createPost(title, description, author, path.join('uploads/posts/', fileName), function () {
            return res.sendStatus(201);
        })
    });

});

//UPDATE POST

router.put('/:id', function (req, res, next) {
    let postId = req.params.id;
    let user = req.userID;
    let title = req.body.title;
    let description = req.body.description;
    let validationErrors = {title: [], description: [], author: []};
    validationErrors.title.push(...validation.validateTitle(title, false));
    validationErrors.description.push(...validation.validateDescription(description, false));


    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors});
    }

    postClient.getPost(postId, function (posts) {
        // if post was not found
        if (posts.length === 0) return res.sendStatus(404);
        let post = posts[0];

        if (!(title === undefined || title === '')) post.title = title;
        if (!(description === undefined || description === '')) post.description = description;

        if (post.userID === user) {
            postClient.updatePost(post, function () {
                return res.json(serializer.serializePost(post));
            });
        } else {
            return res.sendStatus(403);
        }
    });
});

//DELETE POST

router.delete('/:id', function (req, res, next) {
    let postId = req.params.id;
    let user = req.userID;

    postClient.getPost(postId, function (posts) {
        // if post was not found
        if (posts.length === 0) return res.sendStatus(404);
        let post = posts[0];

        if (post.userID === user) {
            postClient.deletePost(postId, function () {
                return res.sendStatus(200);
            });
        } else {
            return res.sendStatus(403);
        }
    });
});

//GET SPECIFIC POST

router.get('/get/:id', function (req, res, next) {
    let postId = req.params.id;

    postClient.getPost(postId, function (posts) {
        if (posts.length === 0) return res.sendStatus(404);
        let post = posts[0];
        return res.json(serializer.serializePost(post));
    })
});

// GET PHOTO FILE

router.get('/uploads/posts/:fileName', function (req, res, next) {
    let fileName = req.params.fileName;
    try {
        // Throws exception if file is not present on disk
        let img = fs.readFileSync(path.join(postClient.fileUploadPath, fileName));
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        return res.end(img, 'binary');
    } catch (err) {
        return res.sendStatus(404);
    }

});

//GET POST USERS

router.get('/author/', function (req, res, next) {
    let page = req.query.page === undefined ? 0 : req.query.page;
    let validationErrors = {page: []};
    validationErrors.page.push(...validation.validatePage(page));

    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors});
    }
    postClient.getPostsForUsers([req.userID], page, function (posts) {
        return console.log(validationErrors) + res.json({"page": page, "posts": posts.map(serializer.serializePost)});
    })
});


module.exports = router;
