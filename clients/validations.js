let userClient = require('../clients/userClient');
let express = require('express');
let router = express.Router();

class Validators {

    validateEmail(email) {
        let errors = [];

        // typical email pattern, also avaiable : mysite@you.me.net:
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        !reg.test(email) ? errors.push('Email is not vaild') : console.log('email is vaild');

        return errors;
    }

    validatePassword(password) {
        let errors = [];

        //Minimum eight characters, at least one letter, one number and one special character:
        let reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;

        !reg.test(password) ? errors.push('Password does not meet the requirements') : console.log('password is vaild');

        return errors;
    }

    arePasswordsSame(old, passwordConfirm) {
        let errors = [];
        if (old !== passwordConfirm) errors.push('Passwords are not equal');
        return errors;
    }
}

module.exports = new Validators();