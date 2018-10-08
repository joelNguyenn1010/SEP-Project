var express = require('express');
var router = express.Router();
 
router.get('/', function API(req, res, next) {
  setTimeout(function() {
    res.send('ok\n');
  }, 10000);
});
 
 
module.exports = router;