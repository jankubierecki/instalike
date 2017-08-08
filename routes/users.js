var express = require('express');
var router = express.Router();
var userClient = require('../clients/userClient');
var validation = require('../clients/validations');
var authTokenClient = require('../clients/authTokenClient');


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
            })
        }
    })

});

// ADD TOKEN to the user
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

module.exports = router;
