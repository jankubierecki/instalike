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
        this.getPostCountSQL = 'SELECT COUNT(*) AS postCount FROM `posts` WHERE `userID` = ?;';
        this.getPostFromFriendsSQL =
            'SELECT posts.id, posts.userID, posts.title, posts.fotoPath, posts.description, posts.createdAt, users.email ' +
            'from posts INNER JOIN users ON posts.userID = users.id ' +
            'WHERE userID IN (SELECT friendID FROM friends WHERE userID = ?) OR userID = ? ' +
            'ORDER BY `users`.`id` DESC LIMIT ?,?;';

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

    getPostCount(userID, cb) {
        mysqlPool.query(this.getPostCountSQL, [userID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows[0].postCount);
        });
    }

    getPostFromFriends(userID, page, cb) {
        mysqlPool.query(this.getPostFromFriendsSQL, [userID, userID, page * this.paginateBy, this.paginateBy], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

    searchPost(queries, cb) {
        let baseSQL = "SELECT * FROM `posts` WHERE";
        let likeSQL = " title LIKE CONCAT('%', ?, '%')";
        let orderSQL = " ORDER BY createdAt DESC";
        let finalSQL = baseSQL;
        for (let i in queries) {
            if (i === '0') {
                finalSQL += likeSQL;
            } else {
                finalSQL += ' AND' + likeSQL;
            }
        }
        finalSQL += orderSQL;
        mysqlPool.query(finalSQL, queries, function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

}


module.exports = new PostClient();