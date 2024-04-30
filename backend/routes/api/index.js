const router = require('express').Router();
const adminRouter = require('./admin.js');
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots/index.js');
const reviewsRouter = require('./reviews/index.js');
const bookingsRouter = require('./bookings/index.js');
const reviewImagesRouter = require('./review-images/index.js');
const spotImagesRouter = require('./spot-images/index.js');

const { restoreUser } = require('../../utils/auth.js');

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/admin', adminRouter);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter);

router.use('/reviews', reviewsRouter);

router.use('/bookings', bookingsRouter);

router.use('/review-images', reviewImagesRouter);

router.use('/spot-images', spotImagesRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;
