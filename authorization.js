var authTokenClient = require('./clients/authTokenClient');
var validation = require('./clients/validations');

module.exports = function (req, res, next) {
    if (req.path !== '/users/login' && req.path !== '/users/register') {

        var apiToken = req.header('Authorization');
        let validationErrors;
        validationErrors = {apiToken: []};
        validationErrors.apiToken.push(...validation.validateTokenHeader(apiToken));

        if (validation.getErrorCount(validationErrors) !== 0) {
            res.status(401);
            return res.json(({"errors": validationErrors}));
        }

        authTokenClient.getAuthToken(apiToken, function (tokens) {
            let isAuthenticated = tokens.length !== 0;
            if (isAuthenticated) {
                req.apiToken = apiToken;
                req.userID = tokens[0].userID;
                next();
            } else {
                return res.sendStatus(401);
            }
        });
    } else {
        next();
    }
};