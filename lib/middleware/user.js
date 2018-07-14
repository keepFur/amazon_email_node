const db = require('../db');
module.exports = function(req, res, next) {
    var uid = req.session.userId;
    if (!uid) return next();
    db.dbQuery.userManage.readUserById({
        id: uid
    }).then(function(data) {
        req.user = res.locals.user = data[0];
        next();
    });
};