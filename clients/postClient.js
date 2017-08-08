var mysqlPool = require('./mysqlPool');
var path = require('path');

class PostClient {
    constructor() {
        this.fileUploadPath = path.join(path.dirname(path.dirname(require.main.filename)), '/uploads/posts/');
        this.createPostSQL = 'INSERT INTO `posts`( `userID`, `title`, `description`, `fotoPath`) VALUES (?, ?, ?, ?);';
    }

    createPost(title, description, userID, url, cb) {
        mysqlPool.query(this.createPostSQL, [userID, title, description, url], function (err, fields) {
            if (err) throw err;
            cb();
        });
    };
}


module.exports = new PostClient();