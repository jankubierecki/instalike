var express = require('express');
var router = express.Router();
var postClient = require('../clients/postClient');
var path = require('path');
var shortid = require('shortid');
var fs = require('fs');
var serializer = require('../serializer/serializer');
var validation = require('../clients/validations');
var userClient = require('../clients/userClient');
var commentsClient = require('../clients/commentsClient');


// CREATE NEW POST

router.post('/create/', function (req, res, next) {
    let title = req.body.title;
    let description = req.body.description;
    let fotoFile = req.files.fotoFile;
    let user = req.userID;
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
        postClient.createPost(title, description, user, path.join('uploads/posts/', fileName), function () {
            return res.sendStatus(201);
        })
    });

});

//UPDATE POST

router.put('/:id(\\d+)/', function (req, res, next) {
    let postId = req.params.id;
    let user = req.userID;
    let title = req.body.title;
    let description = req.body.description;
    let validationErrors = {title: [], description: [], user: []};
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

        if (post.userID === user) {
            postClient.updatePost(post, function () {
                return res.json(serializer.serializePost(post));
            });
        } else {
            return res.sendStatus(403);
        }

        if (!(title === undefined || title === '')) post.title = title;
        if (!(description === undefined || description === '')) post.description = description;

    });
});

//DELETE POST

router.delete('/:id(\\d+)/', function (req, res, next) {
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

router.get('/:id(\\d+)/', function (req, res, next) {
    let postId = req.params.id;

    postClient.getPost(postId, function (posts) {
        if (posts.length === 0) return res.sendStatus(404);
        let post = serializer.serializePost(posts[0]);
        commentsClient.getComments(post.id, function (comments) {
            post.comments = comments.map(serializer.serializeComment);
            return res.json(post);
        })
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

//GET ALL USER POSTS

router.get('/user/:id(\\d+)', function (req, res, next) {
    let user = req.params.id;
    let page = req.query.page === undefined ? 0 : req.query.page;
    let validationErrors = {page: []};
    validationErrors.page.push(...validation.validatePage(page));

    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors});
    }

    postClient.getPostsForUsers(user, page, function (posts) {
        userClient.getUserByID(user, function (users) {
            if (users.length === 0) return res.sendStatus(404);
            return res.json({"page": page, "posts": posts.map(serializer.serializePost)});
        });
    });
});

//GET POSTS FROM USER'S FRIENDS

router.get('/stream/', function (req, res, next) {
    let page = req.query.page === undefined ? 0 : req.query.page;
    let validationErrors = {page: []};
    validationErrors.page.push(...validation.validatePage(page));

    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors});
    }

    postClient.getPostFromFriends(req.userID, page, function (posts) {
        return res.json({"page": page, "posts": posts.map(serializer.serializePost)});
    })
});

//SEARCH POST

router.get('/search/', function (req, res, next) {
    let queries = req.query.string.split(' ');
    let validationErrors = {query: []};
    validationErrors.query.push(...validation.validateQueries(queries));


    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors});
    }

    postClient.searchPost(queries, function (posts) {
        return res.json(posts.map(serializer.serializePost));

    });
});


router.post('/:postID(\\d+)/comments', function (req, res, next) {
    let postID = req.params.postID;
    let userID = req.userID;
    let description = req.body.description;
    let responsePostID = req.body.responsePostID;

    let validationErrors = {description: []};
    validationErrors.description.push(...validation.validateDescription(description));


    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors});
    }

    postClient.getPost(postID, function (posts) {
        if (posts.length !== 1) return res.sendStatus(404);
//todo validate if responsepostid is int
        if (responsePostID !== undefined) {
            postClient.getPost(responsePostID, function (responsePosts) {
                if (responsePosts.length !== 1) return res.sendStatus(404);

                commentsClient.createComment(userID, postID, description, responsePostID, function () {
                    return res.sendStatus(201);
                });
            });
        } else {
            commentsClient.createComment(userID, postID, description, responsePostID, function () {
                return res.sendStatus(201);
            });
        }
    });
});


//todo delete and update posts (2 min limit)

module.exports = router;


