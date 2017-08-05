var authTokenClient = require('./clients/authTokenClient');

module.exports = function (req, res, next) {
    if (req.path !== '/users/login' && req.path !== '/users/register') {
        let apiToken = req.header('Authorization');
        authTokenClient.getAuthToken(apiToken, function (tokens) {
            let isAuthenticated = tokens.length !== 0;
            if (isAuthenticated) {
                req.apiToken = apiToken;
                req.userID = tokens[0].id;
                next();
            } else {
                return res.sendStatus(403);
            }
        });
    } else {
        next();
    }
};