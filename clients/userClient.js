var mysqlPool = require('./mysqlPool');
var passwordHash = require('password-hash');


class UserClient {
    constructor() {
        this.getUserSQL = 'SELECT * FROM `users` WHERE email = ? ;';
        this.createUserSQL = 'INSERT INTO `users`(`id`, `email`, `password`) VALUES (NULL, ?, ?);';
    }

    getUserByEmail(email, cb) {
        mysqlPool.query(this.getUserSQL, [email], function (err, rows, fields) {
            if (err) throw err;
            cb(rows);
        });
    }

    createUser(email, password, cb) {
        let passwordHashed = passwordHash.generate(password)
        mysqlPool.query(this.createUserSQL, [email, passwordHashed], function (err, fields) {
            if (err) throw err;
            cb();
        })
    }

    isPasswordValid(user, password) {
        return passwordHash.verify(password, user.password);
    }
}


module.exports = new UserClient();