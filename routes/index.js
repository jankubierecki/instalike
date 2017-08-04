var express = require('express');
var router = express.Router();
var userClient = require('../clients/userClient');

/* GET home page. */
router.get('/', function(req, res, next) {

  userClient.getUserByEmail('aaa"gmail.com', function (users) {
      if(users.length === 0) return res.sendStatus(404);
      let user = users[0];
      return res.json(user);
  })
});

module.exports = router;
