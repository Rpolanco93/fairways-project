const router = require('express').Router();
const { User } = require('../../db/models');
// GET /api/restore-user
const { restoreUser } = require('../../utils/auth.js');


router.use(restoreUser);

module.exports = router;
