var mysqlPool = require('./mysqlPool');
var path = require('path');

class PostClient {
    constructor() {
        this.paginateBy = 10;
        this.fileUploadPath = path.join(path.dirname(path.dirname(require.main.filename)), '/uploads/posts/');
        this.createPostSQL = 'INSERT INTO `posts`( `userID`, `title`, `description`, `fotoPath`) VALUES (?, ?, ?, ?);';
        this.getPostsForUsersSQL = 'SELECT * FROM `posts` WHERE `userID` IN (?) ORDER BY `createdAt` DESC LIMIT ?,?;';
        this.updatePostSQL = 'UPDATE `posts` SET `title`= ?, `description`= ? WHERE id = ?;';
        this.deletePostSQL = 'DELETE FROM `posts` WHERE `id` = ?;';
        this.getPostSQL = 'SELECT * FROM `posts` WHERE `id` = ?;';
    }


    createPost(title, description, userID, url, cb) {
        mysqlPool.query(this.createPostSQL, [userID, title, description, url], function (err, fields) {
            if (err) throw err;
            cb();
        });
    }

    getPostsForUsers(ids, page, cb) {
        mysqlPool.query(this.getPostsForUsersSQL, [ids, page * this.paginateBy, this.paginateBy], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

    updatePost(post, cb) {
        mysqlPool.query(this.updatePostSQL, [post.title, post.description, post.id], function (err, fields) {
            if (err) throw err;
            cb();
        });
    }

    deletePost(id, cb) {
        mysqlPool.query(this.deletePostSQL, [id], function (err, fields) {
            if (err) throw err;
            cb();
        });
    }

    getPost(id, cb) {
        mysqlPool.query(this.getPostSQL, [id], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }


}


module.exports = new PostClient();