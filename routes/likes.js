var express = require('express');
var router = express.Router();
var userClient = require('../clients/userClient');
var postClient = require('../clients/postClient');
var commentsClient = require('../clients/commentsClient');
var likesClient = require('../clients/likesClient');
var serializer = require('../serializer/serializer');
var validation = require('../clients/validations');


//LIKE A POST

router.post('/add/post/:postID(\\d+)', function (req, res, next) {
    let postID = req.params.postID;
    let userID = req.userID;

    postClient.getPost(postID, function (posts) {
        //if post was not found
        if (posts.length === 0) return res.sendStatus(404);
        likesClient.hasPostUserLike(userID, postID, function (hasPostLike) {
            if (!hasPostLike) {
                //if everything is ok, add like
                likesClient.addPostLike(userID, postID, function () {
                    return res.sendStatus(201);
                });
            } else {
                return res.sendStatus(403);
            }
        });
    });
});

//LIKE A COMMENT

router.post('/add/comment/:commentID(\\d+)', function (req, res, next) {
    let commentID = req.params.commentID;
    let userID = req.userID;

    commentsClient.getSpecificComment(commentID, function (comments) {
        //if comment was not found
        if (comments.length === 0) return res.sendStatus(404);
        likesClient.hasCommentUserLike(userID, commentID, function (hasCommentLike) {
            if (!hasCommentLike) {
                //if everything is ok, add like
                likesClient.addCommentLike(userID, commentID, function () {
                    return res.sendStatus(201);
                });
            } else {
                return res.sendStatus(403);
            }
        });
    });
});


//UNLIKE A POST

router.delete('/unlike/post/:postID(\\d+)/', function (req, res, next) {
    let postID = req.params.postID;
    let userID = req.userID;

    likesClient.deletePostLike(userID, postID, function () {
        return res.sendStatus(200);
    });
});


//UNLIKE A COMMENT

router.delete('/unlike/comment/:commentID(\\d+)/', function (req, res, next) {
    let commentID = req.params.commentID;
    let userID = req.userID;

    likesClient.deleteCommentLike(userID, commentID, function () {
        return res.sendStatus(200);
    });
});


module.exports = router;