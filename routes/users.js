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


router.post('/friends', function (req, res, next) {
    let friendID = req.body.friendID;
    let userID = req.userID;

    //todo validate if is is friendID AND if the friend exists AND is not already a friend and you cannot be friend with yourself
    userClient.createUserFriend(userID, friendID, function () {
        return res.sendStatus(201);
    });
});


// todo delete friend (new route)


var getProfile = function (userID, res) {
    let profile = {user: {}, posts: [], postCount: 0, friendsCount: 0, userFollowersCount: 0}
//todo add another two counts ( friendscount and userfollowerscount)
    userClient.getUserByID(userID, function (users) {
        if (users.length !== 1) return res.sendStatus(404);
        let user = users[0];
        profile.user = serializer.serializeUser(user);

        postClient.getPostCount(userID, function (postCount) {
            profile.postCount = postCount;

            postClient.getPostsForUsers([userID], 0, function (posts) {
                profile.posts = posts.map(serializer.serializePost);
                return res.json(profile);
            });

        })
    });


};

//todo add list friends of user (new endpoint) serializer

router.get('/profile', function (req, res, next) {
    return getProfile(req.userID, res);
});


router.get('/profile/:id(\\d+)/', function (req, res, next) {
    return getProfile(req.params.id, res);
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
