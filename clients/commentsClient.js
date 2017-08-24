var mysqlPool = require('./mysqlPool');


class CommentsClient {
    constructor() {
        this.paginateBy = 10;
        this.createCommentSQL = "INSERT INTO `comments` (`userID`, `postID`, `responsePostID`, `description`) VALUES  (?, ?, ?, ?);";
        this.getCommentsSQL = "SELECT comments.id, comments.description, comments.userID, comments.createdAt, users.email, comments.responsePostID " +
            "FROM `comments` INNER JOIN `users` ON comments.userID = users.id WHERE postID = ? ORDER BY createdAt DESC LIMIT ?,?;";
        this.updateCommentSQL = "UPDATE `comments` SET `responsePostID`= ?, `description`= ? WHERE id = ?;";
        this.deleteCommentSQL = "DELETE FROM `comments` WHERE `id` = ?;";
        this.getSpecificCommentSQL = "SELECT * FROM `comments` WHERE comments.id = ?;";
    }

    createComment(userID, postID, responsePostID, description, cb) {
        mysqlPool.query(this.createCommentSQL, [userID, postID, responsePostID, description], function (err, rows, fields) {
            if (err) throw err;
            cb();
        });

    }

    updateComment(comment, cb) {
        mysqlPool.query(this.updateCommentSQL, [comment.responsePostID, comment.description, comment.id], function (err, fields) {
            if (err) throw err;
            cb();
        });
    }

    deleteComment(id, cb) {
        mysqlPool.query(this.deleteCommentSQL, [id], function (err, fields) {
            if (err) throw err;
            cb();
        });
    }


    getComments(postID, page, cb) {
        mysqlPool.query(this.getCommentsSQL, [postID, page * this.paginateBy, this.paginateBy], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }


    getSpecificComment(commentID, cb) {
        mysqlPool.query(this.getSpecificCommentSQL, [commentID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }


    //todo paginate get comments
    //todo likes
}

module.exports = new CommentsClient();