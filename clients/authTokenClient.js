var mysqlPool = require('./mysqlPool');
var passwordHash = require('password-hash');


class AuthTokenClient {
    constructor() {
        this.createAuthTokenSQL = 'INSERT INTO `authorizedUsers`( `token`, `userID`) VALUES (? , ? );';
        this.getAuthTokenSQL = 'SELECT * FROM `authorizedUsers` WHERE userID = ? AND createdAt > ?;';
    }

    createToken(userID, userEmail, cb) {
        let token = passwordHash.generate(userEmail);
        mysqlPool.query(this.createAuthTokenSQL, [token, userID], function (err, fields) {
            if (err) throw err;
            cb(token);
        });
    }

    getAuthToken(userID) {
        let date = new Date().toISOString();
        mysqlPool.query(this.getAuthTokenSQL, [id, date], function (err, tokens, fields) {
            if(err) throw err;
            cb(tokens);
        })
    }

}


module.exports = new AuthTokenClient();