const router = require('express').Router();

const getRoutes = require('./get.js');
const postRoutes = require('./post.js');
const putRoutes = require('./put.js');
const deleteRoutes = require('./delete.js');

router.use(getRoutes);
router.use(postRoutes);
router.use(putRoutes);
router.use(deleteRoutes);

module.exports = router;
