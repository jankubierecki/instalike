var authTokenClient = require('./clients/authTokenClient');
var validation = require('./clients/validations');

module.exports = function (req, res, next) {
    if (req.path !== '/users/login' && req.path !== '/users/register') {

        var apiToken = req.header('Authorization');
        //  todo header val.

        authTokenClient.getAuthToken(apiToken, function (tokens) {
            let isAuthenticated = tokens.length !== 0;
            if (isAuthenticated) {
                req.apiToken = apiToken;
                req.userID = tokens[0].userID;
                next();
            } else {
                return res.sendStatus(403);
            }
        });
    } else {
        next();
    }
};