var express = require('express');
var router = express.Router();
var userClient = require('../clients/userClient');
/* GET users listing. */

router.post('/register', function (req, res, next) {
    let email = req.body.email, password = req.body.password;
// TODO: add other validation
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

//TODO: add password validation
router.post('/login', function (req, res, next) {
    let email = req.body.email, password = req.body.password;
    let validationErrors = [];
    validationErrors.push(validateEmail(email));
    validationErrors.push(validatePassword(password));

    if(validationErrors.length != 0 ){
        res.status(400);
        return res.json({"errors": validationErrors})
    }
    userClient.getUserByEmail(email, function (users) {
        // if user exists
        if (users.length !== 0) {
            let user = users[0];
            // if password is vaild
            if (userClient.isPasswordValid(user, password)) {

            } else {
                res.status(400);
                return res.json({error: {email: "Password is not vaild"}});
            }
        } else {
            res.status(400);
            return res.json({error: {email: "User Does not Exist"}});
        }


    })
})

module.exports = router;
