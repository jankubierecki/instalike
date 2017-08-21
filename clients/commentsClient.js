var mysqlPool = require('./mysqlPool');


class CommentsClient {
    constructor() {
        this.createCommentSQL = "INSERT INTO `comments` (`userID`, `postID`, `description`) VALUES  (?, ?, ?);";
        this.getCommentsSQL = "SELECT comments.id, comments.description, comments.userID, comments.createdAt, users.email " +
            "FROM `comments` INNER JOIN `users` ON comments.userID = users.id WHERE postID = ? ORDER BY createdAt DESC;";
    }

    createComment(userID, postID, description, cb) {
        mysqlPool.query(this.createCommentSQL, [userID, postID, description], function (err, rows, fields) {
            if (err) throw err;
            cb();
        });

    }

    //todo paginate get comments
    getComments(postID, cb) {
        mysqlPool.query(this.getCommentsSQL, [postID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

//todo likes
}

module.exports = new CommentsClient();