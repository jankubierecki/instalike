var express = require('express');
var router = express.Router();
var userClient = require('../clients/userClient');
var validation = require('../clients/validations');
var authTokenClient = require('../clients/authTokenClient');
var serializer = require('../serializer/serializer');
var postClient = require('../clients/postClient');


// CREATE user

router.post('/register', function (req, res, next) {
    let email = req.body.email, password = req.body.password, passwordConfirm = req.body.passwordConfirm;
    let validationErrors = {email: [], password: []};
    validationErrors.email.push(...validation.validateEmail(email));
    validationErrors.password.push(...validation.validatePassword(password));
    validationErrors.password.push(...validation.arePasswordsSame(password, passwordConfirm));

    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors})
    }

    userClient.getUserByEmail(email, function (users) {
        if (users.length !== 0) {
            res.status(400);
            return res.json({error: {email: "User Exists"}});
        } else {
            userClient.createUser(email, password, function () {
                return res.sendStatus(201);
            });
        }
    });

});

// LOGIN and ADD TOKEN to the user
router.post('/login', function (req, res, next) {
    let email = req.body.email, password = req.body.password;
    let validationErrors = {email: [], password: []};
    validationErrors.email.push(...validation.validateEmail(email));
    validationErrors.password.push(...validation.validatePassword(password));

    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors})
    }


    userClient.getUserByEmail(email, function (users) {
        if (users.length !== 0) {
            let user = users[0];
            if (userClient.isPasswordValid(user, password)) {
                authTokenClient.createToken(user.id, user.email, function (token) {
                    res.status(201);
                    return res.json({apiToken: token})
                })
            } else {
                res.status(400);
                return res.json({error: {email: "Password is not vaild"}});
            }
        } else {
            res.status(400);
            return res.json({error: {email: "User Does not Exist"}});

        }

    });

});

//CREATE FRIEND

router.post('/friends', function (req, res, next) {
    let friend = req.body.friendID;
    let user = req.userID;
    let validationErrors = {friendID: []};
    validationErrors.friendID.push(...validation.validateFriendID(friend));

    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors.friendID[0]});
    }

    //if friend is user
    if (parseInt(friend) === user) return res.sendStatus(403);

    //if friend does not exist
    userClient.getUserByID(friend, function (users) {
        if (users.length === 0) return res.sendStatus(404);
    });

    //if everything is ok, create friend
    userClient.createUserFriend(user, friend, function () {
        return res.sendStatus(201);
    });
});

//DELETE FRIEND

router.post('/delete', function (req, res, next) {
    let user = req.userID;
    let friend = req.body.friendID;
    let validationErrors = {friendID: []};
    validationErrors.friendID.push(...validation.validateFriendID(friend));

    if (validation.getErrorCount(validationErrors) !== 0) {
        res.status(400);
        return res.json({"errors": validationErrors.friendID[0]});
    }

    //if friend is user
    if (parseInt(friend) === user) return res.sendStatus(403);

    //if friend does not exist
    userClient.getUserByID(friend, function (users) {
        if (users.length === 0) return res.sendStatus(404);
    });

    //if everything is ok, delete friend
    userClient.deleteUserFriend(user, friend, function () {
        return res.sendStatus(200);
    });
});

//GET PROFILE

var getProfile = function (userID, res) {
    let profile = {user: {}, posts: [], postCount: 0, friendsCount: 0, userFollowersCount: 0};

    userClient.getUserByID(userID, function (users) {
        if (users.length !== 1) return res.sendStatus(404);
        let user = users[0];
        profile.user = serializer.serializeUser(user);

        postClient.getPostCount(userID, function (postCount) {
            profile.postCount = postCount;
        });

        userClient.getFriendsCount(userID, function (friendsCount) {
            profile.friendsCount = friendsCount;
        });

        userClient.getUserFollowersCount(userID, function (followers) {
            profile.userFollowersCount = followers;
        });

        postClient.getPostsForUsers([userID], 0, function (posts) {
            profile.posts = posts.map(serializer.serializePost);
            return res.json(profile);
        });

    });

};


router.get('/profile', function (req, res, next) {
    return getProfile(req.userID, res);
});


router.get('/profile/:id(\\d+)/', function (req, res, next) {
    return getProfile(req.params.id, res);
});

//GET FRIENDS LIST FOR USER

router.get('/friendsList', function (req, res, next) {
    let user = req.userID;

    userClient.getFriends(user, function (friends) {
        return res.json(friends.map(serializer.serializeUser));
    });
});

//SEARCH USER

router.get('/search', function (req, res, next) {
    let string = req.query.string;
    //todo validate if string is correct add pagination while searching for user

    userClient.searchUser(string, function (posts) {
        return res.json(posts.map(serializer.serializeUser));

    });

});

module.exports = router;
