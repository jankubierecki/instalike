var mysqlPool = require('./mysqlPool');
var passwordHash = require('password-hash');


class UserClient {
    constructor() {
        this.getUserByEmailSQL = 'SELECT * FROM `users` WHERE email = ? ;';
        this.createUserSQL = 'INSERT INTO `users`(`id`, `email`, `password`) VALUES (NULL, ?, ?);';
        this.getFriendsSQL =
            'SELECT f.id, u.id AS friendID, u.email AS friendEmail ' +
            'FROM friends AS f ' +
            'INNER JOIN users AS u ON f.friendID = u.id ' +
            'WHERE f.userID = ?;';
        this.createUserFriendSQL = 'INSERT INTO `friends` (`id`, `userID`, `friendID`) VALUES (NULL, ?, ?);';
        this.getUserByIDSQL = 'SELECT * FROM `users` WHERE id = ? ;';
        this.searchUserSQL = "SELECT id, email FROM `users` HAVING LEFT(email, LOCATE('@', email) - 1) LIKE CONCAT('%', ?, '%')";
        this.deleteUserFriendSQL = 'DELETE FROM `friends` WHERE userID = ? AND friendID = ?';


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

    searchUser(string, cb) {
        mysqlPool.query(this.searchUserSQL, [string], function (err, rows, fields) {
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
}


module.exports = new UserClient();