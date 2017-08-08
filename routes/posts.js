var express = require('express');
var postClient = require('../clients/postClient');
var validation = require('../clients/validations');
var router = express.Router();
var path = require('path');
var shortid = require('shortid');
var fs = require('fs');


// CREATE NEW POST

router.post('/create', function (req, res, next) {
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
        return res.json({"errors": validationErrors})
    }

    fotoFile.mv(path.join(postClient.fileUploadPath, fileName), function (err) {
        if (err) return res.sendStatus(500);
        postClient.createPost(title, description, req.userID, path.join('uploads/posts/', fileName), function () {
            return res.sendStatus(201);
        })
    });
});

// GET PHOTO FILE

router.get('/uploads/posts/:fileName', function (req, res, next) {
    let fileName = req.params.fileName;
    try {
        let img = fs.readFileSync(path.join(postClient.fileUploadPath, fileName));
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        return res.end(img, 'binary');
    } catch (err) {
        return res.sendStatus(404);
    }

});

module.exports = router;
