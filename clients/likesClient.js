var mysqlPool = require('./mysqlPool');


class LikesClient {
    constructor() {
        this.addPostLikeSQL = "INSERT INTO `likes`(`userID`, `postID`) VALUES (?, ?);";
        this.addCommentLikeSQL = "INSERT INTO `likes`(`userID`, `commentID`) VALUES (?, ?);";
        this.deletePostLikeSQL = "DELETE FROM `likes` WHERE userID = ? AND postID = ?;";
        this.deleteCommentLikeSQL = "DELETE FROM `likes` WHERE userID = ? AND commentID = ?;";
        this.getPostLikesCountSQL = "SELECT COUNT(*) AS postLikes FROM `likes` WHERE postID = ?;";
        this.getCommentLikesCountSQL = "SELECT COUNT(*) AS commentLikes FROM `likes` WHERE commentID = ?;";
        this.getPostLikersSQL =
            "SELECT u.id AS userID, u.email AS userEmail " +
            "FROM users AS u " +
            "INNER JOIN likes AS l ON u.id = l.userID " +
            "WHERE postID = ?;";
        this.getCommentLikersSQL =
            "SELECT u.id AS userID, u.email AS userEmail " +
            "FROM users AS u " +
            "INNER JOIN likes AS l ON u.id = l.userID " +
            "WHERE commentID = ?;";
    }

    addPostLike(userID, postID, cb) {
        mysqlPool.query(this.addPostLikeSQL, [userID, postID], function (err, rows, fields) {
            if (err) throw err;
            cb();
        });
    }

    addCommentLike(userID, commentID, cb) {
        mysqlPool.query(this.addCommentLikeSQL, [userID, commentID], function (err, rows, fields) {
            if (err) throw err;
            cb();
        });
    }

    deletePostLike(userID, postID, cb) {
        mysqlPool.query(this.deletePostLikeSQL, [userID, postID], function (err, rows, fields) {
            if (err) throw err;
            cb();
        });
    }

    deleteCommentLike(userID, commentID, cb) {
        mysqlPool.query(this.deleteCommentLikeSQL, [userID, commentID], function (err, rows, fields) {
            if (err) throw err;
            cb();
        });
    }

    getPostLikesCount(postID, cb) {
        mysqlPool.query(this.getPostLikesCountSQL, [postID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows[0].postLikes)
        });
    }

    getCommentLikesCount(commentID, cb) {
        mysqlPool.query(this.getCommentLikesCountSQL, [commentID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows[0].commentLikes)
        });
    }

    getPostLikers(postID, cb) {
        mysqlPool.query(this.getPostLikersSQL, [postID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

    getCommentLikers(commentID, cb) {
        mysqlPool.query(this.getCommentLikersSQL, [commentID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }


}


module.exports = new LikesClient();