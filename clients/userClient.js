var mysqlPool = require('./mysqlPool');
var passwordHash = require('password-hash');


class UserClient {
    constructor() {
        this.paginateBy = 10;
        this.getUserByEmailSQL = 'SELECT * FROM `users` WHERE email = ? ;';
        this.createUserSQL = 'INSERT INTO `users`(`id`, `email`, `password`) VALUES (NULL, ?, ?);';
        this.getFriendsSQL =
            'SELECT f.id, u.id AS friendID, u.email AS friendEmail ' +
            'FROM friends AS f ' +
            'INNER JOIN users AS u ON f.friendID = u.id ' +
            'WHERE f.userID = ?;';
        this.createUserFriendSQL = 'INSERT INTO `friends` (`id`, `userID`, `friendID`) VALUES (NULL, ?, ?);';
        this.getUserByIDSQL = 'SELECT * FROM `users` WHERE id = ? ;';
        this.searchUserSQL = "SELECT id, email FROM `users` HAVING LEFT(email, LOCATE('@', email) - 1) LIKE CONCAT('%', ?, '%') ORDER BY `users`.`id` DESC LIMIT ?,?;";
        this.deleteUserFriendSQL = 'DELETE FROM `friends` WHERE userID = ? AND friendID = ?';
        this.getFriendsCountSQL = 'SELECT COUNT(*) AS friendsCount FROM `friends` WHERE `userID` = ?;';
        this.getUserFollowersCountSQL = "SELECT COUNT(*) as userFollowersCount FROM friends WHERE friendID = ?;";

    }

    getUserByEmail(email, cb) {
        mysqlPool.query(this.getUserByEmailSQL, [email], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

    createUser(email, password, cb) {
        let passwordHashed = passwordHash.generate(password);
        mysqlPool.query(this.createUserSQL, [email, passwordHashed], function (err, fields) {
            if (err) throw err;
            cb();
        })
    }

    isPasswordValid(user, password) {
        return passwordHash.verify(password, user.password);
    }

    getFriends(userID, cb) {
        mysqlPool.query(this.getFriendsSQL, [userID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

    createUserFriend(userID, friendID, cb) {
        mysqlPool.query(this.createUserFriendSQL, [userID, friendID], function (err, fields) {
            if (err) throw err;
            cb();
        });
    }

    getUserByID(userID, cb) {
        mysqlPool.query(this.getUserByIDSQL, [userID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

    searchUser(string, page, cb) {
        mysqlPool.query(this.searchUserSQL, [string, page * this.paginateBy, this.paginateBy], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

    deleteUserFriend(userID, friendID, cb) {
        mysqlPool.query(this.deleteUserFriendSQL, [userID, friendID], function (err, fields) {
            if (err) throw err;
            cb();
        });
    }

    getFriendsCount(userID, cb) {
        mysqlPool.query(this.getFriendsCountSQL, [userID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows[0].friendsCount);
        })
    }

    getUserFollowersCount(userID, cb) {
        mysqlPool.query(this.getUserFollowersCountSQL, [friendID], function (err, rows, fields) {
            if (err) throw err;
            cb(rows[0].userFollowersCount);
        })
    }
}


module.exports = new UserClient();