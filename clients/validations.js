let userClient = require('../clients/userClient');
let express = require('express');
let router = express.Router();

class Validators {

    getErrorCount(validationErrors) {
        return Object.keys(validationErrors).reduce(function (previous, current) {
            return previous + validationErrors[current].length;
        }, 0);
    }

    validateEmail(email) {
        let errors = [];

        // typical email pattern, also avaiable : mysite@you.me.net:
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (reg.test(email) === false) errors.push('Email is not vaild');

        return errors;
    }

    validatePassword(password) {
        let errors = [];

        //Minimum eight characters, at least one letter, one number and one special character:
        let reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;

        if (reg.test(password) === false) errors.push('Password does not meet the requirements');

        return errors;
    }

    arePasswordsSame(old, passwordConfirm) {
        let errors = [];
        if (old !== passwordConfirm) errors.push('Passwords are not equal');
        return errors;
    }

    validateImageExtension(image) {
        let errors = [];
        let reg = /\.(jpe?g|png|gif|bmp)$/i;
        if (!reg.test(image.name)) errors.push('Image file extension is incorrect');
        return errors;
    }

    validateDescription(description, isRequired = true) {
        return this.validateString(description, "Description", 200, isRequired);
    }

    validateTitle(title, isRequired = true) {
        return this.validateString(title, "Title", 50, isRequired);
    }

    validatePhoto(photo) {
        let errors = [];
        if (photo.data.length > 307200) errors.push('Image file size is too big, max size is 3 mb');
        return errors;
    }

    validateString(value, fileName, maxLength, isRequired) {
        let errors = [];

        if (isRequired) {
            if (value === "" || value === undefined) errors.push(fileName + ' cannot be empty');
        }

        if (value !== undefined && value.length > maxLength) errors.push(fileName + ' cannot be larger than ' + maxLength + ' characters');
        return errors;
    }

    validateTokenHeader(parameters) {
        let token = parameters.token;
        let errors = [];
        if (token === undefined) errors.push('Authorization token is missing, can be obtained by user/login');
        return errors;
    }

    validatePage(page) {
        let errors = [];
        let reg = /^\d+$/;
        if (reg.test(page) === false) errors.push('input can only be a positive number');
        return errors;
    }

    validateQueries(query) {
        let errors = [];
        let reg = /^[\w ]+$/;

        query.forEach(function (val) {
            if (reg.test(val) === false) errors.push('Wrong Input');
        });

        return errors;
    }

    validateFriendID(friendID) {
        let errors = [];
        let reg = /^([1-9][0-9]{0,8})$/;
        if (reg.test(friendID) === false) errors.push('Wrong Input');
        return errors;
    }
}

module.exports = new Validators();
