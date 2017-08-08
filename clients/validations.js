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

    validateImageExtension(image) {
        let errors = [];
        let reg = /\.(jpe?g)$/i;
        if (!reg.test(image.name)) errors.push('Image file extension is incorrect');
        return errors;
    }

    validateDescription(description) {
        return this.validateString(description, "Description", 200);
    }

    validateTitle(title) {
        return this.validateString(title, "Title", 50);
    }

    validatePhoto(photo) {
        let errors = [];
        if (photo.data.length > 307200) errors.push('Image file size is too big, max size is 3 mb');
        return errors;
    }

    validateString(value, fileName, maxLength) {
        let errors = [];
        if (value === "" || value === undefined) errors.push(fileName + ' cannot be empty');
        if (value !== undefined && value.length > maxLength) errors.push(fileName + ' cannot be larger than ' + maxLength + ' characters');
        return errors;
    }

    getErrorCount(validationErrors) {
        return Object.keys(validationErrors).reduce(function (previous, current) {
            return validationErrors[current].length;
        }, 0);
    }

}

module.exports = new Validators();