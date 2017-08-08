var express = require('express');
var postClient = require('../clients/postClient');
var validation = require('../clients/validations');
var router = express.Router();
var path = require('path');
var shortid = require('shortid');
var fs = require('fs');
var serializer = require('../serializer/serializer');


// CREATE NEW POST

router.post('/', function (req, res, next) {
    let title = req.body.title;
    let description = req.body.description;
    let fotoFile = req.files.fotoFile;
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
        postClient.createPost(title, description, req.userID, path.join('uploads/posts/', fileName), function () {
            return res.sendStatus(201);
        })
    });
});

router.put('/:id', function (req, res, next) {
    let postId = req.params.id;
    let title = req.body.title;
    let description = req.body.description;
    let validationErrors = {title: [], description: []};
    validationErrors.title.push(...validation.validateTitle(title, false));
    validationErrors.description.push(...validation.validateDescription(description, false));

    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors});
    }

    //todo validate if requested user is author.
    postClient.getPost(postId, function (posts) {
        // if post was not found
        if (posts.length === 0) return res.sendStatus(404);
        let post = posts[0];

        if (!(title === undefined || title === '')) post.title = title;
        if (!(description === undefined || description === '')) post.description = description;

        postClient.updatePost(post, function () {
            return res.json(serializer.serializePost(post));
        })
    })
});

// TODO DELETE POST router.delete(/:id) //todo validate if requested user is author.
// TODO GET POST router.get(/:id)

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

router.get('/author/', function (req, res, next) {
    let page = req.query.page === undefined ? 0 : req.query.page;
    postClient.getPostsForUsers([req.userID], page, function (posts) {
        //todo validate page (int, unsigned int, +/-)
        return res.json({"page": page, "posts": posts.map(serializer.serializePost)});
    })
});


module.exports = router;
